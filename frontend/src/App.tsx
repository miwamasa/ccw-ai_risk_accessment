/**
 * メインアプリケーションコンポーネント
 */

import { useState } from 'react';
import { SituationForm } from './components/SituationForm';
import { RiskList } from './components/RiskList';
import { RiskEvaluationView } from './components/RiskEvaluationView';
import { MultiRiskEvaluationView } from './components/MultiRiskEvaluationView';
import { MetaCountermeasureView } from './components/MetaCountermeasureView';
import { CountermeasureList } from './components/CountermeasureList';
import type {
  RiskSituation,
  IdentifiedRisk,
  RiskEvaluation,
  MetaCountermeasure,
  Countermeasure,
} from './types';
import './App.css';

type Step = 'situation' | 'risks' | 'evaluation' | 'countermeasures';

function App() {
  const [step, setStep] = useState<Step>('situation');
  const [situation, setSituation] = useState<RiskSituation | null>(null);
  const [risks, setRisks] = useState<IdentifiedRisk[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<IdentifiedRisk[]>([]);
  const [evaluations, setEvaluations] = useState<RiskEvaluation[]>([]);
  const [metaCountermeasures, setMetaCountermeasures] = useState<MetaCountermeasure[]>([]);
  const [countermeasures, setCountermeasures] = useState<Countermeasure[]>([]);

  const handleSituationCreated = (newSituation: RiskSituation) => {
    setSituation(newSituation);
    setStep('risks');
  };

  const handleRisksIdentified = (identifiedRisks: IdentifiedRisk[]) => {
    setRisks(identifiedRisks);
  };

  const handleRisksSelected = (risks: IdentifiedRisk[]) => {
    setSelectedRisks(risks);
    setStep('evaluation');
  };

  const handleEvaluationCompleted = (newEvaluation: RiskEvaluation) => {
    setEvaluations([newEvaluation]);
  };

  const handleEvaluationsCompleted = (newEvaluations: RiskEvaluation[]) => {
    setEvaluations(newEvaluations);
  };

  const handleIntegratedMetasGenerated = (metas: MetaCountermeasure[]) => {
    setMetaCountermeasures(metas);
  };

  const handleCountermeasuresGenerated = (newCountermeasures: Countermeasure[]) => {
    setCountermeasures([...countermeasures, ...newCountermeasures]);
  };

  const handleReset = () => {
    setSituation(null);
    setRisks([]);
    setSelectedRisks([]);
    setEvaluations([]);
    setMetaCountermeasures([]);
    setCountermeasures([]);
    setStep('situation');
  };

  // ナビゲーション機能：ステップに移動
  const canNavigateToStep = (targetStep: Step): boolean => {
    switch (targetStep) {
      case 'situation':
        return true;
      case 'risks':
        return situation !== null;
      case 'evaluation':
        return risks.length > 0 && selectedRisks.length > 0;
      case 'countermeasures':
        return evaluations.length > 0;
      default:
        return false;
    }
  };

  const navigateToStep = (targetStep: Step) => {
    if (canNavigateToStep(targetStep)) {
      setStep(targetStep);
    }
  };

  // JSON保存・読み込み機能
  interface SessionData {
    version: string;
    timestamp: string;
    situation: RiskSituation | null;
    risks: IdentifiedRisk[];
    selectedRisks: IdentifiedRisk[];
    evaluations: RiskEvaluation[];
    metaCountermeasures: MetaCountermeasure[];
    countermeasures: Countermeasure[];
    currentStep: Step;
  }

  const saveSessionToJson = () => {
    const sessionData: SessionData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      situation,
      risks,
      selectedRisks,
      evaluations,
      metaCountermeasures,
      countermeasures,
      currentStep: step,
    };

    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-risk-assessment-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadSessionFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sessionData = JSON.parse(e.target?.result as string) as SessionData;

        // データを復元
        if (sessionData.situation) setSituation(sessionData.situation);
        if (sessionData.risks) setRisks(sessionData.risks);
        if (sessionData.selectedRisks) setSelectedRisks(sessionData.selectedRisks);
        if (sessionData.evaluations) setEvaluations(sessionData.evaluations);
        if (sessionData.metaCountermeasures) setMetaCountermeasures(sessionData.metaCountermeasures);
        if (sessionData.countermeasures) setCountermeasures(sessionData.countermeasures);
        if (sessionData.currentStep) setStep(sessionData.currentStep);

        alert('セッションデータを読み込みました！');
      } catch (err) {
        alert('JSONファイルの読み込みに失敗しました: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);

    // Reset input value to allow loading the same file again
    event.target.value = '';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AIリスクアセスメントシステム</h1>
        <p className="subtitle">LLMを活用したAIリスクの体系的な評価・対策システム</p>

        <div className="header-actions">
          <button onClick={saveSessionToJson} className="button button-secondary button-small">
            💾 セッションを保存
          </button>
          <label htmlFor="load-session" className="button button-secondary button-small">
            📂 セッションを読み込み
          </label>
          <input
            id="load-session"
            type="file"
            accept=".json"
            onChange={loadSessionFromJson}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <div className="progress-bar">
        <div
          className={`step ${step === 'situation' ? 'active' : step !== 'situation' ? 'completed' : ''} ${canNavigateToStep('situation') ? 'clickable' : ''}`}
          onClick={() => navigateToStep('situation')}
        >
          1. 状況入力
        </div>
        <div
          className={`step ${step === 'risks' ? 'active' : risks.length > 0 ? 'completed' : ''} ${canNavigateToStep('risks') ? 'clickable' : ''}`}
          onClick={() => navigateToStep('risks')}
        >
          2. リスク特定
        </div>
        <div
          className={`step ${step === 'evaluation' ? 'active' : evaluations.length > 0 ? 'completed' : ''} ${canNavigateToStep('evaluation') ? 'clickable' : ''}`}
          onClick={() => navigateToStep('evaluation')}
        >
          3. 評価・メタ対策統合
        </div>
        <div
          className={`step ${step === 'countermeasures' ? 'active' : countermeasures.length > 0 ? 'completed' : ''} ${canNavigateToStep('countermeasures') ? 'clickable' : ''}`}
          onClick={() => navigateToStep('countermeasures')}
        >
          4. 具体的対策
        </div>
      </div>

      <main className="main-content">
        {step === 'situation' && (
          <SituationForm onSituationCreated={handleSituationCreated} />
        )}

        {step === 'risks' && situation && (
          <>
            <div className="navigation-bar">
              <button onClick={() => navigateToStep('situation')} className="button button-secondary">
                ← 状況入力に戻る
              </button>
            </div>
            <RiskList
              situation={situation}
              risks={risks}
              onRisksIdentified={handleRisksIdentified}
              onRisksSelected={handleRisksSelected}
            />
          </>
        )}

        {step === 'evaluation' && selectedRisks.length > 0 && (
          <>
            <div className="navigation-bar">
              <button onClick={() => navigateToStep('risks')} className="button button-secondary">
                ← リスク特定に戻る
              </button>
            </div>
            {selectedRisks.length === 1 ? (
              <RiskEvaluationView
                risk={selectedRisks[0]}
                onEvaluationCompleted={handleEvaluationCompleted}
              />
            ) : (
              <MultiRiskEvaluationView
                risks={selectedRisks}
                onEvaluationsCompleted={handleEvaluationsCompleted}
                onIntegratedMetasGenerated={handleIntegratedMetasGenerated}
                onCountermeasuresGenerated={handleCountermeasuresGenerated}
              />
            )}
          </>
        )}

        {step === 'countermeasures' && evaluations.length > 0 && (
          <>
            <div className="navigation-bar">
              <button onClick={() => navigateToStep('evaluation')} className="button button-secondary">
                ← 評価・メタ対策に戻る
              </button>
            </div>
            <CountermeasureList
              evaluation={evaluations[0]}
              countermeasures={countermeasures}
              onCountermeasuresGenerated={handleCountermeasuresGenerated}
              onReset={handleReset}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 AIリスクアセスメントシステム</p>
      </footer>
    </div>
  );
}

export default App;
