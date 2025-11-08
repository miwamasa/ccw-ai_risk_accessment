"""Evaluations API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models import RiskEvaluation, Countermeasure
from app.schemas.evaluation import CountermeasuresListResponse, CountermeasureResponse
from app.services.countermeasure_generation import CountermeasureGenerationService
from app.llm.client import LLMClientFactory

router = APIRouter()


@router.post("/{evaluation_id}/generate-countermeasures", response_model=CountermeasuresListResponse)
async def generate_countermeasures(
    evaluation_id: str,
    db: Session = Depends(get_db)
):
    """対策を生成"""
    # 評価結果を取得
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.evaluation_id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # LLMクライアントの作成
    llm_client = LLMClientFactory.create()

    # 対策導出サービスの実行
    service = CountermeasureGenerationService(llm_client)
    countermeasures = await service.generate_countermeasures(evaluation)

    # データベースに保存
    for measure in countermeasures:
        db.add(measure)
    db.commit()

    # レスポンスの作成
    measure_responses = [
        CountermeasureResponse(
            measure_id=measure.measure_id,
            evaluation_id=measure.evaluation_id,
            strategy_type=measure.strategy_type,
            description=measure.description,
            priority=measure.priority,
            feasibility=measure.feasibility,
            implementation_timeline=measure.implementation_timeline,
            expected_effect=measure.expected_effect
        )
        for measure in countermeasures
    ]

    return CountermeasuresListResponse(countermeasures=measure_responses)


@router.get("/{evaluation_id}/countermeasures", response_model=CountermeasuresListResponse)
async def get_countermeasures(
    evaluation_id: str,
    db: Session = Depends(get_db)
):
    """評価に関連する対策を取得"""
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.evaluation_id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    countermeasures = db.query(Countermeasure).filter(
        Countermeasure.evaluation_id == evaluation_id
    ).all()

    measure_responses = [
        CountermeasureResponse(
            measure_id=measure.measure_id,
            evaluation_id=measure.evaluation_id,
            strategy_type=measure.strategy_type,
            description=measure.description,
            priority=measure.priority,
            feasibility=measure.feasibility,
            implementation_timeline=measure.implementation_timeline,
            expected_effect=measure.expected_effect
        )
        for measure in countermeasures
    ]

    return CountermeasuresListResponse(countermeasures=measure_responses)
