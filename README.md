# Discogs Pop Maker

レコード店向けの印刷用 POP（Point of Purchase）作成アプリケーションです。Discogs のリリース情報を取得し、美しい POP デザインを生成できます。

## 🎯 主な機能

### 📝 POP 作成機能

- **Discogs URL 入力**: リリース URL から自動的に情報を取得
- **手動入力**: URL をスキップして手動でリリース情報を入力
- **価格提案**: Discogs の市場価格を参考価格として表示（売り手プロフィール設定が必要）
- **カスタマイズ**: コメント、バッジ、コンディション、価格を自由に設定

### 🏷️ バッジ機能

- **RECOMMEND**: おすすめ
- **MUST**: 必聴
- **RAVE**: 絶賛
- **ACID**: アシッド

### 🎨 デザイン機能

- **A7 サイズ**: 74mm × 105mm（横向き）
- **印刷対応**: A4 用紙に 8 枚配置（2×4 レイアウト）
- **高品質**: 300DPI 対応
- **レスポンシブ**: ライト/ダークモード対応

### 📊 データ管理

- **ローカルストレージ**: 作成した POP を自動保存
- **編集機能**: 既存 POP の編集・削除
- **一括印刷**: 複数 POP の同時印刷プレビュー

## 🚀 セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd discogs-pop-maker
npm install
```

### 2. Discogs API トークンの取得

1. [Discogs Developer Settings](https://www.discogs.com/settings/developers) にアクセス
2. 個人アクセストークンを生成
3. 価格提案機能を使用する場合は、売り手プロフィールも設定

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```env
DISCOGS_API_TOKEN=your_token_here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ブラウザでアクセス

http://localhost:3000 を開く

## 📖 使用方法

### 基本的な POP 作成

1. **「新しいポップを作成」ボタンをクリック**
2. **Step 1**: Discogs URL を入力（または「URL をスキップ」）
3. **Step 2**: リリース情報を確認・編集
4. **価格設定**: 手動入力または価格提案を使用
5. **カスタマイズ**: バッジ、コメント、コンディションを設定
6. **作成**: 「ポップを作成」ボタンで保存

### 価格提案の使用

- **価格提案ボタン**: Discogs の市場価格を取得
- **参考価格**: コンディション別の価格を表示
- **自動入力**: 価格提案をクリックで価格を自動設定
- **独立設定**: レコードコンディションと価格は独立して設定可能

### 印刷プレビュー

1. **「印刷プレビュー」ボタンをクリック**
2. **DPI 設定**: 印刷品質を選択（150/300/600）
3. **プレビュー確認**: A4 用紙への配置を確認
4. **印刷**: ブラウザの印刷機能で出力

## 🔧 サポートされている URL 形式

### POP 作成で使用可能

- **Release URL**: `https://www.discogs.com/release/12345`
- **Master URL**: `https://www.discogs.com/master/12345`

### 参考情報（POP 作成では使用されません）

- **Artist URL**: `https://www.discogs.com/artist/12345`
- **Label URL**: `https://www.discogs.com/label/12345`

## 🏗️ プロジェクト構造

```
discogs-pop-maker/
├── app/
│   ├── api/
│   │   └── discogs/
│   │       ├── route.ts                    # Discogs API エンドポイント
│   │       └── price-suggestions/
│   │           └── route.ts                # 価格提案API
│   ├── components/
│   │   ├── CreatePopModal.tsx              # POP作成モーダル
│   │   ├── PopCard.tsx                     # POPカード表示
│   │   ├── PopTemplate.tsx                 # POPテンプレート描画
│   │   ├── A4Canvas.tsx                    # A4印刷プレビュー
│   │   ├── PrintPreviewModal.tsx           # 印刷プレビューモーダル
│   │   ├── ThemeProvider.tsx               # テーマプロバイダー
│   │   └── ThemeToggle.tsx                 # テーマ切り替え
│   ├── pages/
│   │   └── PopMakerPage.tsx                # メインページ
│   ├── globals.css                         # グローバルスタイル
│   ├── layout.tsx                          # レイアウト
│   └── page.tsx                            # ホームページ
├── src/
│   ├── domain/                             # ドメイン層（DDD）
│   │   ├── entities/                       # エンティティ
│   │   ├── value-objects/                  # 値オブジェクト
│   │   ├── repositories/                   # リポジトリインターフェース
│   │   └── services/                       # ドメインサービス
│   ├── application/                        # アプリケーション層
│   │   ├── services/                       # アプリケーションサービス
│   │   └── dtos/                           # データ転送オブジェクト
│   └── infrastructure/                     # インフラストラクチャ層
│       ├── repositories/                   # リポジトリ実装
│       ├── external/                       # 外部API型定義
│       └── di/                             # 依存性注入
├── lib/
│   └── discogs.ts                          # Discogs URL解析ユーティリティ
├── types/
│   └── disconnect.d.ts                     # disconnectライブラリ型定義
└── docs/
    └── overview.md                         # プロジェクト概要
```

## 🛠️ 技術スタック

### フロントエンド

- **Next.js 14** (App Router)
- **React 19** (Server Components)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (UI コンポーネント)

### バックエンド

- **Next.js API Routes**
- **disconnect** (Discogs API クライアント)

### 状態管理

- **React Hooks** (useState, useEffect, useCallback)
- **localStorage** (クライアントサイド永続化)

### 描画・印刷

- **HTML Canvas API** (POP テンプレート描画)
- **CSS Grid/Flexbox** (レイアウト)

## 🎨 デザイン仕様

### POP サイズ

- **A7 横向き**: 105mm × 74mm
- **印刷用**: A4 用紙に 8 枚配置（2×4）
- **DPI 対応**: 150/300/600 DPI

### カラーテーマ

- **ライトモード**: 白ベース、青アクセント
- **ダークモード**: ダークベース、青アクセント
- **レスポンシブ**: モバイル・デスクトップ対応

## 🔧 開発

### 開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 本番サーバー起動

```bash
npm start
```

### リント

```bash
npm run lint
```

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

## 📞 サポート

問題や質問がある場合は、GitHub のイシューを作成してください。
