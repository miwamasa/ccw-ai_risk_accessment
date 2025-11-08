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

### フロントエンドからの利用（推奨）

ブラウザで `http://localhost:3000` にアクセスし、以下の手順で操作します：

1. **状況入力**: AIシステムの状況を記述
2. **リスク特定**: ガイドワードに基づいてリスクを自動特定（約30秒）
3. **複数選択**: チェックボックスで評価したいリスクを選択
4. **評価・メタ対策**: 選択したリスクを評価し、メタ対策を統合（リスク数×15秒+約20秒）
5. **具体的対策**: メタ対策をクリックして具体的実装策を確認

**便利機能**:
- 💾 **セッション保存**: ヘッダーの「セッションを保存」ボタンでJSONファイルをダウンロード
- 📂 **セッション復元**: 「セッションを読み込み」ボタンでJSONファイルから作業を再開
- ⬅️ **ステップ移動**: プログレスバーをクリックまたは「前に戻る」ボタンで自由にステップを移動

### APIからの利用（開発者向け）

#### 基本的なワークフロー

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

4. **メタ対策の生成**

```bash
# 取得したevaluation_idを使用
curl -X POST http://localhost:8000/api/v1/evaluations/{evaluation_id}/generate-meta-countermeasures
```

5. **具体的対策の展開**

```bash
# 取得したmeta_idを使用
curl -X POST http://localhost:8000/api/v1/evaluations/meta/{meta_id}/generate-countermeasures
```

## プロジェクト構造

```
.
├── backend/                    # バックエンドコード
│   ├── app/
│   │   ├── api/routes/        # APIエンドポイント
│   │   ├── services/          # ビジネスロジック
│   │   │   ├── risk_identification.py
│   │   │   ├── risk_evaluation.py
│   │   │   ├── meta_countermeasure_generation.py
│   │   │   └── countermeasure_generation.py
│   │   ├── models/            # データベースモデル
│   │   │   ├── situation.py
│   │   │   ├── risk.py
│   │   │   ├── evaluation.py
│   │   │   ├── meta_countermeasure.py
│   │   │   └── countermeasure.py
│   │   ├── schemas/           # Pydanticスキーマ
│   │   ├── llm/              # LLM統合
│   │   ├── database/         # データベース設定
│   │   └── tests/            # テストコード
│   ├── requirements.txt       # Python依存関係
│   ├── init_db.py            # データベース初期化スクリプト
│   └── .env.example          # 環境変数サンプル
├── frontend/                  # フロントエンド（React + TypeScript）
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── SituationForm.tsx
│   │   │   ├── RiskList.tsx
│   │   │   ├── RiskEvaluationView.tsx
│   │   │   ├── MultiRiskEvaluationView.tsx
│   │   │   ├── MetaCountermeasureView.tsx
│   │   │   └── CountermeasureList.tsx
│   │   ├── hooks/            # カスタムフック
│   │   ├── services/         # APIクライアント
│   │   ├── types/            # TypeScript型定義
│   │   └── App.tsx           # メインコンポーネント
│   └── package.json
├── spec/                      # 仕様書
├── docker-compose.yml         # Docker Compose設定
├── setup_local.sh            # 自動セットアップ（Linux/Mac）
├── setup_local.bat           # 自動セットアップ（Windows）
├── README.md                  # プロジェクト概要
├── SETUP.md                   # セットアップガイド
└── TROUBLESHOOTING.md        # トラブルシューティング
```

## 主要コンポーネント

### バックエンド

#### 1. リスク特定サービス (`services/risk_identification.py`)
- 13種類のガイドワードに基づいてリスクを洗い出し
- LLMを使用して自動的にリスクを特定

#### 2. リスク評価サービス (`services/risk_evaluation.py`)
- 過酷度・発生頻度・回避可能性の3軸で評価
- 各因子を1-5のスケールで定量化

#### 3. メタ対策生成サービス (`services/meta_countermeasure_generation.py`)
- 評価結果から抽象的な対策方針を生成
- 3軸それぞれに対するアプローチを提案
- 複数リスクのメタ対策を統合・重複排除

#### 4. 対策導出サービス (`services/countermeasure_generation.py`)
- メタ対策から具体的実装レベルの対策を展開（2-4件/メタ対策）
- 実現可能性、実装タイムライン、優先度を付与

### フロントエンド

#### 1. 複数リスク選択UI (`components/RiskList.tsx`)
- チェックボックスによる複数リスク選択
- 全選択/全解除機能

#### 2. 複数リスク評価UI (`components/MultiRiskEvaluationView.tsx`)
- 選択した複数リスクを順次評価
- リアルタイム進捗表示
- メタ対策の自動統合

#### 3. メタ対策表示UI (`components/MetaCountermeasureView.tsx`)
- 3軸ごとにメタ対策をグループ化して表示
- クリックで具体的対策に展開

#### 4. ワークフローナビゲーション (`App.tsx`)
- プログレスバーによるステップ移動
- 各ステップに「前に戻る」ボタン
- セッション保存・復元機能（JSON形式）

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

1. レポート生成機能（PDF/Excel出力）
2. 統合テスト・E2Eテストの充実
3. パフォーマンス最適化（キャッシング、並列処理）
4. CI/CDパイプラインの構築
5. マンダラチャート可視化機能（オプション）

## サポート

問題が発生した場合は、GitHubのIssueで報告してください。

## ライセンス

本プロジェクトは参考実装です。実際のプロジェクトに応じてカスタマイズしてください。
