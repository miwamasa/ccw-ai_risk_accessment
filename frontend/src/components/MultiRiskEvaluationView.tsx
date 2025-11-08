/**
 * 複数リスク評価・メタ対策統合コンポーネント
 */

import { useState } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { IdentifiedRisk, RiskEvaluation, MetaCountermeasure, Countermeasure } from '@/types';

interface MultiRiskEvaluationViewProps {
  risks: IdentifiedRisk[];
  onEvaluationsCompleted: (evaluations: RiskEvaluation[]) => void;
  onIntegratedMetasGenerated: (metas: MetaCountermeasure[]) => void;
  onCountermeasuresGenerated: (measures: Countermeasure[]) => void;
}

interface EvaluationProgress {
  riskId: string;
  status: 'pending' | 'evaluating' | 'completed' | 'error';
  evaluation?: RiskEvaluation;
  error?: string;
}

export const MultiRiskEvaluationView: React.FC<MultiRiskEvaluationViewProps> = ({
  risks,
  onEvaluationsCompleted,
  onIntegratedMetasGenerated,
  onCountermeasuresGenerated,
}) => {
  const { evaluateRisk, generateMetaCountermeasures, generateCountermeasuresFromMeta, isLoading } = useRiskAssessment();
  const [progress, setProgress] = useState<Map<string, EvaluationProgress>>(new Map());
  const [evaluations, setEvaluations] = useState<RiskEvaluation[]>([]);
  const [metaCountermeasures, setMetaCountermeasures] = useState<MetaCountermeasure[]>([]);
  const [expandedMetaIds, setExpandedMetaIds] = useState<Set<string>>(new Set());
  const [generatedCountermeasures, setGeneratedCountermeasures] = useState<Map<string, Countermeasure[]>>(new Map());
  const [evaluationStarted, setEvaluationStarted] = useState(false);

  const handleEvaluateAll = async () => {
    setEvaluationStarted(true);
    const newProgress = new Map<string, EvaluationProgress>();
    risks.forEach(risk => {
      newProgress.set(risk.risk_id, { riskId: risk.risk_id, status: 'pending' });
    });
    setProgress(newProgress);

    const completedEvaluations: RiskEvaluation[] = [];

    // 各リスクを順次評価
    for (const risk of risks) {
      setProgress(prev => {
        const updated = new Map(prev);
        updated.set(risk.risk_id, { riskId: risk.risk_id, status: 'evaluating' });
        return updated;
      });

      try {
        const evaluation = await evaluateRisk(risk.risk_id);
        completedEvaluations.push(evaluation);

        setProgress(prev => {
          const updated = new Map(prev);
          updated.set(risk.risk_id, {
            riskId: risk.risk_id,
            status: 'completed',
            evaluation,
          });
          return updated;
        });
      } catch (err) {
        setProgress(prev => {
          const updated = new Map(prev);
          updated.set(risk.risk_id, {
            riskId: risk.risk_id,
            status: 'error',
            error: (err as Error).message,
          });
          return updated;
        });
      }
    }

    setEvaluations(completedEvaluations);
    onEvaluationsCompleted(completedEvaluations);
  };

  const handleGenerateIntegratedMetas = async () => {
    const allMetas: MetaCountermeasure[] = [];

    // 各評価結果からメタ対策を生成
    for (const evaluation of evaluations) {
      try {
        const metas = await generateMetaCountermeasures(evaluation.evaluation_id);
        allMetas.push(...metas);
      } catch (err) {
        console.error('メタ対策生成に失敗しました:', err);
      }
    }

    // メタ対策を統合（類似のものをマージ）
    const integrated = integrateMetaCountermeasures(allMetas);
    setMetaCountermeasures(integrated);
    onIntegratedMetasGenerated(integrated);
  };

  const integrateMetaCountermeasures = (metas: MetaCountermeasure[]): MetaCountermeasure[] => {
    // 軸ごとにグループ化
    const grouped = new Map<string, MetaCountermeasure[]>();
    metas.forEach(meta => {
      const key = `${meta.target_axis}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(meta);
    });

    // 各グループ内で類似のアプローチを統合
    const integrated: MetaCountermeasure[] = [];
    grouped.forEach((metaGroup) => {
      // アプローチの類似度でグループ化（簡易版：完全一致）
      const approachMap = new Map<string, MetaCountermeasure[]>();
      metaGroup.forEach(meta => {
        if (!approachMap.has(meta.meta_approach)) {
          approachMap.set(meta.meta_approach, []);
        }
        approachMap.get(meta.meta_approach)!.push(meta);
      });

      // 各アプローチグループから代表を選択（優先度が高いもの、または最初のもの）
      approachMap.forEach((similarMetas) => {
        if (similarMetas.length > 0) {
          // 優先度が最も高いものを選択
          const representative = similarMetas.reduce((best, current) => {
            const currentPriority = current.priority || 0;
            const bestPriority = best.priority || 0;
            return currentPriority > bestPriority ? current : best;
          }, similarMetas[0]);

          integrated.push(representative);
        }
      });
    });

    return integrated;
  };

  const handleExpandMeta = async (meta: MetaCountermeasure) => {
    const newExpanded = new Set(expandedMetaIds);

    if (newExpanded.has(meta.meta_id)) {
      newExpanded.delete(meta.meta_id);
      setExpandedMetaIds(newExpanded);
    } else {
      newExpanded.add(meta.meta_id);
      setExpandedMetaIds(newExpanded);

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

  const groupedMetas = {
    '頻度低減': metaCountermeasures.filter(m => m.target_axis === '頻度低減'),
    '回避可能性向上': metaCountermeasures.filter(m => m.target_axis === '回避可能性向上'),
    '過酷度低減': metaCountermeasures.filter(m => m.target_axis === '過酷度低減'),
  };

  const getRiskById = (riskId: string) => risks.find(r => r.risk_id === riskId);

  return (
    <div className="card">
      <h2>複数リスクの評価とメタ対策統合</h2>

      <div className="multi-risk-summary">
        <h3>選択されたリスク ({risks.length}件)</h3>
        <div className="risk-list-compact">
          {risks.map((risk) => (
            <div key={risk.risk_id} className="risk-item-compact">
              <span className={`category-badge category-${risk.category}`}>{risk.category}</span>
              <span className="risk-text">{risk.risk_description}</span>
            </div>
          ))}
        </div>
      </div>

      {!evaluationStarted && (
        <div className="evaluation-action">
          <p>選択された{risks.length}件のリスクを評価し、メタ対策を統合的に生成します。</p>
          <button
            onClick={handleEvaluateAll}
            disabled={isLoading}
            className="button button-primary"
          >
            すべてのリスクを評価
          </button>
        </div>
      )}

      {evaluationStarted && progress.size > 0 && (
        <div className="evaluation-progress">
          <h3>評価の進行状況</h3>
          {risks.map((risk) => {
            const p = progress.get(risk.risk_id);
            if (!p) return null;

            return (
              <div key={risk.risk_id} className={`progress-item status-${p.status}`}>
                <div className="progress-header">
                  <span className="progress-icon">
                    {p.status === 'pending' && '⏳'}
                    {p.status === 'evaluating' && '🔄'}
                    {p.status === 'completed' && '✅'}
                    {p.status === 'error' && '❌'}
                  </span>
                  <span className="risk-description-short">{risk.risk_description}</span>
                </div>
                {p.status === 'completed' && p.evaluation && (
                  <div className="evaluation-result-compact">
                    <span className={`risk-level risk-level-${p.evaluation.risk_level}`}>
                      {p.evaluation.risk_level}
                    </span>
                    <span>過酷度: {p.evaluation.severity_score}/5</span>
                    <span>頻度: {p.evaluation.frequency_score}/5</span>
                    <span>回避可能性: {p.evaluation.avoidability_score}/5</span>
                  </div>
                )}
                {p.status === 'error' && (
                  <div className="error-text">エラー: {p.error}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {evaluations.length === risks.length && metaCountermeasures.length === 0 && (
        <div className="integration-action">
          <h3>メタ対策の統合生成</h3>
          <p>
            {evaluations.length}件のリスク評価が完了しました。
            メタ対策を生成し、重複するアプローチを統合します。
          </p>
          <button
            onClick={handleGenerateIntegratedMetas}
            disabled={isLoading}
            className="button button-primary"
          >
            {isLoading ? '統合メタ対策を生成中...' : '統合メタ対策を生成'}
          </button>
        </div>
      )}

      {metaCountermeasures.length > 0 && (
        <div className="meta-countermeasures">
          <h3>統合されたメタ対策 ({metaCountermeasures.length}件)</h3>
          <p className="meta-description">
            複数のリスクから生成されたメタ対策を統合し、重複を排除しました。
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
