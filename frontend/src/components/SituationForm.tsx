/**
 * リスク状況入力フォームコンポーネント
 */

import { useState } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import type { RiskSituation } from '@/types';

interface SituationFormProps {
  onSituationCreated: (situation: RiskSituation) => void;
}

export const SituationForm: React.FC<SituationFormProps> = ({ onSituationCreated }) => {
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [aiType, setAiType] = useState('');
  const [deploymentStage, setDeploymentStage] = useState('');

  const { createSituation, isLoading, error } = useRiskAssessment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const situation = await createSituation({
        description,
        industry: industry || undefined,
        ai_type: aiType || undefined,
        deployment_stage: deploymentStage || undefined,
      });
      onSituationCreated(situation);
    } catch (err) {
      console.error('リスク状況の作成に失敗しました:', err);
    }
  };

  return (
    <div className="card">
      <h2>リスク状況の入力</h2>
      <p className="description">
        AIシステムに関する状況を記述してください。具体的なシナリオや発生した（想定される）問題を含めてください。
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="description" className="required">
            リスク状況の記述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: 自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。"
            rows={6}
            required
            maxLength={1000}
            className="textarea"
          />
          <small>{description.length}/1000文字</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="industry">業界</label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例: 自動車"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="aiType">AIの種類</label>
            <input
              type="text"
              id="aiType"
              value={aiType}
              onChange={(e) => setAiType(e.target.value)}
              placeholder="例: 自動運転"
              className="input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deploymentStage">開発段階</label>
          <select
            id="deploymentStage"
            value={deploymentStage}
            onChange={(e) => setDeploymentStage(e.target.value)}
            className="select"
          >
            <option value="">選択してください</option>
            <option value="研究開発">研究開発</option>
            <option value="実験段階">実験段階</option>
            <option value="ベータテスト">ベータテスト</option>
            <option value="本番運用">本番運用</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            エラーが発生しました: {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="button button-primary"
        >
          {isLoading ? '作成中...' : '次へ: リスク特定'}
        </button>
      </form>
    </div>
  );
};
