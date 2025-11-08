# AIリスクアセスメント言語システム - セットアップガイド

## 概要

このシステムは、LLMを活用してAIシステムのリスクを体系的に特定・評価・対策するシステムです。

## 前提条件

- Docker & Docker Compose
- Python 3.11+ (ローカル開発の場合)
- OpenAI APIキーまたはAnthropic APIキー

## クイックスタート（Docker）

### 1. 環境変数の設定

```bash
# .envファイルを作成
cp backend/.env.example .env

# .envファイルを編集してAPIキーを設定
# 以下の行を編集してください:
# OPENAI_API_KEY=sk-xxx  # OpenAIを使用する場合
# ANTHROPIC_API_KEY=sk-ant-xxx  # Claudeを使用する場合
```

### 2. Dockerコンテナの起動

```bash
# コンテナをビルドして起動
docker-compose up -d

# ログを確認
docker-compose logs -f backend
```

### 3. APIの動作確認

```bash
# ヘルスチェック
curl http://localhost:8000/health

# APIドキュメントにアクセス
# ブラウザで http://localhost:8000/docs を開く
```

## ローカル開発環境のセットアップ

### 1. バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# データベースの起動（Dockerを使用）
docker-compose up -d db

# アプリケーションの起動
uvicorn app.main:app --reload --port 8000
```

### 2. テストの実行

```bash
cd backend

# すべてのテストを実行
pytest

# カバレッジ付き
pytest --cov=app --cov-report=html

# 特定のテストファイルのみ
pytest app/tests/unit/test_risk_identification.py
```

## 使用方法

### 基本的なワークフロー

1. **リスク状況の作成**

```bash
curl -X POST http://localhost:8000/api/v1/situations \
  -H "Content-Type: application/json" \
  -d '{
    "description": "自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
    "industry": "自動車",
    "ai_type": "自動運転"
  }'
```

2. **リスクの特定**

```bash
# 取得したsituation_idを使用
curl -X POST http://localhost:8000/api/v1/situations/{situation_id}/identify-risks
```

3. **リスクの評価**

```bash
# 取得したrisk_idを使用
curl -X POST http://localhost:8000/api/v1/risks/{risk_id}/evaluate
```

4. **対策の導出**

```bash
# 取得したevaluation_idを使用
curl -X POST http://localhost:8000/api/v1/evaluations/{evaluation_id}/generate-countermeasures
```

## プロジェクト構造

```
.
├── backend/                    # バックエンドコード
│   ├── app/
│   │   ├── api/               # APIエンドポイント
│   │   ├── services/          # ビジネスロジック
│   │   ├── models/            # データベースモデル
│   │   ├── schemas/           # Pydanticスキーマ
│   │   ├── llm/              # LLM統合
│   │   ├── database/         # データベース設定
│   │   └── tests/            # テストコード
│   ├── requirements.txt       # Python依存関係
│   └── .env.example          # 環境変数サンプル
├── frontend/                  # フロントエンド（未実装）
├── spec/                      # 仕様書
├── docker/                    # Docker設定
├── docker-compose.yml         # Docker Compose設定
└── README.md                  # プロジェクト概要
```

## 主要コンポーネント

### 1. リスク特定サービス (`services/risk_identification.py`)
- 13種類のガイドワードに基づいてリスクを洗い出し
- LLMを使用して自動的にリスクを特定

### 2. リスク評価サービス (`services/risk_evaluation.py`)
- 過酷度・発生頻度・回避可能性の3軸で評価
- 各因子を1-5のスケールで定量化

### 3. 対策導出サービス (`services/countermeasure_generation.py`)
- 評価結果に基づいて対策を自動生成
- 3つのアプローチから対策を提案

## トラブルシューティング

### Docker関連

**Q: コンテナが起動しない**
```bash
# ログを確認
docker-compose logs

# コンテナを再起動
docker-compose down
docker-compose up -d --build
```

**Q: データベース接続エラー**
```bash
# データベースコンテナの状態を確認
docker-compose ps db

# データベースに接続できるか確認
docker-compose exec db psql -U postgres -d ai_risk_assessment
```

### LLM API関連

**Q: APIキーエラー**
- `.env`ファイルに正しいAPIキーが設定されているか確認
- 環境変数`LLM_PROVIDER`が正しく設定されているか確認

**Q: タイムアウトエラー**
- LLMのレスポンスが遅い場合があります
- リトライするか、別のモデルを試してください

## 次のステップ

1. フロントエンドの実装
2. 統合テストの追加
3. パフォーマンス最適化
4. デプロイメントの自動化

## サポート

問題が発生した場合は、GitHubのIssueで報告してください。

## ライセンス

本プロジェクトは参考実装です。実際のプロジェクトに応じてカスタマイズしてください。
