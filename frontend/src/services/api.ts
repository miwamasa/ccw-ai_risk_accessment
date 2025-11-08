/**
 * バックエンドAPIとの通信を行うクライアント
 */

import axios, { AxiosInstance } from 'axios';
import type {
  RiskSituation,
  SituationCreate,
  IdentifiedRisk,
  RiskEvaluation,
  Countermeasure,
  MetaCountermeasure,
  RisksListResponse,
  MetaCountermeasuresListResponse,
  CountermeasuresListResponse,
} from '@/types';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // リスク状況関連

  /**
   * 新しいリスク状況を作成
   */
  async createSituation(data: SituationCreate): Promise<RiskSituation> {
    const response = await this.client.post<RiskSituation>('/situations', data);
    return response.data;
  }

  /**
   * リスク状況を取得
   */
  async getSituation(situationId: string): Promise<RiskSituation> {
    const response = await this.client.get<RiskSituation>(`/situations/${situationId}`);
    return response.data;
  }

  /**
   * リスクを特定
   */
  async identifyRisks(situationId: string): Promise<IdentifiedRisk[]> {
    const response = await this.client.post<RisksListResponse>(
      `/situations/${situationId}/identify-risks`
    );
    return response.data.identified_risks;
  }

  /**
   * 状況に関連するリスクを取得
   */
  async getSituationRisks(situationId: string): Promise<IdentifiedRisk[]> {
    const response = await this.client.get<RisksListResponse>(
      `/situations/${situationId}/risks`
    );
    return response.data.identified_risks;
  }

  // リスク評価関連

  /**
   * リスクを評価
   */
  async evaluateRisk(riskId: string): Promise<RiskEvaluation> {
    const response = await this.client.post<RiskEvaluation>(`/risks/${riskId}/evaluate`);
    return response.data;
  }

  /**
   * リスクの評価結果を取得
   */
  async getRiskEvaluation(riskId: string): Promise<RiskEvaluation> {
    const response = await this.client.get<RiskEvaluation>(`/risks/${riskId}/evaluation`);
    return response.data;
  }

  // 対策関連

  /**
   * 対策を生成
   */
  async generateCountermeasures(evaluationId: string): Promise<Countermeasure[]> {
    const response = await this.client.post<CountermeasuresListResponse>(
      `/evaluations/${evaluationId}/generate-countermeasures`
    );
    return response.data.countermeasures;
  }

  /**
   * 評価に関連する対策を取得
   */
  async getCountermeasures(evaluationId: string): Promise<Countermeasure[]> {
    const response = await this.client.get<CountermeasuresListResponse>(
      `/evaluations/${evaluationId}/countermeasures`
    );
    return response.data.countermeasures;
  }

  // メタ対策関連

  /**
   * メタ対策を生成
   */
  async generateMetaCountermeasures(evaluationId: string): Promise<MetaCountermeasure[]> {
    const response = await this.client.post<MetaCountermeasuresListResponse>(
      `/evaluations/${evaluationId}/generate-meta-countermeasures`
    );
    return response.data.meta_countermeasures;
  }

  /**
   * 評価に関連するメタ対策を取得
   */
  async getMetaCountermeasures(evaluationId: string): Promise<MetaCountermeasure[]> {
    const response = await this.client.get<MetaCountermeasuresListResponse>(
      `/evaluations/${evaluationId}/meta-countermeasures`
    );
    return response.data.meta_countermeasures;
  }

  /**
   * メタ対策から具体的対策を生成
   */
  async generateCountermeasuresFromMeta(metaId: string): Promise<Countermeasure[]> {
    const response = await this.client.post<CountermeasuresListResponse>(
      `/evaluations/meta/${metaId}/generate-countermeasures`
    );
    return response.data.countermeasures;
  }
}

export const apiClient = new APIClient();
