# AIリスクアセスメントシステム 詳細仕様書

**バージョン**: 1.0.0  
**作成日**: 2025-11-08  
**対象**: LLMを活用したAIリスクアセスメント自動化システム

---

## 目次

1. [システム概要](#1-システム概要)
2. [アーキテクチャ設計](#2-アーキテクチャ設計)
3. [機能要件](#3-機能要件)
4. [データモデル](#4-データモデル)
5. [API仕様](#5-api仕様)
6. [LLM連携仕様](#6-llm連携仕様)
7. [UI/UX仕様](#7-uiux仕様)
8. [テストケース](#8-テストケース)
9. [ドキュメント](#9-ドキュメント)
10. [実装ガイド](#10-実装ガイド)

---

## 1. システム概要

### 1.1 目的

本システムは、AIシステムに固有のリスクを体系的に評価・管理するため、LLM（Large Language Model）を言語シミュレータとして活用し、リスクの特定、評価、対策導出を半自動化する。

### 1.2 背景

- **Partnership on AI事故データベース**の知見を活用
- **ISO/IEC 42001**等のAIガバナンス標準への準拠
- **HAZOP（Hazard and Operability Study）**手法のAI領域への適用

### 1.3 主要機能

1. **リスク状況解析**: 自然言語で記述されたAI利用状況の構造化
2. **ガイドワード適用**: 13種のガイドワードによる網羅的リスク特定
3. **三因子評価**: 過酷度・発生頻度・回避可能性による定量評価
4. **対策自動導出**: 因子操作による対策候補生成
5. **レポート生成**: 評価結果と対策の構造化出力

### 1.4 システム構成要素

```
┌─────────────────────────────────────────────┐
│         ユーザーインターフェース層           │
│  (Web UI / CLI / API Client)               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         アプリケーションロジック層           │
│  - リスク特定エンジン                        │
│  - リスク評価エンジン                        │
│  - 対策導出エンジン                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         LLM統合層                           │
│  - プロンプトエンジニアリング                │
│  - レスポンスパーサー                        │
│  - コンテキスト管理                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         データ永続化層                       │
│  - 評価履歴DB                               │
│  - 事例DB (Partnership AI)                 │
│  - ガイドワードDB                           │
└─────────────────────────────────────────────┘
```

---

## 2. アーキテクチャ設計

### 2.1 システムアーキテクチャ

#### 2.1.1 全体構成

```
Frontend (React/Vue.js)
    ↓ REST API / GraphQL
Backend (Python/FastAPI)
    ↓
┌──────────────────┬──────────────────┬──────────────────┐
│ Risk Engine      │ LLM Orchestrator │ Data Manager     │
│ Module           │ Module           │ Module           │
└──────────────────┴──────────────────┴──────────────────┘
    ↓                    ↓                    ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ PostgreSQL       │ │ LLM Provider │ │ Redis Cache      │
│ (評価データ)      │ │ (Claude/GPT) │ │ (セッション)      │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

#### 2.1.2 モジュール設計

**1. Risk Engine Module**
- `RiskIdentifier`: リスク特定
- `RiskEvaluator`: リスク評価
- `MitigationGenerator`: 対策生成
- `PriorityCalculator`: 優先順位付け

**2. LLM Orchestrator Module**
- `PromptBuilder`: プロンプト構築
- `ResponseParser`: レスポンス解析
- `ContextManager`: コンテキスト管理
- `RetryHandler`: リトライ処理

**3. Data Manager Module**
- `IncidentRepository`: 事故事例管理
- `GuidewordRepository`: ガイドワード管理
- `AssessmentRepository`: 評価履歴管理
- `ConfigRepository`: 設定管理

### 2.2 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| Frontend | React 18 + TypeScript | 型安全性、コンポーネント再利用性 |
| Backend | Python 3.11 + FastAPI | 非同期処理、LLMライブラリ豊富 |
| Database | PostgreSQL 15 | JSONB型、全文検索、トランザクション |
| Cache | Redis 7 | セッション管理、レスポンスキャッシュ |
| LLM | Claude Sonnet 4 / GPT-4 | 高度な推論能力、日本語対応 |
| Queue | Celery + RabbitMQ | 非同期タスク処理 |

---

## 3. 機能要件

### 3.1 機能一覧

#### F-001: リスク状況入力
**優先度**: 必須  
**概要**: AIシステムの利用状況を自然言語で入力

**入力**:
- 自由記述テキスト（1000文字以内）
- システム種別（選択式）
- 利用者種別（選択式）

**処理**:
1. テキストの正規化
2. キーワード抽出
3. 構造化データへの変換

**出力**:
- 構造化された状況記述
- 検出されたキーワード一覧

**検証**:
- 必須項目チェック
- 文字数制限
- 不適切表現フィルタ

---

#### F-002: ガイドワード適用リスク特定
**優先度**: 必須  
**概要**: 13種のガイドワードを適用してリスクを特定

**ガイドワード定義**:

| カテゴリ | ガイドワード | 説明 |
|---------|-------------|------|
| データ | 網羅性 | 訓練データが現実の多様性を網羅していない |
| データ | 分布シフト | 訓練時と運用時でデータ分布が変化 |
| データ | 差別と偏見 | データに社会的バイアスが含まれる |
| データ | 著作権 | 著作権保護された素材の不適切利用 |
| データ | センシティブ | 個人情報・機密情報の取扱い不備 |
| モデル | 配慮の欠如 | 特定ユーザー層への配慮不足 |
| モデル | 例外処理 | 想定外入力への対応不足 |
| モデル | 無傾向データ | 訓練データに含まれない状況への対応 |
| モデル | 公平性 | 特定属性への不公平な扱い |
| 運用 | 誤使用 | 想定外の用途での利用 |
| 運用 | 人間の監視 | 人間による監督体制の不足 |
| 運用 | 社会的評価の低下 | システム障害による信頼喪失 |
| 運用 | 基本権侵害 | 人権・プライバシーの侵害 |

**処理フロー**:

```python
for category in ['データ', 'モデル', '運用']:
    for guideword in get_guidewords(category):
        # LLMにガイドワード適用を指示
        prompt = build_risk_identification_prompt(
            situation=user_input,
            guideword=guideword,
            examples=get_incident_examples(guideword)
        )
        
        # LLM実行
        risks = llm.generate(prompt)
        
        # 結果の構造化
        structured_risks = parse_risk_response(risks)
        
        # 保存
        save_identified_risks(structured_risks, category, guideword)
```

**出力**:
```json
{
  "category": "データ",
  "guideword": "分布シフト",
  "risk_description": "夜間の低照度環境では訓練データと異なる画像特性となり、歩行者検出精度が低下する",
  "likelihood": "高",
  "impact_area": "安全性",
  "reference_incidents": ["PAI-2019-034", "PAI-2021-089"]
}
```

---

#### F-003: リスク評価（三因子分解）
**優先度**: 必須  
**概要**: 特定されたリスクを過酷度・発生頻度・回避可能性で評価

**評価因子定義**:

**1. 過酷度 (Severity) - S**
- S1: 軽微（一時的不便）
- S2: 小（限定的損害）
- S3: 中（重大な損害）
- S4: 大（生命・財産への重大リスク）

**2. 発生頻度 (Frequency) - F**
- F1: 稀（年1回未満）
- F2: 低（月1回程度）
- F3: 中（週1回程度）
- F4: 高（日次）

**3. 回避可能性 (Avoidability) - A**
- A1: 容易（事前検知・回避可能）
- A2: 可能（努力により回避可能）
- A3: 困難（専門知識が必要）
- A4: 不可能（検知・回避不可）

**リスクレベル算出**:
```
Risk Level = S × F × A

1-8:   低リスク（監視継続）
9-24:  中リスク（対策検討）
25-48: 高リスク（対策必須）
49-64: 重大リスク（即時対応）
```

**LLMプロンプト例**:
```
以下のリスクについて、3つの因子を評価してください。

リスク: {risk_description}

1. 過酷度（S1-S4）: このリスクが顕在化した場合の影響の深刻さ
2. 発生頻度（F1-F4）: このリスクが発生する可能性の高さ
3. 回避可能性（A1-A4）: リスクを事前に検知・回避できる程度

それぞれについて、評価値とその理由を述べてください。
```

**出力**:
```json
{
  "risk_id": "RISK-001",
  "severity": {
    "score": 4,
    "rationale": "歩行者との接触は生命に関わる重大事故につながる"
  },
  "frequency": {
    "score": 2,
    "rationale": "夜間の低照度環境は季節・天候により変動するが、頻繁に発生"
  },
  "avoidability": {
    "score": 3,
    "rationale": "センサーデータの異常検知は可能だが、判断には専門知識が必要"
  },
  "risk_level": 24,
  "classification": "中リスク"
}
```

---

#### F-004: 対策導出（因子操作）
**優先度**: 必須  
**概要**: 各因子を操作することで実現可能な対策を導出

**対策戦略**:

| 因子 | 操作方向 | 戦略 | 対策例 |
|------|---------|------|--------|
| S | ↓ 低減 | 影響範囲限定 | フェールセーフ、緊急停止機構 |
| F | ↓ 低減 | 発生抑制 | 入力検証、異常検知 |
| A | ↑ 向上 | 検知強化 | モニタリング、アラート |

**出力**:
```json
{
  "risk_id": "RISK-001",
  "mitigation_strategies": [
    {
      "factor": "severity",
      "approach": "フェールセーフ設計",
      "description": "衝突の可能性を検知した場合、自動的に緊急ブレーキを作動させる",
      "implementation": "LiDARと画像認識の融合による歩行者検知、ブレーキ制御システムとの統合",
      "expected_effect": "S4 → S2 (重大事故→軽傷事故)",
      "cost": "高",
      "feasibility": "中",
      "priority": 1
    },
    {
      "factor": "frequency",
      "approach": "入力検証強化",
      "description": "低照度環境を検知し、赤外線カメラに自動切替",
      "implementation": "照度センサー追加、マルチモーダル画像処理",
      "expected_effect": "F2 → F1 (低頻度→稀)",
      "cost": "中",
      "feasibility": "高",
      "priority": 2
    },
    {
      "factor": "avoidability",
      "approach": "モニタリング強化",
      "description": "検出信頼度をリアルタイム表示、閾値未満で警告",
      "implementation": "UIダッシュボード、アラート機構",
      "expected_effect": "A3 → A2 (困難→可能)",
      "cost": "低",
      "feasibility": "高",
      "priority": 3
    }
  ],
  "recommended_combination": [1, 2],
  "residual_risk_level": 4
}
```

---

## 4. データモデル

### 4.1 テーブル定義

#### assessments テーブル
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    situation_text TEXT NOT NULL,
    system_type VARCHAR(50),
    user_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

#### identified_risks テーブル
```sql
CREATE TABLE identified_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('データ', 'モデル', '運用')),
    guideword VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    likelihood VARCHAR(10),
    impact_area VARCHAR(50),
    reference_incidents JSONB,
    llm_context JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### risk_evaluations テーブル
```sql
CREATE TABLE risk_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL REFERENCES identified_risks(id) ON DELETE CASCADE,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 4),
    severity_rationale TEXT,
    frequency_score INTEGER NOT NULL CHECK (frequency_score BETWEEN 1 AND 4),
    frequency_rationale TEXT,
    avoidability_score INTEGER NOT NULL CHECK (avoidability_score BETWEEN 1 AND 4),
    avoidability_rationale TEXT,
    risk_level INTEGER GENERATED ALWAYS AS (severity_score * frequency_score * avoidability_score) STORED,
    classification VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN severity_score * frequency_score * avoidability_score <= 8 THEN '低リスク'
            WHEN severity_score * frequency_score * avoidability_score <= 24 THEN '中リスク'
            WHEN severity_score * frequency_score * avoidability_score <= 48 THEN '高リスク'
            ELSE '重大リスク'
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### mitigations テーブル
```sql
CREATE TABLE mitigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES risk_evaluations(id) ON DELETE CASCADE,
    factor VARCHAR(20) NOT NULL CHECK (factor IN ('severity', 'frequency', 'avoidability')),
    strategy VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    implementation TEXT,
    expected_effect TEXT,
    cost VARCHAR(10) CHECK (cost IN ('低', '中', '高')),
    feasibility VARCHAR(10) CHECK (feasibility IN ('低', '中', '高')),
    priority INTEGER,
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API仕様

### 5.1 エンドポイント一覧

**POST /v1/assessments**
新規評価を作成

Request:
```json
{
  "title": "自動運転システムのリスク評価",
  "situation_text": "自動運転の実験中。夜間、白線がかすれた横断歩道で、歩行者に接触する死亡事故が発生。",
  "system_type": "autonomous_driving",
  "user_type": "general_public"
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "自動運転システムのリスク評価",
  "status": "draft",
  "created_at": "2025-11-08T10:30:00Z",
  "_links": {
    "self": "/assessments/550e8400-e29b-41d4-a716-446655440000",
    "identify_risks": "/assessments/550e8400-e29b-41d4-a716-446655440000/identify"
  }
}
```

---

**POST /v1/assessments/{id}/identify**
リスク特定を実行

Request:
```json
{
  "guidewords": ["網羅性", "分布シフト", "例外処理"],
  "use_llm": true,
  "include_examples": true
}
```

Response (202 Accepted):
```json
{
  "task_id": "task-123",
  "status": "processing",
  "estimated_time": 60
}
```

---

**GET /v1/assessments/{id}/risks**
特定されたリスクを取得

Response (200 OK):
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "risks": [
    {
      "id": "risk-001",
      "category": "データ",
      "guideword": "分布シフト",
      "description": "夜間の低照度環境では訓練データと異なる画像特性となり、歩行者検出精度が低下する",
      "likelihood": "高",
      "impact_area": "安全性"
    }
  ],
  "summary": {
    "total_risks": 15,
    "by_category": {
      "データ": 6,
      "モデル": 5,
      "運用": 4
    }
  }
}
```

---

## 6. LLM連携仕様

### 6.1 プロンプトエンジニアリング

#### リスク特定用プロンプトテンプレート

```python
RISK_IDENTIFICATION_TEMPLATE = """
# システム指示
あなたはAI安全性の専門家です。HAZOPメソッドに基づき、ガイドワードを用いてAIシステムのリスクを特定します。

# タスク
以下のAI利用状況について、「{guideword}」というガイドワードの観点から、
潜在的なリスクシナリオを特定してください。

# 入力データ
## AI利用状況
{situation_text}

## ガイドワード定義
- 名称: {guideword}
- カテゴリ: {category}
- 説明: {guideword_description}

# 制約条件
1. リスクは具体的かつ実現可能性のあるシナリオであること
2. 技術的に正確な記述であること
3. 3つのリスクシナリオを提示すること

# 出力形式
以下のJSON形式で出力してください:

```json
{{
  "risks": [
    {{
      "description": "リスクの具体的記述（100文字以内）",
      "likelihood": "低 | 中 | 高",
      "impact_area": "安全性 | プライバシー | 公平性 | 信頼性",
      "reasoning": "なぜこのリスクが発生しうるか（200文字以内）"
    }}
  ]
}}
```
"""
```

#### リスク評価用プロンプトテンプレート

```python
RISK_EVALUATION_TEMPLATE = """
# システム指示
あなたはリスクマネジメントの専門家です。3つの因子（過酷度・発生頻度・回避可能性）で
リスクを定量評価します。

# タスク
以下のリスクについて、3因子評価を実施してください。

# 入力データ
## リスク記述
{risk_description}

# 評価基準
## 過酷度 (Severity): S1-S4
## 発生頻度 (Frequency): F1-F4  
## 回避可能性 (Avoidability): A1-A4

# 出力形式
```json
{{
  "severity": {{
    "score": 1-4,
    "rationale": "評価理由（150文字以内）"
  }},
  "frequency": {{
    "score": 1-4,
    "rationale": "評価理由（150文字以内）"
  }},
  "avoidability": {{
    "score": 1-4,
    "rationale": "評価理由（150文字以内）"
  }}
}}
```
"""
```

---

## 7. UI/UX仕様

### 7.1 画面構成

#### Step 1: 状況入力画面
- 評価タイトル入力
- 自由記述テキストエリア（1000文字）
- システム種別選択
- 利用者種別選択

#### Step 2: リスク特定画面
- ガイドワード選択チェックボックス
- LLM自動特定ボタン
- 特定されたリスクカード一覧
- 手動リスク追加機能

#### Step 3: リスク評価画面
- リスク詳細表示
- 3因子評価スライダー/ラジオボタン
- 評価理由テキストエリア
- リスクレベル表示

#### Step 4: 対策選択画面
- 因子別対策候補一覧
- 対策選択チェックボックス
- リアルタイムリスクレベル計算
- コスト・効果可視化

#### Step 5: レポート画面
- サマリー表示
- レポート生成ボタン
- ダウンロードリンク

---

## 8. テストケース

### 8.1 単体テスト例

```python
class TestRiskIdentifier:
    def test_identify_risks_with_single_guideword(self):
        """単一ガイドワードでリスク特定"""
        identifier = RiskIdentifier()
        situation = "自動運転車の夜間走行テスト中に歩行者を検出できず"
        guideword = {"name": "分布シフト", "category": "データ"}
        
        risks = identifier.identify(situation, guideword)
        
        assert len(risks) > 0
        assert all(r["guideword"] == "分布シフト" for r in risks)
```

### 8.2 統合テスト例

```python
async def test_complete_assessment_workflow(app_client):
    """評価の完全なワークフロー"""
    
    # 評価作成
    response = await app_client.post("/v1/assessments", json={
        "title": "自動運転リスク評価",
        "situation_text": "..."
    })
    assert response.status_code == 201
    
    # リスク特定
    assessment_id = response.json()["id"]
    response = await app_client.post(
        f"/v1/assessments/{assessment_id}/identify",
        json={"guidewords": ["分布シフト"]}
    )
    assert response.status_code == 202
```

### 8.3 テストカバレッジ目標

- 単体テスト: 80%以上
- 統合テスト: 主要パス100%
- エンドツーエンド: クリティカルパス100%

---

## 9. ドキュメント

### 9.1 必須ドキュメント

1. **README.md**: プロジェクト概要
2. **ARCHITECTURE.md**: アーキテクチャ設計
3. **API_REFERENCE.md**: API仕様書
4. **USER_GUIDE.md**: ユーザーガイド
5. **DEVELOPER_GUIDE.md**: 開発者ガイド
6. **DEPLOYMENT.md**: デプロイ手順
7. **TEST_GUIDE.md**: テスト実行手順

---

## 10. 実装ガイド

### 10.1 プロジェクト構成

```
ai-risk-assessment/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── engine/
│   │   ├── llm/
│   │   ├── repository/
│   │   ├── api/
│   │   └── models/
│   └── tests/
├── frontend/
│   └── src/
├── docs/
└── docker/
```

### 10.2 環境変数

```bash
DATABASE_URL=postgresql://user:password@localhost/ai_risk_assessment
ANTHROPIC_API_KEY=sk-ant-xxx
LLM_MODEL=claude-sonnet-4-20250514
```

### 10.3 デプロイ

```bash
docker-compose up -d
```

---

## 付録

### A. ガイドワード詳細定義

[前述の表を参照]

### B. Partnership AI連携

```python
class PartnershipAIClient:
    async def search_incidents(self, keywords: List[str]) -> List[Dict]:
        # 実装
        pass
```

---

**この仕様書は継続的に更新されます。**
