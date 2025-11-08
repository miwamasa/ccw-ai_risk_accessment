/**
 * リスクアセスメント機能を提供するカスタムフック
 */

import { useState } from 'react';
import { apiClient } from '@/services/api';
import type {
  RiskSituation,
  SituationCreate,
  IdentifiedRisk,
  RiskEvaluation,
  Countermeasure,
} from '@/types';

export const useRiskAssessment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSituation = async (data: SituationCreate): Promise<RiskSituation> => {
    setIsLoading(true);
    setError(null);
    try {
      const situation = await apiClient.createSituation(data);
      return situation;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const identifyRisks = async (situationId: string): Promise<IdentifiedRisk[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const risks = await apiClient.identifyRisks(situationId);
      return risks;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateRisk = async (riskId: string): Promise<RiskEvaluation> => {
    setIsLoading(true);
    setError(null);
    try {
      const evaluation = await apiClient.evaluateRisk(riskId);
      return evaluation;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCountermeasures = async (evaluationId: string): Promise<Countermeasure[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const countermeasures = await apiClient.generateCountermeasures(evaluationId);
      return countermeasures;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createSituation,
    identifyRisks,
    evaluateRisk,
    generateCountermeasures,
  };
};
