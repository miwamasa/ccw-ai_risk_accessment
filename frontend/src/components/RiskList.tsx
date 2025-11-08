/**
 * リスク一覧表示・特定コンポーネント（複数選択対応）
 */

import { useState } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { RiskSituation, IdentifiedRisk } from '@/types';

interface RiskListProps {
  situation: RiskSituation;
  risks: IdentifiedRisk[];
  onRisksIdentified: (risks: IdentifiedRisk[]) => void;
  onRisksSelected: (risks: IdentifiedRisk[]) => void;
}

export const RiskList: React.FC<RiskListProps> = ({
  situation,
  risks,
  onRisksIdentified,
  onRisksSelected,
}) => {
  const { identifyRisks, isLoading, error } = useRiskAssessment();
  const [selectedRiskIds, setSelectedRiskIds] = useState<Set<string>>(new Set());

  const handleIdentify = async () => {
    try {
      const identifiedRisks = await identifyRisks(situation.situation_id);
      onRisksIdentified(identifiedRisks);
    } catch (err) {
      console.error('リスク特定に失敗しました:', err);
    }
  };

  const handleRiskToggle = (riskId: string) => {
    const newSelected = new Set(selectedRiskIds);
    if (newSelected.has(riskId)) {
      newSelected.delete(riskId);
    } else {
      newSelected.add(riskId);
    }
    setSelectedRiskIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRiskIds.size === risks.length) {
      setSelectedRiskIds(new Set());
    } else {
      setSelectedRiskIds(new Set(risks.map(r => r.risk_id)));
    }
  };

  const handleEvaluateSelected = () => {
    const selectedRisks = risks.filter(r => selectedRiskIds.has(r.risk_id));
    onRisksSelected(selectedRisks);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'データ':
        return 'category-data';
      case 'モデル':
        return 'category-model';
      case '運用':
        return 'category-operation';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <h2>リスクの特定</h2>

      <div className="situation-summary">
        <h3>リスク状況</h3>
        <p>{situation.description}</p>
        {situation.industry && <span className="tag">業界: {situation.industry}</span>}
        {situation.ai_type && <span className="tag">AIの種類: {situation.ai_type}</span>}
      </div>

      {risks.length === 0 && (
        <div className="empty-state">
          <p>
            13種類のガイドワードに基づいて、潜在的なリスクを自動的に特定します。
          </p>
          <button
            onClick={handleIdentify}
            disabled={isLoading}
            className="button button-primary"
          >
            {isLoading ? 'リスクを特定中...' : 'リスク特定を開始'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          エラーが発生しました: {error.message}
        </div>
      )}

      {risks.length > 0 && (
        <>
          <div className="risk-summary">
            <h3>特定されたリスク ({risks.length}件)</h3>
            <div className="risk-stats">
              <span className="stat">
                データ: {risks.filter(r => r.category === 'データ').length}件
              </span>
              <span className="stat">
                モデル: {risks.filter(r => r.category === 'モデル').length}件
              </span>
              <span className="stat">
                運用: {risks.filter(r => r.category === '運用').length}件
              </span>
            </div>
          </div>

          <div className="selection-controls">
            <div className="selection-info">
              <span>{selectedRiskIds.size}件選択中</span>
            </div>
            <div className="selection-buttons">
              <button
                onClick={handleSelectAll}
                className="button button-secondary"
              >
                {selectedRiskIds.size === risks.length ? 'すべて解除' : 'すべて選択'}
              </button>
              <button
                onClick={handleEvaluateSelected}
                disabled={selectedRiskIds.size === 0}
                className="button button-primary"
              >
                選択したリスクを評価 ({selectedRiskIds.size}件)
              </button>
            </div>
          </div>

          <div className="risk-list">
            {risks.map((risk) => (
              <div
                key={risk.risk_id}
                className={`risk-card ${selectedRiskIds.has(risk.risk_id) ? 'selected' : ''}`}
              >
                <div className="risk-checkbox">
                  <input
                    type="checkbox"
                    id={`risk-${risk.risk_id}`}
                    checked={selectedRiskIds.has(risk.risk_id)}
                    onChange={() => handleRiskToggle(risk.risk_id)}
                  />
                  <label htmlFor={`risk-${risk.risk_id}`}></label>
                </div>
                <div className="risk-content" onClick={() => handleRiskToggle(risk.risk_id)}>
                  <div className="risk-header">
                    <span className={`category-badge ${getCategoryColor(risk.category)}`}>
                      {risk.category}
                    </span>
                    <span className="guideword-badge">{risk.guideword}</span>
                    {risk.confidence_score && (
                      <span className="confidence">
                        信頼度: {Math.round(risk.confidence_score * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="risk-description">{risk.risk_description}</p>
                  {risk.affected_area && (
                    <p className="affected-area">影響範囲: {risk.affected_area}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
