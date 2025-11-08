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

type Step = 'situation' | 'risks' | 'evaluation' | 'countermeasures';

function App() {
  const [step, setStep] = useState<Step>('situation');
  const [situation, setSituation] = useState<RiskSituation | null>(null);
  const [risks, setRisks] = useState<IdentifiedRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<IdentifiedRisk | null>(null);
  const [evaluation, setEvaluation] = useState<RiskEvaluation | null>(null);
  const [countermeasures, setCountermeasures] = useState<Countermeasure[]>([]);

  const handleSituationCreated = (newSituation: RiskSituation) => {
    setSituation(newSituation);
    setStep('risks');
  };

  const handleRisksIdentified = (identifiedRisks: IdentifiedRisk[]) => {
    setRisks(identifiedRisks);
  };

  const handleRiskSelected = (risk: IdentifiedRisk) => {
    setSelectedRisk(risk);
    setStep('evaluation');
  };

  const handleEvaluationCompleted = (newEvaluation: RiskEvaluation) => {
    setEvaluation(newEvaluation);
    setStep('countermeasures');
  };

  const handleCountermeasuresGenerated = (newCountermeasures: Countermeasure[]) => {
    setCountermeasures(newCountermeasures);
  };

  const handleReset = () => {
    setSituation(null);
    setRisks([]);
    setSelectedRisk(null);
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
        <div className={`step ${step === 'countermeasures' ? 'active' : countermeasures.length > 0 ? 'completed' : ''}`}>
          4. 対策導出
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
            onRiskSelected={handleRiskSelected}
          />
        )}

        {step === 'evaluation' && selectedRisk && (
          <RiskEvaluationView
            risk={selectedRisk}
            onEvaluationCompleted={handleEvaluationCompleted}
          />
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
