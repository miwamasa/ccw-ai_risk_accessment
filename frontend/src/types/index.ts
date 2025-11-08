/**
 * AIリスクアセスメントシステムの型定義
 */

export interface RiskSituation {
  situation_id: string;
  description: string;
  industry?: string;
  ai_type?: string;
  deployment_stage?: string;
  created_at: string;
  updated_at: string;
}

export interface SituationCreate {
  description: string;
  industry?: string;
  ai_type?: string;
  deployment_stage?: string;
}

export interface IdentifiedRisk {
  risk_id: string;
  situation_id: string;
  category: 'データ' | 'モデル' | '運用';
  guideword: string;
  risk_description: string;
  affected_area?: string;
  confidence_score?: number;
}

export interface RiskEvaluation {
  evaluation_id: string;
  risk_id: string;
  severity_score: number;
  severity_rationale?: string;
  frequency_score: number;
  frequency_rationale?: string;
  avoidability_score: number;
  avoidability_rationale?: string;
  risk_level: '高' | '中' | '低';
  normalized_score?: number;
  evaluated_at: string;
}

export interface Countermeasure {
  measure_id: string;
  evaluation_id: string;
  strategy_type: '過酷度低減' | '発生頻度低減' | '回避可能性向上';
  description: string;
  priority?: number;
  feasibility?: '高' | '中' | '低';
  implementation_timeline?: string;
  expected_effect?: string;
}

export interface RisksListResponse {
  identified_risks: IdentifiedRisk[];
}

export interface CountermeasuresListResponse {
  countermeasures: Countermeasure[];
}
