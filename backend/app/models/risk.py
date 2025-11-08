"""Identified risk model."""

from sqlalchemy import Column, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
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
