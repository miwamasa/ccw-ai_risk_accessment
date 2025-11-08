# AIリスクアセスメントシステム 実装サンプルコード

## 目次

1. [バックエンド実装サンプル](#1-バックエンド実装サンプル)
2. [LLMプロンプト実装](#2-llmプロンプト実装)
3. [フロントエンド実装サンプル](#3-フロントエンド実装サンプル)
4. [データベースモデル](#4-データベースモデル)
5. [テストコード](#5-テストコード)

---

## 1. バックエンド実装サンプル

### 1.1 リスク特定サービス

```python
# services/risk_identification.py

from typing import List, Optional
import json
from models import RiskSituation, IdentifiedRisk, Guideword
from llm.client import LLMClient
from llm.prompts import RiskIdentificationPrompt

class RiskIdentificationService:
    """リスク特定サービス
    
    ガイドワードに基づいてリスクを体系的に特定する。
    """
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        self.guidewords = self._load_guidewords()
    
    def _load_guidewords(self) -> List[Guideword]:
        """ガイドワードマスタをロード"""
        return [
            # データカテゴリ
            Guideword(category="データ", name="網羅性", 
                     description="学習データが対象領域を十分にカバーしていない"),
            Guideword(category="データ", name="分布シフト",
                     description="学習時と運用時でデータ分布が異なる"),
            Guideword(category="データ", name="差別と偏見",
                     description="データに社会的バイアスが含まれる"),
            Guideword(category="データ", name="著作権",
                     description="学習データに著作権上の問題がある"),
            Guideword(category="データ", name="センシティブ",
                     description="個人情報や機密情報が含まれる"),
            # モデルカテゴリ
            Guideword(category="モデル", name="配慮の欠如",
                     description="安全性や倫理への配慮が不足"),
            Guideword(category="モデル", name="例外処理",
                     description="想定外入力への対応が不十分"),
            Guideword(category="モデル", name="無傾向データ",
                     description="ノイズや無関係なデータへの過学習"),
            Guideword(category="モデル", name="公平性",
                     description="特定グループに不公平な結果"),
            # 運用カテゴリ
            Guideword(category="運用", name="誤使用",
                     description="想定外の用途での使用"),
            Guideword(category="運用", name="人間の監視",
                     description="人間による監督が不十分"),
            Guideword(category="運用", name="社会的評価の低下",
                     description="サービスへの信頼喪失"),
            Guideword(category="運用", name="基本権侵害",
                     description="人権やプライバシーの侵害"),
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
```

### 1.2 リスク評価サービス

```python
# services/risk_evaluation.py

from typing import Tuple
from models import IdentifiedRisk, RiskEvaluation, SeverityScore, FrequencyScore, AvoidabilityScore
from llm.client import LLMClient
from llm.prompts import RiskEvaluationPrompt

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
        # 3つの因子を並行評価
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
            severity=severity,
            frequency=frequency,
            avoidability=avoidability,
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
    
    def _parse_json_response(self, response: str) -> dict:
        """JSONレスポンスをパース"""
        import json
        
        json_str = response.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        json_str = json_str.strip()
        
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
```

### 1.3 対策導出サービス

```python
# services/countermeasure_generation.py

from typing import List
from models import RiskEvaluation, Countermeasure, StrategyType
from llm.client import LLMClient
from llm.prompts import CountermeasurePrompt

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
        severity = evaluation.severity.score
        frequency = evaluation.frequency.score
        avoidability = evaluation.avoidability.score
        
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
{evaluation.risk.risk_description}

# 評価結果
- 過酷度: {evaluation.severity.score}/5
  根拠: {evaluation.severity.rationale}
- 発生頻度: {evaluation.frequency.score}/5
  根拠: {evaluation.frequency.rationale}
- 回避可能性: {evaluation.avoidability.score}/5
  根拠: {evaluation.avoidability.rationale}
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
        import json
        
        json_str = response.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:]
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
```

---

## 2. LLMプロンプト実装

### 2.1 プロンプト定義

```python
# llm/prompts.py

class RiskIdentificationPrompt:
    """リスク特定用プロンプト"""
    
    SYSTEM_PROMPT = """あなたはAI安全性とリスク管理の専門家です。
Partnership on AIの事故データベースやAIインシデント事例に精通しており、
AIシステムの開発・運用におけるリスクを体系的に特定する能力を持っています。

あなたの役割:
1. 与えられたAI関連の状況から、潜在的なリスクを洗い出す
2. 提示されたガイドワードに基づいて、網羅的にリスクを検討する
3. 各リスクについて、具体的かつ明確な記述を提供する
4. リスクの根拠となる要因を明示する

重要な原則:
- 該当しないガイドワードは無理に選択しない
- リスク記述は具体的で実践的な内容にする
- 「〜の可能性がある」という形で記述する
- 重複するリスクは統合する
"""


class RiskEvaluationPrompt:
    """リスク評価用プロンプト"""
    
    SYSTEM_PROMPT = """あなたはAIリスク評価の専門家です。
過酷度、発生頻度、回避可能性の3つの観点から、
リスクを定量的に評価する能力を持っています。

評価原則:
- 客観的なデータと過去の事例に基づいて評価する
- 最悪シナリオを想定しつつ、現実的な判断をする
- 評価の根拠を明確に説明する
- 一貫性のある評価基準を適用する
"""


class CountermeasurePrompt:
    """対策導出用プロンプト"""
    
    SYSTEM_PROMPT = """あなたはAIリスク対策の専門家です。
リスク評価結果に基づいて、実現可能で効果的な対策を提案する能力を持っています。

対策立案の原則:
- 実現可能性と効果のバランスを考慮する
- 具体的で実装可能な対策を提案する
- コストと時間の制約を意識する
- 複数のアプローチから総合的に対策を検討する
"""
```

### 2.2 LLMクライアント

```python
# llm/client.py

from typing import Optional
import openai
import anthropic
from abc import ABC, abstractmethod

class LLMClient(ABC):
    """LLMクライアントの抽象基底クラス"""
    
    @abstractmethod
    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """LLM APIを呼び出す"""
        pass


class OpenAIClient(LLMClient):
    """OpenAI APIクライアント"""
    
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model
    
    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        messages = []
        
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content


class ClaudeClient(LLMClient):
    """Anthropic Claude APIクライアント"""
    
    def __init__(self, api_key: str, model: str = "claude-3-opus-20240229"):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model
    
    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        message = await self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            system=system_prompt or "",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        return message.content[0].text


class LLMClientFactory:
    """LLMクライアントのファクトリー"""
    
    @staticmethod
    def create(
        provider: str,
        api_key: str,
        model: Optional[str] = None
    ) -> LLMClient:
        """プロバイダーに応じたクライアントを生成"""
        if provider == "openai":
            return OpenAIClient(api_key, model or "gpt-4")
        elif provider == "claude":
            return ClaudeClient(api_key, model or "claude-3-opus-20240229")
        else:
            raise ValueError(f"Unknown provider: {provider}")
```

---

## 3. フロントエンド実装サンプル

### 3.1 Reactコンポーネント

```typescript
// components/RiskIdentification.tsx

import React, { useState } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import { RiskSituation, IdentifiedRisk } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface RiskIdentificationProps {
  situation: RiskSituation;
  onComplete: (risks: IdentifiedRisk[]) => void;
}

export const RiskIdentification: React.FC<RiskIdentificationProps> = ({
  situation,
  onComplete,
}) => {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedRisks, setIdentifiedRisks] = useState<IdentifiedRisk[]>([]);
  const { identifyRisks } = useRiskAssessment();

  const handleIdentify = async () => {
    setIsIdentifying(true);
    try {
      const risks = await identifyRisks(situation.id);
      setIdentifiedRisks(risks);
    } catch (error) {
      console.error('リスク特定に失敗しました:', error);
      // エラーハンドリング
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleProceed = () => {
    onComplete(identifiedRisks);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>リスク状況</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{situation.description}</p>
        </CardContent>
      </Card>

      {!identifiedRisks.length && (
        <div className="text-center">
          <Button
            onClick={handleIdentify}
            disabled={isIdentifying}
            size="lg"
          >
            {isIdentifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isIdentifying ? 'リスクを特定中...' : 'リスク特定を開始'}
          </Button>
        </div>
      )}

      {identifiedRisks.length > 0 && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              特定されたリスク ({identifiedRisks.length}件)
            </h3>
            {identifiedRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProceed} size="lg">
              評価に進む
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const RiskCard: React.FC<{ risk: IdentifiedRisk }> = ({ risk }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {risk.category}
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                {risk.guideword}
              </span>
            </div>
            <p className="text-gray-700">{risk.risk_description}</p>
            {risk.affected_area && (
              <p className="text-sm text-gray-500 mt-2">
                影響範囲: {risk.affected_area}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3.2 カスタムフック

```typescript
// hooks/useRiskAssessment.ts

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  RiskSituation,
  IdentifiedRisk,
  RiskEvaluation,
  Countermeasure,
} from '@/types';

export const useRiskAssessment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSituation = async (
    description: string,
    context?: Record<string, string>
  ): Promise<RiskSituation> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/situations', {
        description,
        context,
      });
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const identifyRisks = async (
    situationId: string
  ): Promise<IdentifiedRisk[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(
        `/situations/${situationId}/identify-risks`
      );
      return response.data.identified_risks;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateRisk = async (
    riskId: string
  ): Promise<RiskEvaluation> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/risks/${riskId}/evaluate`);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCountermeasures = async (
    evaluationId: string
  ): Promise<Countermeasure[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(
        `/evaluations/${evaluationId}/generate-countermeasures`
      );
      return response.data.countermeasures;
    } catch (err) {
      setError(err as Error);
      throw err;
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
```

---

## 4. データベースモデル

### 4.1 SQLAlchemyモデル

```python
# models/situation.py

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from database.base import Base
import uuid
from datetime import datetime

class RiskSituation(Base):
    """リスク状況モデル"""
    
    __tablename__ = "risk_situations"
    
    situation_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    description = Column(Text, nullable=False)
    industry = Column(String(100))
    ai_type = Column(String(100))
    deployment_stage = Column(String(50))
    source_database = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # リレーション
    risks = relationship(
        "IdentifiedRisk",
        back_populates="situation",
        cascade="all, delete-orphan"
    )
```

```python
# models/risk.py

from sqlalchemy import Column, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base
import uuid

class IdentifiedRisk(Base):
    """特定されたリスクモデル"""
    
    __tablename__ = "identified_risks"
    
    risk_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    situation_id = Column(
        String(36),
        ForeignKey("risk_situations.situation_id"),
        nullable=False
    )
    category = Column(String(20), nullable=False)
    guideword = Column(String(50), nullable=False)
    risk_description = Column(Text, nullable=False)
    affected_area = Column(Text)
    confidence_score = Column(Float)
    
    # リレーション
    situation = relationship("RiskSituation", back_populates="risks")
    evaluation = relationship(
        "RiskEvaluation",
        back_populates="risk",
        uselist=False
    )
```

```python
# models/evaluation.py

from sqlalchemy import Column, String, Integer, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.base import Base
import uuid
from datetime import datetime

class RiskEvaluation(Base):
    """リスク評価モデル"""
    
    __tablename__ = "risk_evaluations"
    
    evaluation_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    risk_id = Column(
        String(36),
        ForeignKey("identified_risks.risk_id"),
        nullable=False
    )
    severity_score = Column(Integer, nullable=False)
    severity_rationale = Column(Text)
    frequency_score = Column(Integer, nullable=False)
    frequency_rationale = Column(Text)
    avoidability_score = Column(Integer, nullable=False)
    avoidability_rationale = Column(Text)
    risk_level = Column(String(10), nullable=False)
    normalized_score = Column(Float)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーション
    risk = relationship("IdentifiedRisk", back_populates="evaluation")
    countermeasures = relationship(
        "Countermeasure",
        back_populates="evaluation",
        cascade="all, delete-orphan"
    )
```

---

## 5. テストコード

### 5.1 単体テスト

```python
# tests/unit/test_risk_identification.py

import pytest
from services.risk_identification import RiskIdentificationService
from models import RiskSituation, Guideword
from llm.client import LLMClient

class MockLLMClient(LLMClient):
    """テスト用のモックLLMクライアント"""
    
    async def call(self, prompt: str, system_prompt: str = None) -> str:
        return '''{
          "identified_risks": [
            {
              "category": "データ",
              "guideword": "網羅性",
              "risk_description": "夜間の走行データが不足しており、暗所での認識精度が低下するリスクがある",
              "affected_area": "歩行者",
              "confidence": "高"
            }
          ]
        }'''

@pytest.fixture
def service():
    """テスト用のサービスインスタンスを生成"""
    mock_client = MockLLMClient()
    return RiskIdentificationService(mock_client)

@pytest.fixture
def sample_situation():
    """テスト用のリスク状況を生成"""
    return RiskSituation(
        description="自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
        industry="自動車",
        ai_type="自動運転"
    )

@pytest.mark.asyncio
async def test_identify_risks_returns_list(service, sample_situation):
    """リスク特定がリストを返すこと"""
    risks = await service.identify_risks(sample_situation)
    
    assert isinstance(risks, list)
    assert len(risks) > 0

@pytest.mark.asyncio
async def test_identified_risk_has_required_fields(service, sample_situation):
    """特定されたリスクが必須フィールドを持つこと"""
    risks = await service.identify_risks(sample_situation)
    risk = risks[0]
    
    assert hasattr(risk, 'category')
    assert hasattr(risk, 'guideword')
    assert hasattr(risk, 'risk_description')
    assert risk.category in ["データ", "モデル", "運用"]

@pytest.mark.asyncio
async def test_confidence_score_conversion(service):
    """信頼度テキストがスコアに正しく変換されること"""
    assert service._confidence_to_score("高") == 0.9
    assert service._confidence_to_score("中") == 0.7
    assert service._confidence_to_score("低") == 0.5

def test_deduplicate_removes_duplicates(service):
    """重複リスクが削除されること"""
    from models import IdentifiedRisk
    
    risks = [
        IdentifiedRisk(
            risk_description="同じリスク",
            guideword="網羅性"
        ),
        IdentifiedRisk(
            risk_description="同じリスク",
            guideword="網羅性"
        ),
        IdentifiedRisk(
            risk_description="異なるリスク",
            guideword="公平性"
        )
    ]
    
    deduplicated = service._deduplicate_risks(risks)
    
    assert len(deduplicated) == 2
```

### 5.2 統合テスト

```python
# tests/integration/test_risk_assessment_flow.py

import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_complete_risk_assessment_flow():
    """リスクアセスメントの完全なフローをテスト"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. リスク状況を登録
        situation_response = await client.post(
            "/api/v1/situations",
            json={
                "description": "自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
                "context": {
                    "industry": "自動車",
                    "ai_type": "自動運転"
                }
            }
        )
        assert situation_response.status_code == 200
        situation_id = situation_response.json()["situation_id"]
        
        # 2. リスクを特定
        risks_response = await client.post(
            f"/api/v1/situations/{situation_id}/identify-risks"
        )
        assert risks_response.status_code == 200
        risks = risks_response.json()["identified_risks"]
        assert len(risks) > 0
        
        # 3. 最初のリスクを評価
        risk_id = risks[0]["risk_id"]
        eval_response = await client.post(
            f"/api/v1/risks/{risk_id}/evaluate"
        )
        assert eval_response.status_code == 200
        evaluation = eval_response.json()
        assert "severity" in evaluation
        assert "frequency" in evaluation
        assert "avoidability" in evaluation
        
        # 4. 対策を導出
        evaluation_id = evaluation["evaluation_id"]
        measures_response = await client.post(
            f"/api/v1/evaluations/{evaluation_id}/generate-countermeasures"
        )
        assert measures_response.status_code == 200
        countermeasures = measures_response.json()["countermeasures"]
        assert len(countermeasures) >= 3
```

---

このサンプルコードを参考に、システムを実装してください。
