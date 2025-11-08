"""Meta countermeasure schemas."""

from pydantic import BaseModel
from typing import List


class MetaCountermeasureBase(BaseModel):
    """メタ対策の基本スキーマ"""
    target_axis: str
    meta_approach: str
    example: str | None = None
    priority: int = 3
    applicability: str = "中"


class MetaCountermeasureResponse(MetaCountermeasureBase):
    """メタ対策のレスポンススキーマ"""
    meta_id: str
    evaluation_id: str

    class Config:
        from_attributes = True


class MetaCountermeasuresListResponse(BaseModel):
    """メタ対策リストのレスポンス"""
    meta_countermeasures: List[MetaCountermeasureResponse]
