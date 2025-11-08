/**
 * メインアプリケーションコンポーネント
 */

import { useState } from 'react';
import { SituationForm } from './components/SituationForm';
import { RiskList } from './components/RiskList';
import { RiskEvaluationView } from './components/RiskEvaluationView';
import { CountermeasureList } from './components/CountermeasureList';
import type {
  RiskSituation,
  IdentifiedRisk,
  RiskEvaluation,
  Countermeasure,
} from './types';
import './App.css';

type Step = 'situation' | 'risks' | 'evaluation' | 'meta-countermeasures' | 'countermeasures';

function App() {
  const [step, setStep] = useState<Step>('situation');
  const [situation, setSituation] = useState<RiskSituation | null>(null);
  const [risks, setRisks] = useState<IdentifiedRisk[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<IdentifiedRisk[]>([]);
  const [evaluation, setEvaluation] = useState<RiskEvaluation | null>(null);
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
    // 最初のリスクを評価（後で複数対応に変更）
    setStep('evaluation');
  };

  const handleEvaluationCompleted = (newEvaluation: RiskEvaluation) => {
    setEvaluation(newEvaluation);
    setStep('meta-countermeasures');
  };

  const handleCountermeasuresGenerated = (newCountermeasures: Countermeasure[]) => {
    setCountermeasures(newCountermeasures);
  };

  const handleReset = () => {
    setSituation(null);
    setRisks([]);
    setSelectedRisks([]);
    setEvaluation(null);
    setCountermeasures([]);
    setStep('situation');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AIリスクアセスメントシステム</h1>
        <p className="subtitle">LLMを活用したAIリスクの体系的な評価・対策システム</p>
      </header>

      <div className="progress-bar">
        <div className={`step ${step === 'situation' ? 'active' : step !== 'situation' ? 'completed' : ''}`}>
          1. 状況入力
        </div>
        <div className={`step ${step === 'risks' ? 'active' : risks.length > 0 ? 'completed' : ''}`}>
          2. リスク特定
        </div>
        <div className={`step ${step === 'evaluation' ? 'active' : evaluation ? 'completed' : ''}`}>
          3. リスク評価
        </div>
        <div className={`step ${step === 'meta-countermeasures' ? 'active' : (step === 'countermeasures' || countermeasures.length > 0) ? 'completed' : ''}`}>
          4. メタ対策
        </div>
        <div className={`step ${step === 'countermeasures' ? 'active' : countermeasures.length > 0 ? 'completed' : ''}`}>
          5. 具体的対策
        </div>
      </div>

      <main className="main-content">
        {step === 'situation' && (
          <SituationForm onSituationCreated={handleSituationCreated} />
        )}

        {step === 'risks' && situation && (
          <RiskList
            situation={situation}
            risks={risks}
            onRisksIdentified={handleRisksIdentified}
            onRisksSelected={handleRisksSelected}
          />
        )}

        {step === 'evaluation' && selectedRisks.length > 0 && (
          <RiskEvaluationView
            risk={selectedRisks[0]}
            onEvaluationCompleted={handleEvaluationCompleted}
          />
        )}

        {step === 'meta-countermeasures' && evaluation && (
          <div className="card">
            <h2>メタ対策の生成</h2>
            <p>メタ対策機能は現在実装中です...</p>
            <button onClick={() => setStep('countermeasures')} className="button button-primary">
              対策生成へ進む
            </button>
          </div>
        )}

        {step === 'countermeasures' && evaluation && (
          <CountermeasureList
            evaluation={evaluation}
            countermeasures={countermeasures}
            onCountermeasuresGenerated={handleCountermeasuresGenerated}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 AIリスクアセスメントシステム</p>
      </footer>
    </div>
  );
}

export default App;
