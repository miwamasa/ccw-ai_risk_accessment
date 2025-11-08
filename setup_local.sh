#!/bin/bash

# AIリスクアセスメントシステム - ローカル環境セットアップスクリプト

set -e  # エラーで停止

echo "=================================="
echo "AIリスクアセスメントシステム"
echo "ローカル環境セットアップ"
echo "=================================="

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 現在のディレクトリを確認
if [ ! -f "README.md" ]; then
    echo -e "${RED}エラー: プロジェクトルートディレクトリで実行してください${NC}"
    exit 1
fi

echo ""
echo "=== ステップ 1: Python依存関係のインストール ==="
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}仮想環境を作成中...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}仮想環境を有効化...${NC}"
source venv/bin/activate || . venv/Scripts/activate

echo -e "${YELLOW}依存関係をインストール中...${NC}"
pip install -r requirements.txt

echo -e "${GREEN}✓ Python依存関係のインストール完了${NC}"

echo ""
echo "=== ステップ 2: 環境変数の設定 ==="
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.envファイルを作成中...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}重要: backend/.envを編集してAPIキーを設定してください！${NC}"
    echo -e "${YELLOW}       OPENAI_API_KEY または ANTHROPIC_API_KEY${NC}"
else
    echo -e "${GREEN}✓ .envファイルは既に存在します${NC}"
fi

echo ""
echo "=== ステップ 3: データベースの初期化 ==="
if [ ! -f "ai_risk_assessment.db" ]; then
    echo -e "${YELLOW}データベースを初期化中...${NC}"
    python init_db.py
    echo -e "${GREEN}✓ データベース初期化完了${NC}"
else
    echo -e "${GREEN}✓ データベースは既に存在します${NC}"
fi

cd ..

echo ""
echo "=== ステップ 4: フロントエンド依存関係のインストール ==="
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}npm依存関係をインストール中...${NC}"
    npm install
    echo -e "${GREEN}✓ フロントエンド依存関係のインストール完了${NC}"
else
    echo -e "${GREEN}✓ node_modulesは既に存在します${NC}"
fi

cd ..

echo ""
echo "=================================="
echo -e "${GREEN}セットアップ完了！${NC}"
echo "=================================="
echo ""
echo "次のステップ:"
echo ""
echo "1. backend/.env を編集してAPIキーを設定:"
echo "   OPENAI_API_KEY=sk-... または ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "2. ターミナル1でバックエンドを起動:"
echo "   cd backend"
echo "   source venv/bin/activate  # Windows: venv\\Scripts\\activate"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "3. ターミナル2でフロントエンドを起動:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. ブラウザでアクセス:"
echo "   http://localhost:3000"
echo ""
