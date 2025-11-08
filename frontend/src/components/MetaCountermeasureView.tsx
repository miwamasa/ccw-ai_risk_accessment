/**
 * メタ対策表示・生成コンポーネント
 */

import { useState } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { RiskEvaluation, MetaCountermeasure, Countermeasure } from '@/types';

interface MetaCountermeasureViewProps {
  evaluation: RiskEvaluation;
  onMetaCountermeasuresGenerated: (metas: MetaCountermeasure[]) => void;
  onCountermeasuresGenerated: (measures: Countermeasure[]) => void;
}

export const MetaCountermeasureView: React.FC<MetaCountermeasureViewProps> = ({
  evaluation,
  onMetaCountermeasuresGenerated,
  onCountermeasuresGenerated,
}) => {
  const { generateMetaCountermeasures, generateCountermeasuresFromMeta, isLoading, error } = useRiskAssessment();
  const [metaCountermeasures, setMetaCountermeasures] = useState<MetaCountermeasure[]>([]);
  const [expandedMetaIds, setExpandedMetaIds] = useState<Set<string>>(new Set());
  const [generatedCountermeasures, setGeneratedCountermeasures] = useState<Map<string, Countermeasure[]>>(new Map());

  const handleGenerateMetas = async () => {
    try {
      const metas = await generateMetaCountermeasures(evaluation.evaluation_id);
      setMetaCountermeasures(metas);
      onMetaCountermeasuresGenerated(metas);
    } catch (err) {
      console.error('メタ対策生成に失敗しました:', err);
    }
  };

  const handleExpandMeta = async (meta: MetaCountermeasure) => {
    const newExpanded = new Set(expandedMetaIds);

    if (newExpanded.has(meta.meta_id)) {
      newExpanded.delete(meta.meta_id);
      setExpandedMetaIds(newExpanded);
    } else {
      newExpanded.add(meta.meta_id);
      setExpandedMetaIds(newExpanded);

      // まだ具体的対策を生成していない場合は生成する
      if (!generatedCountermeasures.has(meta.meta_id)) {
        try {
          const measures = await generateCountermeasuresFromMeta(meta.meta_id);
          const newMap = new Map(generatedCountermeasures);
          newMap.set(meta.meta_id, measures);
          setGeneratedCountermeasures(newMap);
          onCountermeasuresGenerated(measures);
        } catch (err) {
          console.error('具体的対策生成に失敗しました:', err);
        }
      }
    }
  };

  const getAxisColor = (axis: string) => {
    switch (axis) {
      case '頻度低減':
        return 'axis-frequency';
      case '回避可能性向上':
        return 'axis-avoidability';
      case '過酷度低減':
        return 'axis-severity';
      default:
        return '';
    }
  };

  const getAxisIcon = (axis: string) => {
    switch (axis) {
      case '頻度低減':
        return '📉';
      case '回避可能性向上':
        return '🛡️';
      case '過酷度低減':
        return '💊';
      default:
        return '📋';
    }
  };

  // 3軸ごとにグループ化
  const groupedMetas = {
    '頻度低減': metaCountermeasures.filter(m => m.target_axis === '頻度低減'),
    '回避可能性向上': metaCountermeasures.filter(m => m.target_axis === '回避可能性向上'),
    '過酷度低減': metaCountermeasures.filter(m => m.target_axis === '過酷度低減'),
  };

  return (
    <div className="card">
      <h2>メタ対策の生成</h2>

      <div className="evaluation-summary">
        <h3>リスク評価結果</h3>
        <div className="evaluation-scores">
          <div className="score-item">
            <span className="score-label">過酷度:</span>
            <span className="score-value">{evaluation.severity_score}/5</span>
          </div>
          <div className="score-item">
            <span className="score-label">発生頻度:</span>
            <span className="score-value">{evaluation.frequency_score}/5</span>
          </div>
          <div className="score-item">
            <span className="score-label">回避可能性:</span>
            <span className="score-value">{evaluation.avoidability_score}/5</span>
          </div>
          <div className="score-item">
            <span className="score-label">リスクレベル:</span>
            <span className={`risk-level risk-level-${evaluation.risk_level}`}>
              {evaluation.risk_level}
            </span>
          </div>
        </div>
      </div>

      {metaCountermeasures.length === 0 && (
        <div className="empty-state">
          <p>
            3つの軸（頻度低減、回避可能性向上、過酷度低減）ごとに、抽象的なアプローチ（メタ対策）を生成します。
            これにより、システマティックな対策導出が可能になります。
          </p>
          <button
            onClick={handleGenerateMetas}
            disabled={isLoading}
            className="button button-primary"
          >
            {isLoading ? 'メタ対策を生成中...' : 'メタ対策を生成'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          エラーが発生しました: {error.message}
        </div>
      )}

      {metaCountermeasures.length > 0 && (
        <div className="meta-countermeasures">
          <h3>生成されたメタ対策 ({metaCountermeasures.length}件)</h3>
          <p className="meta-description">
            各メタ対策をクリックすると、具体的な実装レベルの対策に展開されます。
          </p>

          {Object.entries(groupedMetas).map(([axis, metas]) => (
            metas.length > 0 && (
              <div key={axis} className="axis-group">
                <h4 className={`axis-title ${getAxisColor(axis)}`}>
                  <span className="axis-icon">{getAxisIcon(axis)}</span>
                  {axis}
                </h4>

                <div className="meta-list">
                  {metas.map((meta) => (
                    <div key={meta.meta_id} className="meta-card">
                      <div
                        className="meta-header"
                        onClick={() => handleExpandMeta(meta)}
                      >
                        <div className="meta-main">
                          <h5 className="meta-approach">{meta.meta_approach}</h5>
                          {meta.example && (
                            <p className="meta-example">例: {meta.example}</p>
                          )}
                        </div>
                        <div className="meta-badges">
                          {meta.applicability && (
                            <span className={`applicability applicability-${meta.applicability}`}>
                              適用性: {meta.applicability}
                            </span>
                          )}
                          {meta.priority && (
                            <span className="priority">
                              優先度: {meta.priority}/5
                            </span>
                          )}
                        </div>
                        <button className="expand-button">
                          {expandedMetaIds.has(meta.meta_id) ? '▼ 閉じる' : '▶ 具体的対策を見る'}
                        </button>
                      </div>

                      {expandedMetaIds.has(meta.meta_id) && (
                        <div className="concrete-measures">
                          {generatedCountermeasures.has(meta.meta_id) ? (
                            <div className="measures-list">
                              <h6>具体的な対策</h6>
                              {generatedCountermeasures.get(meta.meta_id)!.map((measure, idx) => (
                                <div key={measure.measure_id} className="measure-item">
                                  <div className="measure-number">{idx + 1}</div>
                                  <div className="measure-content">
                                    <p className="measure-description">{measure.description}</p>
                                    <div className="measure-details">
                                      {measure.feasibility && (
                                        <span className={`feasibility feasibility-${measure.feasibility}`}>
                                          実現可能性: {measure.feasibility}
                                        </span>
                                      )}
                                      {measure.implementation_timeline && (
                                        <span className="timeline">
                                          {measure.implementation_timeline}
                                        </span>
                                      )}
                                      {measure.priority && (
                                        <span className="measure-priority">
                                          優先度: {measure.priority}/5
                                        </span>
                                      )}
                                    </div>
                                    {measure.expected_effect && (
                                      <p className="expected-effect">
                                        <strong>期待される効果:</strong> {measure.expected_effect}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="loading-measures">
                              <p>具体的対策を生成中...</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};
