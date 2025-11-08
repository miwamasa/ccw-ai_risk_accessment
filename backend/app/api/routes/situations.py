"""Situations API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.base import get_db
from app.models import RiskSituation
from app.schemas.situation import SituationCreate, SituationResponse
from app.schemas.risk import RisksListResponse, RiskResponse
from app.services.risk_identification import RiskIdentificationService
from app.llm.client import LLMClientFactory

router = APIRouter()


@router.post("", response_model=SituationResponse, status_code=201)
async def create_situation(
    situation_data: SituationCreate,
    db: Session = Depends(get_db)
):
    """新しいリスク状況を作成"""
    situation = RiskSituation(
        description=situation_data.description,
        industry=situation_data.industry,
        ai_type=situation_data.ai_type,
        deployment_stage=situation_data.deployment_stage
    )
    db.add(situation)
    db.commit()
    db.refresh(situation)
    return situation


@router.get("/{situation_id}", response_model=SituationResponse)
async def get_situation(
    situation_id: str,
    db: Session = Depends(get_db)
):
    """リスク状況を取得"""
    situation = db.query(RiskSituation).filter(
        RiskSituation.situation_id == situation_id
    ).first()

    if not situation:
        raise HTTPException(status_code=404, detail="Situation not found")

    return situation


@router.post("/{situation_id}/identify-risks", response_model=RisksListResponse)
async def identify_risks(
    situation_id: str,
    db: Session = Depends(get_db)
):
    """リスクを特定"""
    # 状況を取得
    situation = db.query(RiskSituation).filter(
        RiskSituation.situation_id == situation_id
    ).first()

    if not situation:
        raise HTTPException(status_code=404, detail="Situation not found")

    # LLMクライアントの作成
    llm_client = LLMClientFactory.create()

    # リスク特定サービスの実行
    service = RiskIdentificationService(llm_client)
    risks = await service.identify_risks(situation)

    # データベースに保存
    for risk in risks:
        db.add(risk)
    db.commit()

    # レスポンスの作成
    risk_responses = [
        RiskResponse(
            risk_id=risk.risk_id,
            situation_id=risk.situation_id,
            category=risk.category,
            guideword=risk.guideword,
            risk_description=risk.risk_description,
            affected_area=risk.affected_area,
            confidence_score=risk.confidence_score
        )
        for risk in risks
    ]

    return RisksListResponse(identified_risks=risk_responses)


@router.get("/{situation_id}/risks", response_model=RisksListResponse)
async def get_situation_risks(
    situation_id: str,
    db: Session = Depends(get_db)
):
    """状況に関連するリスクを取得"""
    situation = db.query(RiskSituation).filter(
        RiskSituation.situation_id == situation_id
    ).first()

    if not situation:
        raise HTTPException(status_code=404, detail="Situation not found")

    from app.models import IdentifiedRisk
    risks = db.query(IdentifiedRisk).filter(
        IdentifiedRisk.situation_id == situation_id
    ).all()

    risk_responses = [
        RiskResponse(
            risk_id=risk.risk_id,
            situation_id=risk.situation_id,
            category=risk.category,
            guideword=risk.guideword,
            risk_description=risk.risk_description,
            affected_area=risk.affected_area,
            confidence_score=risk.confidence_score
        )
        for risk in risks
    ]

    return RisksListResponse(identified_risks=risk_responses)
