"""Initialize database tables."""

import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app.database.base import Base, engine
from app.models.situation import RiskSituation
from app.models.risk import IdentifiedRisk
from app.models.evaluation import RiskEvaluation
from app.models.countermeasure import Countermeasure
from app.models.guideword import Guideword

def init_database():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    # Initialize guidewords
    from sqlalchemy.orm import Session
    db = Session(bind=engine)

    # Check if guidewords already exist
    existing_count = db.query(Guideword).count()
    if existing_count == 0:
        print("Initializing guidewords...")
        import uuid
        guidewords = [
            # データカテゴリ（5種類）
            Guideword(guideword_id=str(uuid.uuid4()), category="データ", name="欠損", description="データの一部が欠けている、不完全である"),
            Guideword(guideword_id=str(uuid.uuid4()), category="データ", name="偏り", description="データが特定の傾向に偏っている、代表性に欠ける"),
            Guideword(guideword_id=str(uuid.uuid4()), category="データ", name="誤り", description="データに誤った情報が含まれている"),
            Guideword(guideword_id=str(uuid.uuid4()), category="データ", name="古さ", description="データが古く、現状と乖離している"),
            Guideword(guideword_id=str(uuid.uuid4()), category="データ", name="不適切", description="目的に対してデータが不適切である"),

            # モデルカテゴリ（4種類）
            Guideword(guideword_id=str(uuid.uuid4()), category="モデル", name="過学習", description="訓練データに過度に適合し、汎化性能が低い"),
            Guideword(guideword_id=str(uuid.uuid4()), category="モデル", name="未学習", description="十分に学習できておらず、性能が低い"),
            Guideword(guideword_id=str(uuid.uuid4()), category="モデル", name="不透明", description="判断根拠が不明確である"),
            Guideword(guideword_id=str(uuid.uuid4()), category="モデル", name="脆弱性", description="敵対的攻撃やエッジケースに弱い"),

            # 運用カテゴリ（4種類）
            Guideword(guideword_id=str(uuid.uuid4()), category="運用", name="誤用", description="意図しない使われ方をされる"),
            Guideword(guideword_id=str(uuid.uuid4()), category="運用", name="依存", description="システムへの過度な依存が生じる"),
            Guideword(guideword_id=str(uuid.uuid4()), category="運用", name="劣化", description="時間経過とともに性能が低下する"),
            Guideword(guideword_id=str(uuid.uuid4()), category="運用", name="不正", description="悪意ある利用や攻撃を受ける"),
        ]

        for gw in guidewords:
            db.add(gw)

        db.commit()
        print(f"Initialized {len(guidewords)} guidewords")
    else:
        print(f"Guidewords already exist ({existing_count} records)")

    db.close()

if __name__ == "__main__":
    init_database()
