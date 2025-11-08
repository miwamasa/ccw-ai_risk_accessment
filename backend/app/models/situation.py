"""Risk situation model."""

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
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
