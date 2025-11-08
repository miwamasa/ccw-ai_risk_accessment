"""Risk schemas."""

from pydantic import BaseModel
from typing import Optional, List


class RiskIdentifyRequest(BaseModel):
    """リスク特定リクエストスキーマ"""
    guidewords: Optional[List[str]] = None


class RiskResponse(BaseModel):
    """リスクレスポンススキーマ"""
    risk_id: str
    situation_id: str
    category: str
    guideword: str
    risk_description: str
    affected_area: Optional[str] = None
    confidence_score: Optional[float] = None

    class Config:
        from_attributes = True


class RisksListResponse(BaseModel):
    """リスクリストレスポンススキーマ"""
    identified_risks: List[RiskResponse]
