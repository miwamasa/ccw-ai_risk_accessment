"""Risk evaluation service."""

import json
import re
from typing import Dict
from pydantic import BaseModel
from app.models import IdentifiedRisk, RiskEvaluation
from app.llm.client import LLMClient
from app.llm.prompts import RiskEvaluationPrompt


class SeverityScore(BaseModel):
    """過酷度スコア"""
    score: int
    rationale: str


class FrequencyScore(BaseModel):
    """発生頻度スコア"""
    score: int
    rationale: str


class AvoidabilityScore(BaseModel):
    """回避可能性スコア"""
    score: int
    rationale: str


class RiskEvaluationService:
    """リスク評価サービス

    過酷度・発生頻度・回避可能性の3軸でリスクを評価する。
    """

    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    async def evaluate_risk(
        self,
        risk: IdentifiedRisk
    ) -> RiskEvaluation:
        """リスクを評価する

        Args:
            risk: 評価対象のリスク

        Returns:
            評価結果
        """
        # 3つの因子を評価
        severity = await self._evaluate_severity(risk)
        frequency = await self._evaluate_frequency(risk)
        avoidability = await self._evaluate_avoidability(risk)

        # リスクレベルを計算
        risk_level = self._calculate_risk_level(
            severity.score,
            frequency.score,
            avoidability.score
        )

        # 正規化スコアを計算
        normalized_score = self._calculate_normalized_score(
            severity.score,
            frequency.score,
            avoidability.score
        )

        return RiskEvaluation(
            risk_id=risk.risk_id,
            severity_score=severity.score,
            severity_rationale=severity.rationale,
            frequency_score=frequency.score,
            frequency_rationale=frequency.rationale,
            avoidability_score=avoidability.score,
            avoidability_rationale=avoidability.rationale,
            risk_level=risk_level,
            normalized_score=normalized_score
        )

    async def _evaluate_severity(
        self,
        risk: IdentifiedRisk
    ) -> SeverityScore:
        """過酷度を評価"""
        prompt = f"""# タスク
以下のリスクについて、過酷度（被害の深刻さ）を1-5のスケールで評価してください。

# リスク情報
{risk.risk_description}

# 評価基準
5: 死亡・重傷、重大な権利侵害
4: 軽傷、経済的損失（大）
3: 不快・不便、経済的損失（中）
2: 軽微な不便、経済的損失（小）
1: 実害なし

# 出力形式
{{
  "severity_score": <1-5の整数>,
  "rationale": "評価の根拠を3-5文で説明"
}}

# 評価時の考慮点
- 最悪シナリオを想定する
- 直接的・間接的な影響の両方を考慮する
- 影響を受ける人数と被害の深刻度を総合的に判断する
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt=RiskEvaluationPrompt.SYSTEM_PROMPT
        )

        data = self._parse_json_response(response)

        return SeverityScore(
            score=data["severity_score"],
            rationale=data["rationale"]
        )

    async def _evaluate_frequency(
        self,
        risk: IdentifiedRisk
    ) -> FrequencyScore:
        """発生頻度を評価"""
        prompt = f"""# タスク
以下のリスクについて、発生頻度を1-5のスケールで評価してください。

# リスク情報
{risk.risk_description}

# 評価基準
5: ほぼ確実に発生 (>50%)
4: 頻繁に発生 (10-50%)
3: 時々発生 (1-10%)
2: まれに発生 (0.1-1%)
1: ほとんど発生しない (<0.1%)

# 出力形式
{{
  "frequency_score": <1-5の整数>,
  "rationale": "評価の根拠を3-5文で説明"
}}

# 評価時の考慮点
- 類似システムでの実績事例を参照する
- トリガーとなる条件の出現頻度を考慮する
- 継続的な運用期間での累積確率を推定する
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt=RiskEvaluationPrompt.SYSTEM_PROMPT
        )

        data = self._parse_json_response(response)

        return FrequencyScore(
            score=data["frequency_score"],
            rationale=data["rationale"]
        )

    async def _evaluate_avoidability(
        self,
        risk: IdentifiedRisk
    ) -> AvoidabilityScore:
        """回避可能性を評価"""
        prompt = f"""# タスク
以下のリスクについて、回避可能性を1-5のスケールで評価してください。

# リスク情報
{risk.risk_description}

# 評価基準
5: 回避極めて困難（検知・予測不可、対応不可能）
4: 回避困難（検知可能だが対応時間不十分）
3: 回避可能だが容易でない（手順を踏めば可能）
2: 回避比較的容易（標準監視で対応可能）
1: 回避極めて容易（自動検知・対応可能）

# 出力形式
{{
  "avoidability_score": <1-5の整数>,
  "rationale": "評価の根拠を3-5文で説明"
}}

# 評価時の考慮点
- リスク発生の予兆を検知できるか
- 検知から対応までの時間的余裕があるか
- 人的・技術的な対応能力が十分か
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt=RiskEvaluationPrompt.SYSTEM_PROMPT
        )

        data = self._parse_json_response(response)

        return AvoidabilityScore(
            score=data["avoidability_score"],
            rationale=data["rationale"]
        )

    def _parse_json_response(self, response: str) -> Dict:
        """JSONレスポンスをパース"""
        json_str = response.strip()

        # コードブロックを除去
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        elif json_str.startswith("```"):
            json_str = json_str[3:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        json_str = json_str.strip()

        # 正規表現でJSONオブジェクトを抽出（最初の { から対応する } まで）
        # これにより、JSON後の追加テキストを無視できる
        match = re.search(r'\{.*\}', json_str, re.DOTALL)
        if match:
            json_str = match.group(0)

        return json.loads(json_str)

    def _calculate_risk_level(
        self,
        severity: int,
        frequency: int,
        avoidability: int
    ) -> str:
        """リスクレベルを判定"""
        # リスクスコアの計算
        risk_score = (severity * frequency * avoidability) / 25

        # 正規化（0-5の範囲）
        normalized = (risk_score / 5) * 5

        # レベル判定
        if normalized >= 3.5:
            return "高"
        elif normalized >= 2.0:
            return "中"
        else:
            return "低"

    def _calculate_normalized_score(
        self,
        severity: int,
        frequency: int,
        avoidability: int
    ) -> float:
        """正規化スコアを計算"""
        risk_score = (severity * frequency * avoidability) / 25
        return (risk_score / 5) * 5
