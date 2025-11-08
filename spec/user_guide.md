# AIリスクアセスメントシステム 利用ガイド

## 目次

1. [システム概要](#1-システム概要)
2. [クイックスタート](#2-クイックスタート)
3. [ユーザーガイド](#3-ユーザーガイド)
4. [API利用ガイド](#4-api利用ガイド)
5. [開発者ガイド](#5-開発者ガイド)
6. [FAQ](#6-faq)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. システム概要

### 1.1 本システムについて

AIリスクアセスメントシステムは、AI製品・サービスに関するリスクを体系的に特定・分析・評価し、適切な対策を導出するためのプラットフォームです。

**主な機能**:
- 🎯 **リスク特定**: 13種類のガイドワードに基づく網羅的なリスク洗い出し
- 📊 **リスク分析**: 過酷度・発生頻度・回避可能性の3軸による定量評価
- 💡 **対策導出**: リスク低減・回避のための具体的な対策案の自動生成
- 📄 **レポート出力**: アセスメント結果の包括的なレポート

### 1.2 対象ユーザー

- AI製品開発チーム
- リスク管理担当者
- コンプライアンス部門
- AI倫理委員会

### 1.3 システム要件

**ブラウザ**:
- Google Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**ネットワーク**:
- インターネット接続必須
- 推奨帯域: 10Mbps以上

---

## 2. クイックスタート

### 2.1 アカウント登録

1. システムトップページにアクセス
2. 「新規登録」ボタンをクリック
3. メールアドレスとパスワードを入力
4. 確認メールのリンクをクリックして認証完了

### 2.2 初回ログイン

1. 登録したメールアドレスとパスワードでログイン
2. ダッシュボードが表示されます

### 2.3 最初のアセスメント

**ステップ1: リスク状況の入力**

```
1. 「新規アセスメント」ボタンをクリック
2. 以下の情報を入力:
   - AIシステムの説明
   - 発生した（または想定される）リスク状況
   - 業界・用途（オプション）
3. 「次へ」をクリック
```

**例**:
```
自動運転の実験中。夜間、白線がかすれた横断歩道で、
歩行者に接触する死亡事故が発生。
```

**ステップ2: リスク特定**

```
1. 「リスク特定を開始」ボタンをクリック
2. システムが自動的にリスクを洗い出します（約30秒）
3. 特定されたリスク一覧が表示されます
4. 各リスクを確認し、必要に応じて編集
5. 「評価に進む」をクリック
```

**ステップ3: リスク評価**

```
1. 評価するリスクを選択
2. 「評価開始」ボタンをクリック
3. 以下のスコアが自動算出されます:
   - 過酷度（1-5）
   - 発生頻度（1-5）
   - 回避可能性（1-5）
   - 総合リスクレベル（高・中・低）
4. 評価根拠を確認
5. 次のリスクを評価するか、対策導出に進む
```

**ステップ4: 対策導出**

```
1. 対策を導出するリスクを選択
2. 「対策生成」ボタンをクリック
3. 3つのアプローチから対策案が提示されます:
   - 過酷度低減
   - 発生頻度低減
   - 回避可能性向上
4. 各対策の実現可能性と効果を確認
5. 採用する対策を選択
```

**ステップ5: レポート出力**

```
1. 「レポート生成」ボタンをクリック
2. PDF形式でダウンロード、またはオンラインで共有
```

### 2.4 5分でできるアセスメント

最小限の手順でアセスメントを完了する例:

```
00:00 - リスク状況入力（例: 自動運転事故シナリオ）
00:30 - リスク特定開始
01:00 - 3つのリスクが特定される
01:30 - 最も重大なリスク1つを選択して評価
02:30 - 評価完了（リスクレベル: 高）
03:00 - 対策導出開始
04:00 - 5つの対策案が生成される
04:30 - レポート生成
05:00 - 完了！
```

---

## 3. ユーザーガイド

### 3.1 リスク状況の記述方法

#### 3.1.1 効果的な記述のポイント

**✅ 良い例**:
```
自動運転システムAを高速道路で運用中、
夜間の降雨時にレーンマーカーの認識精度が低下し、
車線逸脱による接触事故が発生。
学習データには夜間・降雨のデータが十分に含まれていなかった。
```

**ポイント**:
- 具体的な状況（夜間、降雨、高速道路）
- 発生した問題（車線逸脱、接触事故）
- 背景要因（データ不足）

**❌ 悪い例**:
```
AIが失敗した
```

**問題点**:
- 抽象的すぎる
- 状況が不明確
- リスク特定が困難

#### 3.1.2 記述テンプレート

```
【システム】
- AIの種類: (例: 自動運転、医療診断、与信判定)
- 用途: (例: 高速道路での運転支援)

【状況】
- いつ: (例: 夜間、降雨時)
- どこで: (例: 高速道路)
- 何が: (例: レーンマーカー認識失敗)
- どうなった: (例: 車線逸脱事故)

【背景】
- 原因と考えられること: (例: 学習データ不足)
- 既知の問題: (例: 夜間性能の課題認識あり)
```

### 3.2 リスク特定結果の確認

#### 3.2.1 ガイドワードの理解

システムは以下の13種類のガイドワードでリスクを分類します:

**データカテゴリ**:
1. **網羅性**: 学習データの偏りや欠落
   - 例: 特定年齢層のデータ不足
2. **分布シフト**: 学習時と運用時のデータ分布の違い
   - 例: 晴天データで学習し雨天で運用
3. **差別と偏見**: データに含まれる社会的バイアス
   - 例: 性別・人種による偏り
4. **著作権**: 学習データの権利問題
   - 例: 無断収集された画像
5. **センシティブ**: 個人情報や機密情報
   - 例: 医療記録の取り扱い

**モデルカテゴリ**:
6. **配慮の欠如**: 安全性や倫理への配慮不足
   - 例: 有害コンテンツフィルタ不足
7. **例外処理**: 想定外入力への対応不足
   - 例: adversarial exampleへの脆弱性
8. **無傾向データ**: ノイズや無関係データへの過学習
   - 例: 背景パターンで判定
9. **公平性**: 特定グループへの不公平
   - 例: 高齢者に不利な判定

**運用カテゴリ**:
10. **誤使用**: 想定外用途での使用
    - 例: エンタメ用AIを医療に流用
11. **人間の監視**: 人間による監督不足
    - 例: 完全自動化による見逃し
12. **社会的評価の低下**: サービスへの信頼喪失
    - 例: 繰り返される誤判定
13. **基本権侵害**: 人権やプライバシーの侵害
    - 例: 過度な監視

#### 3.2.2 特定されたリスクの編集

特定されたリスクは編集可能です:

1. リスク項目の「編集」ボタンをクリック
2. リスク記述を修正
3. 該当しないリスクは削除
4. 必要に応じて新しいリスクを追加
5. 「保存」をクリック

### 3.3 リスク評価の理解

#### 3.3.1 過酷度スコア

**評価基準**:
- **5点**: 死亡・重傷、重大な権利侵害
- **4点**: 軽傷、経済的損失（大）
- **3点**: 不快・不便、経済的損失（中）
- **2点**: 軽微な不便、経済的損失（小）
- **1点**: 実害なし

**事例**:
```
スコア5: 自動運転での死亡事故
スコア4: 医療AIの誤診による不適切治療
スコア3: 採用AIの不公平判定
スコア2: チャットボットの不適切応答
スコア1: UI表示の軽微なミス
```

#### 3.3.2 発生頻度スコア

**評価基準**:
- **5点**: ほぼ確実に発生（>50%）
- **4点**: 頻繁に発生（10-50%）
- **3点**: 時々発生（1-10%）
- **2点**: まれに発生（0.1-1%）
- **1点**: ほとんど発生しない（<0.1%）

**考慮要素**:
- トリガー条件の出現頻度
- 類似事例の実績
- システム稼働時間

#### 3.3.3 回避可能性スコア

**評価基準**:
- **5点**: 回避極めて困難（検知・対応不可）
- **4点**: 回避困難（対応時間不十分）
- **3点**: 回避可能だが容易でない
- **2点**: 回避比較的容易
- **1点**: 回避極めて容易（自動対応可）

**考慮要素**:
- 予兆の検知可能性
- 対応までの時間的余裕
- 対応能力の有無

#### 3.3.4 リスクレベルの判定

**計算式**:
```
リスクスコア = (過酷度 × 発生頻度 × 回避可能性) / 25
正規化スコア = リスクスコア / 5
```

**判定基準**:
- **高リスク**: 正規化スコア ≥ 3.5
- **中リスク**: 2.0 ≤ 正規化スコア < 3.5
- **低リスク**: 正規化スコア < 2.0

**例**:
```
過酷度5、発生頻度4、回避可能性4の場合:
→ リスクスコア = (5×4×4)/25 = 3.2
→ 正規化スコア = 3.2/5 × 5 = 3.2
→ 判定: 中リスク
```

### 3.4 対策の選択

#### 3.4.1 3つのアプローチ

**1. 過酷度低減アプローチ**

目的: 被害の軽減

具体策:
- 影響範囲の限定
- フェールセーフ機構
- 保護層の追加
- 段階的な機能停止

適用場面: 過酷度が高い（4-5点）リスク

**2. 発生頻度低減アプローチ**

目的: 発生確率の削減

具体策:
- データ品質の改善
- モデルの改良
- 入力検証の強化
- 予防保全

適用場面: 発生頻度が高い（4-5点）リスク

**3. 回避可能性向上アプローチ**

目的: 検知・対応能力の強化

具体策:
- 監視システムの導入
- アラート機能の追加
- 対応手順書の整備
- 人間介在の導入

適用場面: 回避可能性が低い（4-5点=回避困難）リスク

#### 3.4.2 対策の優先順位付け

システムが提示する優先度:
- **優先度5**: 即座に実施すべき
- **優先度4**: 早期実施が望ましい
- **優先度3**: 中期的に検討
- **優先度2**: 可能な範囲で実施
- **優先度1**: 余裕があれば実施

考慮要素:
- リスクレベル
- 実現可能性
- コスト効率
- 実装期間

#### 3.4.3 実現可能性の評価

- **高**: 既存リソースで即座に実施可能
- **中**: 追加リソースが必要だが実施可能
- **低**: 大規模な変更や長期間が必要

### 3.5 レポート機能

#### 3.5.1 レポートの種類

**1. サマリーレポート**
- 全体概要（1-2ページ）
- 主要なリスクと対策
- エグゼクティブ向け

**2. 詳細レポート**
- 全リスクの評価詳細
- 対策の実装ガイド
- 技術者・管理者向け

**3. 比較レポート**
- 複数アセスメントの比較
- 改善の追跡
- 経営層向け

#### 3.5.2 レポートのカスタマイズ

```
1. レポート設定画面を開く
2. 含める情報を選択:
   □ リスク特定結果
   □ 評価スコア詳細
   □ 評価根拠
   □ 対策案
   □ 実装スケジュール
3. 出力形式を選択（PDF/Excel/HTML）
4. 「生成」をクリック
```

#### 3.5.3 レポートの共有

**方法1: ダウンロード**
```
「ダウンロード」ボタン → ファイルを保存 → メールやチャットで共有
```

**方法2: オンライン共有**
```
「共有」ボタン → URLを生成 → 権限設定 → URLをコピー
```

**共有権限**:
- 閲覧のみ
- コメント可能
- 編集可能

---

## 4. API利用ガイド

### 4.1 認証

#### 4.1.1 APIキーの取得

```
1. 設定画面を開く
2. 「API」タブを選択
3. 「新しいAPIキーを生成」をクリック
4. キーの名前を入力
5. 権限を設定
6. 生成されたキーをコピー（再表示不可）
```

#### 4.1.2 認証ヘッダー

```bash
curl -X POST https://api.example.com/v1/situations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"description": "リスク状況..."}'
```

### 4.2 基本的な使い方

#### 4.2.1 リスク状況の登録

**エンドポイント**: `POST /api/v1/situations`

**リクエスト**:
```bash
curl -X POST https://api.example.com/v1/situations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
    "context": {
      "industry": "自動車",
      "ai_type": "自動運転",
      "deployment_stage": "実験段階"
    }
  }'
```

**レスポンス**:
```json
{
  "situation_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2025-11-08T10:00:00Z"
}
```

#### 4.2.2 リスクの特定

**エンドポイント**: `POST /api/v1/situations/{situation_id}/identify-risks`

**リクエスト**:
```bash
curl -X POST https://api.example.com/v1/situations/123e4567-e89b-12d3-a456-426614174000/identify-risks \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス**:
```json
{
  "situation_id": "123e4567-e89b-12d3-a456-426614174000",
  "identified_risks": [
    {
      "risk_id": "risk-001",
      "category": "データ",
      "guideword": "網羅性",
      "risk_description": "夜間の走行データが不足しており、暗所での認識精度が低下するリスクがある",
      "affected_area": "歩行者",
      "confidence_score": 0.92
    },
    {
      "risk_id": "risk-002",
      "category": "モデル",
      "guideword": "配慮の欠如",
      "risk_description": "かすれた白線への対応が不十分で、車線逸脱のリスクがある",
      "affected_area": "運転者、歩行者",
      "confidence_score": 0.88
    }
  ],
  "processing_time_ms": 28500
}
```

#### 4.2.3 リスクの評価

**エンドポイント**: `POST /api/v1/risks/{risk_id}/evaluate`

**リクエスト**:
```bash
curl -X POST https://api.example.com/v1/risks/risk-001/evaluate \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス**:
```json
{
  "evaluation_id": "eval-001",
  "risk_id": "risk-001",
  "severity": {
    "score": 5,
    "rationale": "歩行者との接触により死亡事故が発生しており、最も深刻な結果である。人命が失われることは取り返しがつかない。"
  },
  "frequency": {
    "score": 4,
    "rationale": "夜間走行は日常的に発生し、かすれた白線も珍しくない。実験段階で既に事故が発生しており、頻度は高いと判断される。"
  },
  "avoidability": {
    "score": 4,
    "rationale": "夜間や劣化した道路標示での性能低下は予測可能だが、リアルタイムでの検知・対応は困難。事前のデータ補強が必要。"
  },
  "risk_level": "高",
  "normalized_score": 4.0,
  "evaluated_at": "2025-11-08T10:01:00Z"
}
```

#### 4.2.4 対策の導出

**エンドポイント**: `POST /api/v1/evaluations/{evaluation_id}/generate-countermeasures`

**リクエスト**:
```bash
curl -X POST https://api.example.com/v1/evaluations/eval-001/generate-countermeasures \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス**:
```json
{
  "measure_id": "measure-001",
  "evaluation_id": "eval-001",
  "countermeasures": [
    {
      "strategy_type": "過酷度低減",
      "description": "歩行者検知時の自動緊急ブレーキシステム（AEB）を強化し、衝突速度を低減させる",
      "priority": 5,
      "feasibility": "高",
      "implementation_timeline": "短期(1-3ヶ月)",
      "expected_effect": "衝突時の被害を軽減し、死亡リスクを低減"
    },
    {
      "strategy_type": "発生頻度低減",
      "description": "夜間・悪天候・劣化した路面標示を含む多様なデータセットで再学習を実施",
      "priority": 5,
      "feasibility": "中",
      "implementation_timeline": "中期(3-6ヶ月)",
      "expected_effect": "夜間での認識精度向上、事故発生頻度の削減"
    },
    {
      "strategy_type": "回避可能性向上",
      "description": "夜間走行時は速度制限を設け、人間ドライバーによる監視を必須とする",
      "priority": 4,
      "feasibility": "高",
      "implementation_timeline": "短期(1-3ヶ月)",
      "expected_effect": "リスク発生時の対応余地を確保"
    }
  ],
  "generated_at": "2025-11-08T10:02:00Z"
}
```

### 4.3 Python SDKの使用

#### 4.3.1 インストール

```bash
pip install ai-risk-assessment-sdk
```

#### 4.3.2 基本的な使い方

```python
from ai_risk_assessment import RiskAssessmentClient

# クライアント初期化
client = RiskAssessmentClient(api_key="YOUR_API_KEY")

# リスク状況の登録
situation = client.create_situation(
    description="自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
    context={
        "industry": "自動車",
        "ai_type": "自動運転"
    }
)

# リスクの特定
risks = client.identify_risks(situation.id)
print(f"特定されたリスク数: {len(risks)}")

# 各リスクを評価
for risk in risks:
    evaluation = client.evaluate_risk(risk.id)
    print(f"リスク: {risk.guideword}, レベル: {evaluation.risk_level}")
    
    # 高リスクの場合、対策を導出
    if evaluation.risk_level == "高":
        countermeasures = client.generate_countermeasures(evaluation.id)
        print(f"対策数: {len(countermeasures)}")

# レポート生成
report = client.generate_report(situation.id, format="pdf")
report.save("risk_assessment_report.pdf")
```

#### 4.3.3 非同期処理

```python
import asyncio
from ai_risk_assessment import AsyncRiskAssessmentClient

async def assess_risk():
    client = AsyncRiskAssessmentClient(api_key="YOUR_API_KEY")
    
    # 複数の状況を並行処理
    situations = [
        "自動運転の死亡事故",
        "採用AIの差別判定",
        "チャットボットの不適切応答"
    ]
    
    tasks = [
        client.create_situation(description=desc)
        for desc in situations
    ]
    
    results = await asyncio.gather(*tasks)
    
    for situation in results:
        risks = await client.identify_risks(situation.id)
        print(f"状況 {situation.id}: {len(risks)}件のリスク")

asyncio.run(assess_risk())
```

### 4.4 エラーハンドリング

#### 4.4.1 エラーコード一覧

| コード | 意味 | 対処法 |
|--------|------|--------|
| 400 | 不正なリクエスト | リクエスト内容を確認 |
| 401 | 認証エラー | APIキーを確認 |
| 403 | 権限不足 | 必要な権限を付与 |
| 404 | リソースが見つからない | IDを確認 |
| 429 | レート制限超過 | リトライ間隔を空ける |
| 500 | サーバーエラー | サポートに連絡 |
| 503 | サービス利用不可 | しばらく待ってリトライ |

#### 4.4.2 エラーハンドリング例

```python
from ai_risk_assessment import RiskAssessmentClient, APIError

client = RiskAssessmentClient(api_key="YOUR_API_KEY")

try:
    situation = client.create_situation(description="...")
except APIError as e:
    if e.status_code == 429:
        # レート制限の場合、リトライ
        time.sleep(int(e.headers.get("Retry-After", 60)))
        situation = client.create_situation(description="...")
    elif e.status_code == 503:
        # サービス一時停止の場合、指数バックオフ
        for i in range(3):
            time.sleep(2 ** i)
            try:
                situation = client.create_situation(description="...")
                break
            except APIError:
                if i == 2:
                    raise
    else:
        # その他のエラーは再スロー
        raise
```

### 4.5 レート制限

**制限値**:
- 無料プラン: 10リクエスト/分、100リクエスト/日
- スタンダードプラン: 60リクエスト/分、1000リクエスト/日
- エンタープライズプラン: カスタム

**ヘッダー**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699430400
```

---

## 5. 開発者ガイド

### 5.1 ローカル開発環境のセットアップ

#### 5.1.1 必要なツール

```bash
# Python 3.11+
python --version

# Node.js 18+
node --version

# Docker
docker --version

# PostgreSQL 15+
psql --version
```

#### 5.1.2 リポジトリのクローン

```bash
git clone https://github.com/your-org/ai-risk-assessment.git
cd ai-risk-assessment
```

#### 5.1.3 バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して設定

# データベースのマイグレーション
alembic upgrade head

# 開発サーバーの起動
uvicorn main:app --reload --port 8000
```

#### 5.1.4 フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集

# 開発サーバーの起動
npm run dev
```

#### 5.1.5 Dockerでのセットアップ

```bash
# すべてのサービスを起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# 停止
docker-compose down
```

### 5.2 アーキテクチャ

#### 5.2.1 ディレクトリ構造

```
ai-risk-assessment/
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── situations.py
│   │   │   ├── risks.py
│   │   │   └── evaluations.py
│   │   └── dependencies.py
│   ├── services/
│   │   ├── risk_identification.py
│   │   ├── risk_evaluation.py
│   │   └── countermeasure_generation.py
│   ├── models/
│   │   ├── situation.py
│   │   ├── risk.py
│   │   └── evaluation.py
│   ├── schemas/
│   │   └── ...
│   ├── llm/
│   │   ├── client.py
│   │   └── prompts.py
│   ├── database/
│   │   ├── session.py
│   │   └── base.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── docs/
├── docker-compose.yml
└── README.md
```

#### 5.2.2 主要コンポーネント

**1. APIゲートウェイ** (`backend/main.py`)
```python
from fastapi import FastAPI
from api.routes import situations, risks, evaluations

app = FastAPI(title="AI Risk Assessment API")

app.include_router(situations.router, prefix="/api/v1/situations")
app.include_router(risks.router, prefix="/api/v1/risks")
app.include_router(evaluations.router, prefix="/api/v1/evaluations")
```

**2. リスク特定サービス** (`services/risk_identification.py`)
```python
class RiskIdentificationService:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
    
    async def identify_risks(
        self, 
        situation: RiskSituation
    ) -> List[IdentifiedRisk]:
        """ガイドワードに基づいてリスクを特定"""
        prompt = self._generate_prompt(situation)
        response = await self.llm_client.call(prompt)
        risks = self._parse_response(response)
        return self._deduplicate(risks)
```

**3. LLMクライアント** (`llm/client.py`)
```python
class LLMClient:
    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.api_key = api_key
    
    async def call(
        self, 
        prompt: str,
        system_prompt: str = None
    ) -> str:
        """LLM APIを呼び出す"""
        # プロバイダー別の実装
        if self.provider == "openai":
            return await self._call_openai(prompt, system_prompt)
        elif self.provider == "claude":
            return await self._call_claude(prompt, system_prompt)
```

### 5.3 テストの実行

#### 5.3.1 単体テスト

```bash
cd backend

# すべてのテストを実行
pytest

# カバレッジ付き
pytest --cov=. --cov-report=html

# 特定のテストファイルのみ
pytest tests/unit/test_risk_identification.py

# マーカーでフィルタ
pytest -m "not slow"
```

#### 5.3.2 統合テスト

```bash
# テスト用DBの起動
docker-compose -f docker-compose.test.yml up -d

# 統合テストの実行
pytest tests/integration/

# テスト用DBの停止
docker-compose -f docker-compose.test.yml down
```

#### 5.3.3 E2Eテスト

```bash
cd frontend

# Playwrightのインストール（初回のみ）
npx playwright install

# E2Eテストの実行
npm run test:e2e

# ヘッドレスモードで実行
npm run test:e2e:headless

# 特定のブラウザのみ
npm run test:e2e -- --project=chromium
```

### 5.4 コーディング規約

#### 5.4.1 Python

**スタイルガイド**: PEP 8

**ツール**:
- フォーマッター: Black
- Linter: Flake8, pylint
- 型チェック: mypy

**例**:
```python
from typing import List, Optional
from pydantic import BaseModel

class RiskIdentificationService:
    """リスク特定を行うサービスクラス
    
    ガイドワードに基づいてリスクを体系的に洗い出す。
    """
    
    def __init__(self, llm_client: LLMClient) -> None:
        """初期化
        
        Args:
            llm_client: LLMクライアントのインスタンス
        """
        self.llm_client = llm_client
    
    async def identify_risks(
        self,
        situation: RiskSituation,
        guidewords: Optional[List[str]] = None
    ) -> List[IdentifiedRisk]:
        """リスクを特定する
        
        Args:
            situation: リスク状況
            guidewords: 使用するガイドワード（省略時は全て）
        
        Returns:
            特定されたリスクのリスト
        
        Raises:
            LLMAPIError: LLM APIの呼び出しに失敗した場合
        """
        # 実装...
        pass
```

#### 5.4.2 TypeScript/React

**スタイルガイド**: Airbnb React Style Guide

**ツール**:
- フォーマッター: Prettier
- Linter: ESLint
- 型チェック: TypeScript

**例**:
```typescript
import React, { useState, useEffect } from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import { RiskSituation, IdentifiedRisk } from '@/types';

interface RiskIdentificationProps {
  situation: RiskSituation;
  onComplete: (risks: IdentifiedRisk[]) => void;
}

/**
 * リスク特定コンポーネント
 * 
 * 与えられた状況からリスクを特定し、結果を表示する。
 */
export const RiskIdentification: React.FC<RiskIdentificationProps> = ({
  situation,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { identifyRisks } = useRiskAssessment();

  const handleIdentify = async () => {
    setIsLoading(true);
    try {
      const risks = await identifyRisks(situation.id);
      onComplete(risks);
    } catch (error) {
      console.error('リスク特定に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="risk-identification">
      {/* JSX... */}
    </div>
  );
};
```

### 5.5 デプロイメント

#### 5.5.1 ステージング環境へのデプロイ

```bash
# GitHubにプッシュ
git push origin main

# GitHub Actionsが自動的にCI/CDを実行
# - テストの実行
# - Dockerイメージのビルド
# - ステージング環境へのデプロイ
```

#### 5.5.2 本番環境へのデプロイ

```bash
# リリースタグの作成
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actionsが本番デプロイを実行
# - 承認プロセス
# - Blue-Greenデプロイ
# - ヘルスチェック
```

---

## 6. FAQ

### 6.1 一般的な質問

**Q: どのようなAIシステムに適用できますか?**

A: 本システムは、以下のようなAIシステムに適用できます:
- 自動運転システム
- 医療診断支援AI
- 金融与信判定AI
- 採用・人事評価AI
- 顔認識システム
- チャットボット
- レコメンデーションシステム

基本的に、リスクが存在する可能性のあるすべてのAIシステムが対象です。

**Q: 評価には何時間かかりますか?**

A: 標準的なケースで以下の時間が目安です:
- リスク特定: 5-10分
- 3-5個のリスク評価: 10-20分
- 対策導出: 5-10分
- レポート作成: 1-2分

合計30-50分程度で完了します。

**Q: 評価結果は法的に有効ですか?**

A: 本システムの評価結果は、リスクアセスメントの参考情報として活用できますが、法的拘束力を持つものではありません。最終的な判断は、専門家による総合的な評価が必要です。

**Q: 過去の評価結果は保存されますか?**

A: はい、すべての評価結果はクラウド上に安全に保存されます。保存期間は契約プランによって異なります:
- 無料プラン: 30日
- スタンダードプラン: 1年
- エンタープライズプラン: 無制限

**Q: 複数のメンバーで協力してアセスメントできますか?**

A: はい、スタンダードプラン以上では、チーム機能を利用して複数メンバーで協力できます。各メンバーの役割や権限を設定することも可能です。

### 6.2 技術的な質問

**Q: 使用しているLLMは何ですか?**

A: 本システムは、以下のLLMプロバイダーに対応しています:
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini

管理者設定で使用するLLMを選択できます。

**Q: データはどこに保存されますか?**

A: データは以下の場所に保存されます:
- リスク評価データ: AWS RDS (PostgreSQL)
- ファイル: AWS S3
- セッション情報: Redis

すべて暗号化された状態で保存されます。

**Q: APIのレート制限は?**

A: プランによって異なります:
- 無料: 10リクエスト/分
- スタンダード: 60リクエスト/分
- エンタープライズ: カスタム

**Q: オンプレミスでの運用は可能ですか?**

A: エンタープライズプランでは、オンプレミス版の提供が可能です。詳細はお問い合わせください。

---

## 7. トラブルシューティング

### 7.1 ログインできない

**症状**: ログイン画面でエラーが表示される

**原因と対処法**:

1. **パスワードが間違っている**
   - 「パスワードを忘れた場合」からリセット
   
2. **アカウントがロックされている**
   - 5回連続で失敗するとロック
   - 30分後に自動解除、または管理者に連絡

3. **ブラウザのCookieが無効**
   - ブラウザ設定でCookieを有効化

### 7.2 リスク特定が完了しない

**症状**: リスク特定が30秒以上経っても完了しない

**原因と対処法**:

1. **ネットワークの問題**
   - インターネット接続を確認
   - VPNやプロキシの設定を確認

2. **LLM APIのタイムアウト**
   - ページを再読み込みして再試行
   - 入力テキストを短くする

3. **サーバーの高負荷**
   - システムステータスページを確認
   - しばらく待ってから再試行

### 7.3 評価スコアが不自然

**症状**: 過酷度や発生頻度のスコアが期待と異なる

**原因と対処法**:

1. **リスク記述が不明確**
   - より具体的な状況を記述
   - 数値や固有名詞を含める

2. **LLMの判断の揺らぎ**
   - 「再評価」ボタンで再実行
   - 複数回実行して平均を取る

3. **システムの学習不足**
   - フィードバック機能で評価を報告
   - 開発チームが定期的に改善

### 7.4 レポートが生成できない

**症状**: レポート生成ボタンをクリックしてもダウンロードが始まらない

**原因と対処法**:

1. **ブラウザのポップアップブロック**
   - ポップアップを許可

2. **未完了のアセスメント**
   - すべてのステップが完了しているか確認

3. **一時的なサーバーエラー**
   - しばらく待ってから再試行

### 7.5 API呼び出しでエラー

**症状**: APIを呼び出すと4XXまたは5XXエラーが返される

**原因と対処法**:

**401 Unauthorized**:
```
原因: APIキーが無効
対処: APIキーを再確認、必要なら再生成
```

**429 Too Many Requests**:
```
原因: レート制限超過
対処: リクエスト間隔を空ける、プランのアップグレード
```

**500 Internal Server Error**:
```
原因: サーバー側のエラー
対処: システムステータスを確認、サポートに連絡
```

**503 Service Unavailable**:
```
原因: メンテナンス中または高負荷
対処: しばらく待ってから再試行
```

### 7.6 パフォーマンスが遅い

**症状**: 画面の読み込みや処理が遅い

**改善方法**:

1. **ブラウザのキャッシュをクリア**
   ```
   Chrome: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   Safari: Cmd+Option+E
   ```

2. **不要なブラウザ拡張を無効化**

3. **ネットワーク接続を改善**
   - 有線LANを使用
   - Wi-Fiルーターを再起動

4. **時間帯をずらす**
   - ピーク時間を避ける

---

## 8. サポート

### 8.1 お問い合わせ

**メール**: support@ai-risk-assessment.example.com

**電話**: 03-XXXX-XXXX（平日9:00-18:00）

**チャット**: システム内のヘルプアイコンからアクセス

### 8.2 コミュニティ

**ユーザーフォーラム**: https://community.ai-risk-assessment.example.com

**GitHub**: https://github.com/your-org/ai-risk-assessment

**Slack**: https://ai-risk-community.slack.com

### 8.3 トレーニング

**オンライン研修**: 月1回開催（無料）

**カスタム研修**: エンタープライズプランで利用可能

**ドキュメント**: https://docs.ai-risk-assessment.example.com

---

**最終更新**: 2025-11-08  
**バージョン**: 1.0.0
