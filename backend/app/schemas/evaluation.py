"""Evaluation schemas."""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class EvaluationResponse(BaseModel):
    """評価レスポンススキーマ"""
    evaluation_id: str
    risk_id: str
    severity_score: int
    severity_rationale: Optional[str] = None
    frequency_score: int
    frequency_rationale: Optional[str] = None
    avoidability_score: int
    avoidability_rationale: Optional[str] = None
    risk_level: str
    normalized_score: Optional[float] = None
    evaluated_at: datetime

    class Config:
        from_attributes = True


class CountermeasureResponse(BaseModel):
    """対策レスポンススキーマ"""
    measure_id: str
    evaluation_id: str
    strategy_type: str
    description: str
    priority: Optional[int] = None
    feasibility: Optional[str] = None
    implementation_timeline: Optional[str] = None
    expected_effect: Optional[str] = None

    class Config:
        from_attributes = True


class CountermeasuresListResponse(BaseModel):
    """対策リストレスポンススキーマ"""
    countermeasures: List[CountermeasureResponse]
