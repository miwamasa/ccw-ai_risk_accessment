@echo off
REM AIリスクアセスメントシステム - ローカル環境セットアップスクリプト (Windows)

echo ==================================
echo AIリスクアセスメントシステム
echo ローカル環境セットアップ
echo ==================================

REM 現在のディレクトリを確認
if not exist "README.md" (
    echo エラー: プロジェクトルートディレクトリで実行してください
    exit /b 1
)

echo.
echo === ステップ 1: Python依存関係のインストール ===
cd backend

if not exist "venv" (
    echo 仮想環境を作成中...
    python -m venv venv
)

echo 仮想環境を有効化...
call venv\Scripts\activate.bat

echo 依存関係をインストール中...
pip install -r requirements.txt

echo ✓ Python依存関係のインストール完了

echo.
echo === ステップ 2: 環境変数の設定 ===
if not exist ".env" (
    echo .envファイルを作成中...
    copy .env.example .env
    echo 重要: backend\.envを編集してAPIキーを設定してください！
    echo        OPENAI_API_KEY または ANTHROPIC_API_KEY
) else (
    echo ✓ .envファイルは既に存在します
)

echo.
echo === ステップ 3: データベースの初期化 ===
if not exist "ai_risk_assessment.db" (
    echo データベースを初期化中...
    python init_db.py
    echo ✓ データベース初期化完了
) else (
    echo ✓ データベースは既に存在します
)

cd ..

echo.
echo === ステップ 4: フロントエンド依存関係のインストール ===
cd frontend

if not exist "node_modules" (
    echo npm依存関係をインストール中...
    npm install
    echo ✓ フロントエンド依存関係のインストール完了
) else (
    echo ✓ node_modulesは既に存在します
)

cd ..

echo.
echo ==================================
echo セットアップ完了！
echo ==================================
echo.
echo 次のステップ:
echo.
echo 1. backend\.env を編集してAPIキーを設定:
echo    OPENAI_API_KEY=sk-... または ANTHROPIC_API_KEY=sk-ant-...
echo.
echo 2. コマンドプロンプト1でバックエンドを起動:
echo    cd backend
echo    venv\Scripts\activate.bat
echo    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo 3. コマンドプロンプト2でフロントエンドを起動:
echo    cd frontend
echo    npm run dev
echo.
echo 4. ブラウザでアクセス:
echo    http://localhost:3000
echo.

pause
