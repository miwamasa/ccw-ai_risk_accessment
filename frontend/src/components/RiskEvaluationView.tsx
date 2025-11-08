/**
 * リスク評価表示コンポーネント
 */

import { useState, useEffect } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { IdentifiedRisk, RiskEvaluation } from '@/types';

interface RiskEvaluationViewProps {
  risk: IdentifiedRisk;
  onEvaluationCompleted: (evaluation: RiskEvaluation) => void;
}

export const RiskEvaluationView: React.FC<RiskEvaluationViewProps> = ({
  risk,
  onEvaluationCompleted,
}) => {
  const [evaluation, setEvaluation] = useState<RiskEvaluation | null>(null);
  const { evaluateRisk, isLoading, error } = useRiskAssessment();

  const handleEvaluate = async () => {
    try {
      const result = await evaluateRisk(risk.risk_id);
      setEvaluation(result);
      onEvaluationCompleted(result);
    } catch (err) {
      console.error('リスク評価に失敗しました:', err);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case '高':
        return 'risk-high';
      case '中':
        return 'risk-medium';
      case '低':
        return 'risk-low';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <h2>リスク評価</h2>

      <div className="risk-info">
        <div className="risk-header">
          <span className="category-badge">{risk.category}</span>
          <span className="guideword-badge">{risk.guideword}</span>
        </div>
        <p className="risk-description">{risk.risk_description}</p>
      </div>

      {!evaluation && (
        <div className="evaluation-action">
          <p>このリスクを過酷度・発生頻度・回避可能性の3軸で評価します。</p>
          <button
            onClick={handleEvaluate}
            disabled={isLoading}
            className="button button-primary"
          >
            {isLoading ? '評価中...' : 'リスク評価を開始'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          エラーが発生しました: {error.message}
        </div>
      )}

      {evaluation && (
        <div className="evaluation-result">
          <div className={`risk-level-badge ${getRiskLevelColor(evaluation.risk_level)}`}>
            リスクレベル: {evaluation.risk_level}
          </div>

          <div className="evaluation-factors">
            <div className="factor">
              <h3>過酷度</h3>
              <div className="score-bar">
                <div
                  className="score-fill score-severity"
                  style={{ width: `${(evaluation.severity_score / 5) * 100}%` }}
                >
                  {evaluation.severity_score}/5
                </div>
              </div>
              <p className="rationale">{evaluation.severity_rationale}</p>
            </div>

            <div className="factor">
              <h3>発生頻度</h3>
              <div className="score-bar">
                <div
                  className="score-fill score-frequency"
                  style={{ width: `${(evaluation.frequency_score / 5) * 100}%` }}
                >
                  {evaluation.frequency_score}/5
                </div>
              </div>
              <p className="rationale">{evaluation.frequency_rationale}</p>
            </div>

            <div className="factor">
              <h3>回避可能性</h3>
              <div className="score-bar">
                <div
                  className="score-fill score-avoidability"
                  style={{ width: `${(evaluation.avoidability_score / 5) * 100}%` }}
                >
                  {evaluation.avoidability_score}/5
                </div>
              </div>
              <p className="rationale">{evaluation.avoidability_rationale}</p>
            </div>
          </div>

          {evaluation.normalized_score && (
            <div className="normalized-score">
              総合スコア: {evaluation.normalized_score.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
