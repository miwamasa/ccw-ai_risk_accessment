"""Situation schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SituationCreate(BaseModel):
    """リスク状況作成スキーマ"""
    description: str
    industry: Optional[str] = None
    ai_type: Optional[str] = None
    deployment_stage: Optional[str] = None


class SituationResponse(BaseModel):
    """リスク状況レスポンススキーマ"""
    situation_id: str
    description: str
    industry: Optional[str] = None
    ai_type: Optional[str] = None
    deployment_stage: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
