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
        <div className={`step ${step === 'evaluation' ? 'active' : evaluations.length > 0 ? 'completed' : ''}`}>
          3. 評価・メタ対策統合
        </div>
        <div className={`step ${step === 'countermeasures' ? 'active' : countermeasures.length > 0 ? 'completed' : ''}`}>
          4. 具体的対策
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
          selectedRisks.length === 1 ? (
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
          )
        )}

        {step === 'countermeasures' && evaluations.length > 0 && (
          <CountermeasureList
            evaluation={evaluations[0]}
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
