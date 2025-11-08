# AIリスクアセスメントシステム - フロントエンド

React + TypeScript + Viteで構築されたWebアプリケーションです。

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 技術スタック

- **React 18**: UIフレームワーク
- **TypeScript**: 型安全性
- **Vite**: 高速なビルドツール
- **Axios**: HTTPクライアント

## プロジェクト構造

```
src/
├── components/        # Reactコンポーネント
│   ├── SituationForm.tsx
│   ├── RiskList.tsx
│   ├── RiskEvaluationView.tsx
│   └── CountermeasureList.tsx
├── hooks/            # カスタムフック
│   └── useRiskAssessment.ts
├── services/         # APIクライアント
│   └── api.ts
├── types/            # TypeScript型定義
│   └── index.ts
├── App.tsx           # メインコンポーネント
├── App.css           # スタイル
└── main.tsx          # エントリーポイント
```

## 主要機能

### 1. リスク状況入力
- 自由記述テキスト入力
- 業界・AI種別・開発段階の選択

### 2. リスク特定
- 13種類のガイドワードによる自動特定
- カテゴリ別（データ・モデル・運用）の表示
- リスクの信頼度スコア表示

### 3. リスク評価
- 過酷度・発生頻度・回避可能性の3軸評価
- 視覚的なスコアバー表示
- 評価根拠の詳細表示

### 4. 対策導出
- 3つのアプローチからの対策生成
- 優先度・実現可能性・実装期間の表示
- 期待効果の説明

## 開発

### 環境変数

Viteのプロキシ設定により、バックエンドAPIへのリクエストは自動的に`http://localhost:8000`に転送されます。

### APIクライアント

`src/services/api.ts`でバックエンドとの通信を管理しています。

### カスタムフック

`useRiskAssessment`フックでAPI呼び出しとローディング状態を管理しています。

## ビルド

```bash
npm run build
```

ビルド成果物は`dist/`ディレクトリに出力されます。
