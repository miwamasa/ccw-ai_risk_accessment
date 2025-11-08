"""Countermeasure model."""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
import uuid
from datetime import datetime


class Countermeasure(Base):
    """対策モデル"""

    __tablename__ = "countermeasures"

    measure_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    evaluation_id = Column(
        String(36),
        ForeignKey("risk_evaluations.evaluation_id"),
        nullable=False
    )
    strategy_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Integer)
    feasibility = Column(String(10))
    implementation_timeline = Column(String(50))
    expected_effect = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーション
    evaluation = relationship("RiskEvaluation", back_populates="countermeasures")
