"""Countermeasure generation service."""

import json
from typing import List
from enum import Enum
from app.models import RiskEvaluation, Countermeasure
from app.llm.client import LLMClient
from app.llm.prompts import CountermeasurePrompt


class StrategyType(str, Enum):
    """対策戦略タイプ"""
    SEVERITY_REDUCTION = "過酷度低減"
    FREQUENCY_REDUCTION = "発生頻度低減"
    AVOIDABILITY_IMPROVEMENT = "回避可能性向上"
    BALANCED = "バランス型"


class CountermeasureGenerationService:
    """対策導出サービス

    リスク評価結果に基づいて具体的な対策を生成する。
    """

    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    async def generate_countermeasures(
        self,
        evaluation: RiskEvaluation
    ) -> List[Countermeasure]:
        """対策を生成する

        Args:
            evaluation: リスク評価結果

        Returns:
            対策案のリスト
        """
        # 優先的に取るべき戦略を決定
        primary_strategy = self._select_strategy(evaluation)

        # プロンプト生成
        prompt = self._generate_prompt(evaluation, primary_strategy)

        # LLM呼び出し
        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt=CountermeasurePrompt.SYSTEM_PROMPT
        )

        # レスポンス解析
        countermeasures = self._parse_response(response, evaluation)

        # 優先順位付け
        prioritized = self._prioritize_countermeasures(
            countermeasures,
            evaluation
        )

        return prioritized

    def _select_strategy(self, evaluation: RiskEvaluation) -> StrategyType:
        """主要な対策戦略を選択"""
        severity = evaluation.severity_score
        frequency = evaluation.frequency_score
        avoidability = evaluation.avoidability_score

        # 最も高いスコアに対応する戦略を選択
        if severity >= 4:
            return StrategyType.SEVERITY_REDUCTION
        elif frequency >= 4:
            return StrategyType.FREQUENCY_REDUCTION
        elif avoidability >= 4:
            return StrategyType.AVOIDABILITY_IMPROVEMENT
        else:
            # バランス型
            return StrategyType.BALANCED

    def _generate_prompt(
        self,
        evaluation: RiskEvaluation,
        primary_strategy: StrategyType
    ) -> str:
        """プロンプトを生成"""
        prompt = f"""# タスク
以下のリスク評価結果に基づいて、効果的な対策を提案してください。

# リスク情報
{evaluation.risk.risk_description if evaluation.risk else ""}

# 評価結果
- 過酷度: {evaluation.severity_score}/5
  根拠: {evaluation.severity_rationale}
- 発生頻度: {evaluation.frequency_score}/5
  根拠: {evaluation.frequency_rationale}
- 回避可能性: {evaluation.avoidability_score}/5
  根拠: {evaluation.avoidability_rationale}
- リスクレベル: {evaluation.risk_level}

# 推奨される主要アプローチ
{self._get_strategy_description(primary_strategy)}

# 対策アプローチの詳細
以下の3つのアプローチから、それぞれ対策を導出してください:

1. 過酷度低減: 被害の軽減、影響範囲の限定、フェールセーフ機構
2. 発生頻度低減: 原因除去、予防措置、品質改善
3. 回避可能性向上: 検知能力向上、監視強化、対応体制整備

# 出力形式
{{
  "countermeasures": [
    {{
      "strategy_type": "過酷度低減 | 発生頻度低減 | 回避可能性向上",
      "description": "対策の具体的な内容",
      "priority": <1-5>,
      "feasibility": "高 | 中 | 低",
      "implementation_timeline": "短期(1-3ヶ月) | 中期(3-6ヶ月) | 長期(6ヶ月以上)",
      "expected_effect": "期待される効果の説明"
    }}
  ]
}}

# 要求事項
- 各アプローチから最低1つずつ、計3-5個の対策を提案する
- 実現可能性と効果のバランスを考慮する
- 具体的で実装可能な対策を記述する
- 優先順位をつける（1=低、5=高）
"""
        return prompt

    def _get_strategy_description(self, strategy: StrategyType) -> str:
        """戦略の説明を取得"""
        descriptions = {
            StrategyType.SEVERITY_REDUCTION:
                "過酷度が高いため、被害軽減を優先してください",
            StrategyType.FREQUENCY_REDUCTION:
                "発生頻度が高いため、予防・原因除去を優先してください",
            StrategyType.AVOIDABILITY_IMPROVEMENT:
                "回避が困難なため、検知・対応能力向上を優先してください",
            StrategyType.BALANCED:
                "バランスの取れた対策を検討してください"
        }
        return descriptions.get(strategy, "")

    def _parse_response(
        self,
        response: str,
        evaluation: RiskEvaluation
    ) -> List[Countermeasure]:
        """レスポンスを解析して対策オブジェクトに変換"""
        json_str = response.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.startswith("```"):
            json_str = json_str[3:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        json_str = json_str.strip()

        data = json.loads(json_str)

        countermeasures = []
        for item in data.get("countermeasures", []):
            measure = Countermeasure(
                evaluation_id=evaluation.evaluation_id,
                strategy_type=item["strategy_type"],
                description=item["description"],
                priority=item["priority"],
                feasibility=item["feasibility"],
                implementation_timeline=item["implementation_timeline"],
                expected_effect=item.get("expected_effect", "")
            )
            countermeasures.append(measure)

        return countermeasures

    def _prioritize_countermeasures(
        self,
        countermeasures: List[Countermeasure],
        evaluation: RiskEvaluation
    ) -> List[Countermeasure]:
        """対策に優先順位を付ける"""
        # リスクレベルが高い場合、実現可能性の高い対策を優先
        if evaluation.risk_level == "高":
            return sorted(
                countermeasures,
                key=lambda c: (
                    c.priority,
                    {"高": 3, "中": 2, "低": 1}.get(c.feasibility, 0)
                ),
                reverse=True
            )
        else:
            # 優先度のみでソート
            return sorted(
                countermeasures,
                key=lambda c: c.priority,
                reverse=True
            )
