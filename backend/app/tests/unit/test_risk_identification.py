"""Unit tests for risk identification service."""

import pytest
from app.services.risk_identification import RiskIdentificationService
from app.models import RiskSituation, Guideword
from app.llm.client import LLMClient


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
        situation_id="test-001",
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
    from app.models import IdentifiedRisk

    risks = [
        IdentifiedRisk(
            situation_id="test-001",
            risk_id="risk-001",
            category="データ",
            guideword="網羅性",
            risk_description="同じリスク"
        ),
        IdentifiedRisk(
            situation_id="test-001",
            risk_id="risk-002",
            category="データ",
            guideword="網羅性",
            risk_description="同じリスク"
        ),
        IdentifiedRisk(
            situation_id="test-001",
            risk_id="risk-003",
            category="モデル",
            guideword="公平性",
            risk_description="異なるリスク"
        )
    ]

    deduplicated = service._deduplicate_risks(risks)

    assert len(deduplicated) == 2
