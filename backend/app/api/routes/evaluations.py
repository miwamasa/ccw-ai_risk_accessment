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


# メタ対策関連のエンドポイント

from app.models import MetaCountermeasure
from app.schemas.meta_countermeasure import MetaCountermeasuresListResponse, MetaCountermeasureResponse
from app.services.meta_countermeasure_generation import MetaCountermeasureGenerationService


@router.post("/{evaluation_id}/generate-meta-countermeasures", response_model=MetaCountermeasuresListResponse)
async def generate_meta_countermeasures(
    evaluation_id: str,
    db: Session = Depends(get_db)
):
    """メタ対策を生成"""
    # 評価結果を取得
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.evaluation_id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # LLMクライアントの作成
    llm_client = LLMClientFactory.create()

    # メタ対策生成サービスの実行
    service = MetaCountermeasureGenerationService(llm_client)
    meta_countermeasures = await service.generate_meta_countermeasures(evaluation)

    # データベースに保存
    for meta in meta_countermeasures:
        db.add(meta)
    db.commit()

    # レスポンスの作成
    meta_responses = [
        MetaCountermeasureResponse(
            meta_id=meta.meta_id,
            evaluation_id=meta.evaluation_id,
            target_axis=meta.target_axis,
            meta_approach=meta.meta_approach,
            example=meta.example,
            priority=meta.priority,
            applicability=meta.applicability
        )
        for meta in meta_countermeasures
    ]

    return MetaCountermeasuresListResponse(meta_countermeasures=meta_responses)


@router.get("/{evaluation_id}/meta-countermeasures", response_model=MetaCountermeasuresListResponse)
async def get_meta_countermeasures(
    evaluation_id: str,
    db: Session = Depends(get_db)
):
    """評価に関連するメタ対策を取得"""
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.evaluation_id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    meta_countermeasures = db.query(MetaCountermeasure).filter(
        MetaCountermeasure.evaluation_id == evaluation_id
    ).all()

    meta_responses = [
        MetaCountermeasureResponse(
            meta_id=meta.meta_id,
            evaluation_id=meta.evaluation_id,
            target_axis=meta.target_axis,
            meta_approach=meta.meta_approach,
            example=meta.example,
            priority=meta.priority,
            applicability=meta.applicability
        )
        for meta in meta_countermeasures
    ]

    return MetaCountermeasuresListResponse(meta_countermeasures=meta_responses)


@router.post("/meta/{meta_id}/generate-countermeasures", response_model=CountermeasuresListResponse)
async def generate_countermeasures_from_meta(
    meta_id: str,
    db: Session = Depends(get_db)
):
    """メタ対策から具体的な対策を生成"""
    # メタ対策を取得
    meta = db.query(MetaCountermeasure).filter(
        MetaCountermeasure.meta_id == meta_id
    ).first()

    if not meta:
        raise HTTPException(status_code=404, detail="Meta countermeasure not found")

    # 評価結果を取得
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.evaluation_id == meta.evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # LLMクライアントの作成
    llm_client = LLMClientFactory.create()

    # 対策導出サービスの実行
    service = CountermeasureGenerationService(llm_client)
    countermeasures = await service.generate_from_meta_countermeasure(meta, evaluation)

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
