"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.api.routes import situations, risks, evaluations

load_dotenv()

app = FastAPI(
    title="AI Risk Assessment API",
    description="AIリスクアセスメント言語システムAPI",
    version="1.0.0"
)

# CORSミドルウェアの設定
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(situations.router, prefix="/api/v1/situations", tags=["situations"])
app.include_router(risks.router, prefix="/api/v1/risks", tags=["risks"])
app.include_router(evaluations.router, prefix="/api/v1/evaluations", tags=["evaluations"])


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "AI Risk Assessment API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}
