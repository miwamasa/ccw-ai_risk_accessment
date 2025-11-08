/**
 * 対策一覧表示コンポーネント
 */

import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { RiskEvaluation, Countermeasure } from '@/types';

interface CountermeasureListProps {
  evaluation: RiskEvaluation;
  countermeasures: Countermeasure[];
  onCountermeasuresGenerated: (countermeasures: Countermeasure[]) => void;
  onReset: () => void;
}

export const CountermeasureList: React.FC<CountermeasureListProps> = ({
  evaluation,
  countermeasures,
  onCountermeasuresGenerated,
  onReset,
}) => {
  const { generateCountermeasures, isLoading, error } = useRiskAssessment();

  const handleGenerate = async () => {
    try {
      const measures = await generateCountermeasures(evaluation.evaluation_id);
      onCountermeasuresGenerated(measures);
    } catch (err) {
      console.error('対策導出に失敗しました:', err);
    }
  };

  const getStrategyColor = (strategyType: string) => {
    switch (strategyType) {
      case '過酷度低減':
        return 'strategy-severity';
      case '発生頻度低減':
        return 'strategy-frequency';
      case '回避可能性向上':
        return 'strategy-avoidability';
      default:
        return '';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) return '🔴';
    if (priority >= 3) return '🟠';
    return '🟢';
  };

  return (
    <div className="card">
      <h2>対策の導出</h2>

      <div className="evaluation-summary">
        <h3>評価結果</h3>
        <div className="summary-grid">
          <div>過酷度: {evaluation.severity_score}/5</div>
          <div>発生頻度: {evaluation.frequency_score}/5</div>
          <div>回避可能性: {evaluation.avoidability_score}/5</div>
          <div className="risk-level">リスクレベル: {evaluation.risk_level}</div>
        </div>
      </div>

      {countermeasures.length === 0 && (
        <div className="empty-state">
          <p>
            評価結果に基づいて、3つのアプローチから効果的な対策を導出します。
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="button button-primary"
          >
            {isLoading ? '対策を生成中...' : '対策生成を開始'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          エラーが発生しました: {error.message}
        </div>
      )}

      {countermeasures.length > 0 && (
        <>
          <div className="countermeasure-summary">
            <h3>推奨対策 ({countermeasures.length}件)</h3>
            <div className="strategy-stats">
              <span className="stat">
                過酷度低減: {countermeasures.filter(c => c.strategy_type === '過酷度低減').length}件
              </span>
              <span className="stat">
                発生頻度低減: {countermeasures.filter(c => c.strategy_type === '発生頻度低減').length}件
              </span>
              <span className="stat">
                回避可能性向上: {countermeasures.filter(c => c.strategy_type === '回避可能性向上').length}件
              </span>
            </div>
          </div>

          <div className="countermeasure-list">
            {countermeasures
              .sort((a, b) => (b.priority || 0) - (a.priority || 0))
              .map((measure) => (
                <div key={measure.measure_id} className="countermeasure-card">
                  <div className="countermeasure-header">
                    <span className={`strategy-badge ${getStrategyColor(measure.strategy_type)}`}>
                      {measure.strategy_type}
                    </span>
                    {measure.priority && (
                      <span className="priority">
                        {getPriorityIcon(measure.priority)} 優先度: {measure.priority}/5
                      </span>
                    )}
                  </div>

                  <p className="countermeasure-description">{measure.description}</p>

                  <div className="countermeasure-details">
                    {measure.feasibility && (
                      <div className="detail">
                        <strong>実現可能性:</strong> {measure.feasibility}
                      </div>
                    )}
                    {measure.implementation_timeline && (
                      <div className="detail">
                        <strong>実装期間:</strong> {measure.implementation_timeline}
                      </div>
                    )}
                    {measure.expected_effect && (
                      <div className="detail">
                        <strong>期待される効果:</strong> {measure.expected_effect}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="action-buttons">
            <button onClick={onReset} className="button button-secondary">
              新しいアセスメントを開始
            </button>
          </div>
        </>
      )}
    </div>
  );
};
