"""Risk identification service."""

from typing import List, Optional
import json
from app.models import RiskSituation, IdentifiedRisk, Guideword
from app.llm.client import LLMClient
from app.llm.prompts import RiskIdentificationPrompt


class RiskIdentificationService:
    """リスク特定サービス

    ガイドワードに基づいてリスクを体系的に特定する。
    """

    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        self.guidewords = self._load_guidewords()

    def _load_guidewords(self) -> List[Guideword]:
        """ガイドワードマスタをロード"""
        guidewords_data = [
            # データカテゴリ
            {"category": "データ", "name": "網羅性",
             "description": "学習データが対象領域を十分にカバーしていない"},
            {"category": "データ", "name": "分布シフト",
             "description": "学習時と運用時でデータ分布が異なる"},
            {"category": "データ", "name": "差別と偏見",
             "description": "データに社会的バイアスが含まれる"},
            {"category": "データ", "name": "著作権",
             "description": "学習データに著作権上の問題がある"},
            {"category": "データ", "name": "センシティブ",
             "description": "個人情報や機密情報が含まれる"},
            # モデルカテゴリ
            {"category": "モデル", "name": "配慮の欠如",
             "description": "安全性や倫理への配慮が不足"},
            {"category": "モデル", "name": "例外処理",
             "description": "想定外入力への対応が不十分"},
            {"category": "モデル", "name": "無傾向データ",
             "description": "ノイズや無関係なデータへの過学習"},
            {"category": "モデル", "name": "公平性",
             "description": "特定グループに不公平な結果"},
            # 運用カテゴリ
            {"category": "運用", "name": "誤使用",
             "description": "想定外の用途での使用"},
            {"category": "運用", "name": "人間の監視",
             "description": "人間による監督が不十分"},
            {"category": "運用", "name": "社会的評価の低下",
             "description": "サービスへの信頼喪失"},
            {"category": "運用", "name": "基本権侵害",
             "description": "人権やプライバシーの侵害"},
        ]

        return [
            Guideword(
                guideword_id=f"gw-{i:02d}",
                category=gw["category"],
                name=gw["name"],
                description=gw["description"]
            )
            for i, gw in enumerate(guidewords_data, 1)
        ]

    async def identify_risks(
        self,
        situation: RiskSituation,
        selected_guidewords: Optional[List[str]] = None
    ) -> List[IdentifiedRisk]:
        """リスクを特定する

        Args:
            situation: リスク状況
            selected_guidewords: 使用するガイドワード（省略時は全て）

        Returns:
            特定されたリスクのリスト
        """
        # 使用するガイドワードを決定
        guidewords = self._filter_guidewords(selected_guidewords)

        # プロンプト生成
        prompt = self._generate_prompt(situation, guidewords)

        # LLM呼び出し
        response = await self.llm_client.call(
            prompt=prompt,
            system_prompt=RiskIdentificationPrompt.SYSTEM_PROMPT
        )

        # レスポンス解析
        risks = self._parse_response(response, situation)

        # 重複除去
        deduplicated_risks = self._deduplicate_risks(risks)

        # 優先順位付け
        prioritized_risks = self._prioritize_risks(deduplicated_risks)

        return prioritized_risks

    def _filter_guidewords(
        self,
        selected: Optional[List[str]]
    ) -> List[Guideword]:
        """使用するガイドワードをフィルタ"""
        if selected is None:
            return self.guidewords
        return [gw for gw in self.guidewords if gw.name in selected]

    def _generate_prompt(
        self,
        situation: RiskSituation,
        guidewords: List[Guideword]
    ) -> str:
        """プロンプトを生成"""
        prompt = f"""# タスク
以下のAIシステムに関する状況から、潜在的なリスクを特定してください。

# 状況
{situation.description}

# コンテキスト
- 業界: {situation.industry or '不明'}
- AIの種類: {situation.ai_type or '不明'}
- 開発段階: {situation.deployment_stage or '不明'}

# ガイドワード
以下のガイドワードのそれぞれについて、該当するリスクがあるかを検討してください:

"""
        # カテゴリごとにガイドワードを整理
        categories = {}
        for gw in guidewords:
            if gw.category not in categories:
                categories[gw.category] = []
            categories[gw.category].append(gw)

        for category, gws in categories.items():
            prompt += f"\n## {category}カテゴリ\n"
            for gw in gws:
                prompt += f"- {gw.name}: {gw.description}\n"

        prompt += """
# 出力形式
以下のJSON形式で、該当するリスクを列挙してください:

{
  "identified_risks": [
    {
      "category": "データ | モデル | 運用",
      "guideword": "該当するガイドワード",
      "risk_description": "このシナリオにおける具体的なリスクの説明",
      "affected_area": "影響を受ける領域",
      "confidence": "高 | 中 | 低"
    }
  ]
}

# 注意事項
- 各ガイドワードについて、状況に照らして真に該当するもののみを選択してください
- リスク記述は具体的で実践的な内容にしてください
- 「〜の可能性がある」という形で記述してください
- 重複するリスクは統合してください
"""
        return prompt

    def _parse_response(
        self,
        response: str,
        situation: RiskSituation
    ) -> List[IdentifiedRisk]:
        """LLMレスポンスを解析してリスクオブジェクトに変換"""
        try:
            # JSON抽出（マークダウンのコードブロックを除去）
            json_str = response.strip()
            if json_str.startswith("```json"):
                json_str = json_str[7:]
            if json_str.startswith("```"):
                json_str = json_str[3:]
            if json_str.endswith("```"):
                json_str = json_str[:-3]
            json_str = json_str.strip()

            data = json.loads(json_str)

            risks = []
            for item in data.get("identified_risks", []):
                risk = IdentifiedRisk(
                    situation_id=situation.situation_id,
                    category=item["category"],
                    guideword=item["guideword"],
                    risk_description=item["risk_description"],
                    affected_area=item.get("affected_area", ""),
                    confidence_score=self._confidence_to_score(
                        item.get("confidence", "中")
                    )
                )
                risks.append(risk)

            return risks

        except json.JSONDecodeError as e:
            raise ValueError(f"LLMレスポンスのJSON解析に失敗: {e}")

    def _confidence_to_score(self, confidence: str) -> float:
        """信頼度テキストをスコアに変換"""
        mapping = {"高": 0.9, "中": 0.7, "低": 0.5}
        return mapping.get(confidence, 0.7)

    def _deduplicate_risks(
        self,
        risks: List[IdentifiedRisk]
    ) -> List[IdentifiedRisk]:
        """意味的に重複するリスクを統合"""
        # 簡易実装: 完全一致のみ除去
        unique_risks = []
        seen_descriptions = set()

        for risk in risks:
            if risk.risk_description not in seen_descriptions:
                unique_risks.append(risk)
                seen_descriptions.add(risk.risk_description)

        return unique_risks

    def _prioritize_risks(
        self,
        risks: List[IdentifiedRisk]
    ) -> List[IdentifiedRisk]:
        """リスクに優先順位を付ける"""
        # 信頼度スコアでソート
        return sorted(risks, key=lambda r: r.confidence_score, reverse=True)
