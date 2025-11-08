"""Risks API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models import IdentifiedRisk, RiskEvaluation
from app.schemas.evaluation import EvaluationResponse
from app.services.risk_evaluation import RiskEvaluationService
from app.llm.client import LLMClientFactory

router = APIRouter()


@router.post("/{risk_id}/evaluate", response_model=EvaluationResponse)
async def evaluate_risk(
    risk_id: str,
    db: Session = Depends(get_db)
):
    """リスクを評価"""
    # リスクを取得
    risk = db.query(IdentifiedRisk).filter(
        IdentifiedRisk.risk_id == risk_id
    ).first()

    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")

    # LLMクライアントの作成
    llm_client = LLMClientFactory.create()

    # リスク評価サービスの実行
    service = RiskEvaluationService(llm_client)
    evaluation = await service.evaluate_risk(risk)

    # データベースに保存
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation


@router.get("/{risk_id}/evaluation", response_model=EvaluationResponse)
async def get_risk_evaluation(
    risk_id: str,
    db: Session = Depends(get_db)
):
    """リスクの評価結果を取得"""
    evaluation = db.query(RiskEvaluation).filter(
        RiskEvaluation.risk_id == risk_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    return evaluation
