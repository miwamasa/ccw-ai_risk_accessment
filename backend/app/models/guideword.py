"""Guideword model."""

from sqlalchemy import Column, String, Text
from app.database.base import Base


class Guideword(Base):
    """ガイドワードモデル"""

    __tablename__ = "guidewords"

    guideword_id = Column(String(36), primary_key=True)
    category = Column(String(20), nullable=False)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    example = Column(Text)
