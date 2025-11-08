"""Risk evaluation model."""

from sqlalchemy import Column, String, Integer, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
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
