"""Meta countermeasure generation service."""

import json
import re
from typing import List, Dict
from app.models import RiskEvaluation, MetaCountermeasure
from app.llm.client import LLMClient


class MetaCountermeasureGenerationService:
    """メタ対策生成サービス

    具体的な対策の前に、より抽象的なアプローチ（メタ対策）を生成する。
    3軸（頻度低減、回避可能性向上、過酷度低減）それぞれに対してメタ対策を提案。
    """

    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    async def generate_meta_countermeasures(
        self,
        evaluation: RiskEvaluation
    ) -> List[MetaCountermeasure]:
        """メタ対策を生成

        Args:
            evaluation: リスク評価結果

        Returns:
            3軸それぞれに対するメタ対策のリスト
        """
        meta_countermeasures = []

        # 1. 頻度低減のメタ対策
        if evaluation.frequency_score >= 3:
            frequency_metas = await self._generate_frequency_reduction_metas(
                evaluation
            )
            meta_countermeasures.extend(frequency_metas)

        # 2. 回避可能性向上のメタ対策
        if evaluation.avoidability_score >= 3:
            avoidability_metas = await self._generate_avoidability_improvement_metas(
                evaluation
            )
            meta_countermeasures.extend(avoidability_metas)

        # 3. 過酷度低減のメタ対策
        if evaluation.severity_score >= 3:
            severity_metas = await self._generate_severity_reduction_metas(
                evaluation
            )
            meta_countermeasures.extend(severity_metas)

        return meta_countermeasures

    async def _generate_frequency_reduction_metas(
        self,
        evaluation: RiskEvaluation
    ) -> List[MetaCountermeasure]:
        """頻度低減のメタ対策を生成"""
        prompt = f"""# タスク
以下のリスクについて、発生頻度を下げるための抽象的なアプローチ（メタ対策）を提案してください。

# リスク情報
{evaluation.risk.risk_description if evaluation.risk else ""}

# 発生頻度評価
スコア: {evaluation.frequency_score}/5
根拠: {evaluation.frequency_rationale}

# メタ対策の例
- AIの性能を向上させる
- 入力データの品質を向上させる
- トレーニングデータを改善する
- モデルのロバスト性を高める
- エッジケースの検知能力を向上させる

# 出力形式
{{
  "meta_approaches": [
    {{
      "approach": "メタ対策の説明（抽象的なアプローチ）",
      "example": "具体例",
      "priority": <1-5>,
      "applicability": "高 | 中 | 低"
    }}
  ]
}}

# 要求事項
- 2-3個のメタ対策を提案する
- 抽象度の高いアプローチを記述する（具体的な実装ではない）
- 実現可能性を考慮する
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt="あなたはAIリスク対策の専門家です。システマティックなアプローチでリスクを低減する方法を提案してください。"
        )

        data = self._parse_json_response(response)

        metas = []
        for item in data.get("meta_approaches", []):
            meta = MetaCountermeasure(
                evaluation_id=evaluation.evaluation_id,
                target_axis="頻度低減",
                meta_approach=item["approach"],
                example=item.get("example", ""),
                priority=item.get("priority", 3),
                applicability=item.get("applicability", "中")
            )
            metas.append(meta)

        return metas

    async def _generate_avoidability_improvement_metas(
        self,
        evaluation: RiskEvaluation
    ) -> List[MetaCountermeasure]:
        """回避可能性向上のメタ対策を生成"""
        prompt = f"""# タスク
以下のリスクについて、回避可能性を向上させるための抽象的なアプローチ（メタ対策）を提案してください。

# リスク情報
{evaluation.risk.risk_description if evaluation.risk else ""}

# 回避可能性評価
スコア: {evaluation.avoidability_score}/5
根拠: {evaluation.avoidability_rationale}

# メタ対策の例
- AIの外側でガードする設計にする
- 人間による確認プロセスを組み込む
- 異常検知システムを導入する
- モニタリング体制を強化する
- フェイルセーフ機構を追加する

# 出力形式
{{
  "meta_approaches": [
    {{
      "approach": "メタ対策の説明（抽象的なアプローチ）",
      "example": "具体例",
      "priority": <1-5>,
      "applicability": "高 | 中 | 低"
    }}
  ]
}}

# 要求事項
- 2-3個のメタ対策を提案する
- 抽象度の高いアプローチを記述する（具体的な実装ではない）
- 実現可能性を考慮する
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt="あなたはAIリスク対策の専門家です。システマティックなアプローチでリスクを低減する方法を提案してください。"
        )

        data = self._parse_json_response(response)

        metas = []
        for item in data.get("meta_approaches", []):
            meta = MetaCountermeasure(
                evaluation_id=evaluation.evaluation_id,
                target_axis="回避可能性向上",
                meta_approach=item["approach"],
                example=item.get("example", ""),
                priority=item.get("priority", 3),
                applicability=item.get("applicability", "中")
            )
            metas.append(meta)

        return metas

    async def _generate_severity_reduction_metas(
        self,
        evaluation: RiskEvaluation
    ) -> List[MetaCountermeasure]:
        """過酷度低減のメタ対策を生成"""
        prompt = f"""# タスク
以下のリスクについて、過酷度（被害の深刻さ）を低減するための抽象的なアプローチ（メタ対策）を提案してください。

# リスク情報
{evaluation.risk.risk_description if evaluation.risk else ""}

# 過酷度評価
スコア: {evaluation.severity_score}/5
根拠: {evaluation.severity_rationale}

# メタ対策の例
- 前提条件を明確に定義する
- 利用契約を明確化する
- 影響範囲を制限する
- 段階的な展開を行う
- バックアップ手段を用意する

# 出力形式
{{
  "meta_approaches": [
    {{
      "approach": "メタ対策の説明（抽象的なアプローチ）",
      "example": "具体例",
      "priority": <1-5>,
      "applicability": "高 | 中 | 低"
    }}
  ]
}}

# 要求事項
- 2-3個のメタ対策を提案する
- 抽象度の高いアプローチを記述する（具体的な実装ではない）
- 実現可能性を考慮する
"""

        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt="あなたはAIリスク対策の専門家です。システマティックなアプローチでリスクを低減する方法を提案してください。"
        )

        data = self._parse_json_response(response)

        metas = []
        for item in data.get("meta_approaches", []):
            meta = MetaCountermeasure(
                evaluation_id=evaluation.evaluation_id,
                target_axis="過酷度低減",
                meta_approach=item["approach"],
                example=item.get("example", ""),
                priority=item.get("priority", 3),
                applicability=item.get("applicability", "中")
            )
            metas.append(meta)

        return metas

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

        # 正規表現でJSONオブジェクトを抽出
        match = re.search(r'\{.*\}', json_str, re.DOTALL)
        if match:
            json_str = match.group(0)

        return json.loads(json_str)
