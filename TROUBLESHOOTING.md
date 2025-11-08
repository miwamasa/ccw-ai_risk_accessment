# トラブルシューティングガイド

## 500エラー: POST /api/v1/situations 失敗

### 問題の診断手順

#### 1. バックエンドが起動しているか確認

```bash
# バックエンドディレクトリで
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

ブラウザで http://localhost:8000/docs にアクセスして、API ドキュメントが表示されるか確認してください。

#### 2. バックエンドAPIを直接テスト

```bash
# 別のターミナルで
curl -X POST http://localhost:8000/api/v1/situations \
  -H "Content-Type: application/json" \
  -d '{"description": "テスト"}'
```

成功すれば、以下のようなJSONが返ります：
```json
{"situation_id":"xxx","description":"テスト",...}
```

#### 3. フロントエンドの起動確認

```bash
# フロントエンドディレクトリで
cd frontend
npm run dev
```

以下のように表示されるはずです：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### 4. ブラウザのコンソールでエラー詳細を確認

1. ブラウザのデベロッパーツールを開く（F12）
2. **Network（ネットワーク）タブ**を開く
3. 「次へ、リスク特定」ボタンをクリック
4. 失敗したリクエストをクリックして詳細を確認：
   - **Headers**: リクエストURLとメソッドを確認
   - **Response**: エラーメッセージを確認
   - **Preview**: レスポンスの内容を確認

### よくある問題と解決方法

#### 問題1: "Access denied" / "Permission denied"

**原因**: APIキーが無効または設定されていない

**解決方法**: `backend/.env`を編集して有効なAPIキーを設定

```bash
# OpenAIを使う場合
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-actual-key-here  # ← 実際のキーに置き換え
LLM_MODEL=gpt-4

# Claudeを使う場合
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here  # ← 実際のキーに置き換え
LLM_MODEL=claude-3-5-sonnet-20241022
```

設定後、バックエンドは自動的にリロードされます。

#### 問題2: "Connection refused" / "Failed to fetch"

**原因**: バックエンドが起動していない

**解決方法**: バックエンドを起動

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 問題3: CORS エラー

**原因**: フロントエンドのオリジンがCORS設定に含まれていない

**解決方法**: `backend/.env`のCORS_ORIGINSを確認

```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

フロントエンドが別のポートで動作している場合は追加してください。

#### 問題4: プロキシが機能しない

**原因**: Viteのプロキシ設定の問題

**解決方法**: フロントエンドのAPIクライアントを直接バックエンドに接続

`frontend/src/services/api.ts` を一時的に変更：

```typescript
// 元の設定
constructor(baseURL: string = '/api/v1') {

// 直接接続に変更
constructor(baseURL: string = 'http://localhost:8000/api/v1') {
```

この場合、CORS設定が重要になります。

### データベース関連の問題

#### 問題: "no such table" エラー

**解決方法**: データベースを初期化

```bash
cd backend
python init_db.py
```

#### 問題: データベースファイルが見つからない

**解決方法**: `.env`のDATABASE_URLを確認

```bash
DATABASE_URL=sqlite:///./ai_risk_assessment.db
```

相対パスなので、`backend/`ディレクトリから起動する必要があります。

### ログの確認方法

#### バックエンドログ

バックエンドのターミナルにリアルタイムでログが表示されます：

```
INFO:     127.0.0.1:xxxxx - "POST /api/v1/situations HTTP/1.1" 201 Created
```

エラーの場合、スタックトレースが表示されます。

#### フロントエンドログ

ブラウザのコンソール（F12 → Console）でエラーを確認できます。

### まだ解決しない場合

以下の情報を集めてください：

1. バックエンドのエラーログ全文
2. ブラウザのコンソールエラー全文
3. ブラウザのネットワークタブのリクエスト/レスポンス詳細
4. 使用しているOS、Node.jsバージョン、Pythonバージョン

## 正常な起動手順（まとめ）

### ターミナル1: バックエンド

```bash
cd backend
# APIキーを設定（初回のみ）
cp .env.example .env
# .envを編集してAPIキーを設定

# データベース初期化（初回のみ）
python init_db.py

# サーバー起動
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### ターミナル2: フロントエンド

```bash
cd frontend
# 依存関係インストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev
```

### ブラウザ

http://localhost:3000 にアクセス

### 動作確認

1. リスク状況を入力して「次へ」
2. 「リスクを特定する」をクリック（30秒程度かかります）
3. 特定されたリスクが表示される
4. リスクをクリックして「評価する」
5. 「対策を生成する」

すべてのステップが正常に動作すれば成功です！
