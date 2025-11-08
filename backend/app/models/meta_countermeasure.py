"""Meta countermeasure model."""

from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database.base import Base
import uuid


class MetaCountermeasure(Base):
    """メタ対策モデル

    具体的な対策の前に、より抽象的なアプローチを定義する。
    例：「AIの性能を上げる」「外部でガードする」など
    """

    __tablename__ = "meta_countermeasures"

    meta_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    evaluation_id = Column(String(36), ForeignKey("risk_evaluations.evaluation_id"))

    # どの軸に対するメタ対策か
    target_axis = Column(
        String(20),
        nullable=False
    )  # "頻度低減" | "回避可能性向上" | "過酷度低減"

    # メタ対策の説明（抽象的なアプローチ）
    meta_approach = Column(Text, nullable=False)

    # メタ対策の具体例
    example = Column(Text)

    # 優先度
    priority = Column(Integer, default=3)

    # 適用可能性
    applicability = Column(String(10))  # "高" | "中" | "低"

    # このメタ対策から展開された具体的対策との関連
    countermeasures = relationship(
        "Countermeasure",
        back_populates="meta_countermeasure",
        cascade="all, delete-orphan"
    )

    # 評価との関連
    evaluation = relationship("RiskEvaluation", back_populates="meta_countermeasures")
