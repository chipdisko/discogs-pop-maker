# CLAUDE.md - Discogs POP Maker プロジェクトガイド

## Claude 使用時の設定

### 推奨する対応スタイル

- **言語**: 日本語
- **口調**: ギャル天文学者風（フレンドリーで楽しい雰囲気）
- **特徴**:
  - 宇宙の現象に例えがち
  - 絵文字を使う
  - console.log に絵文字を使う
- **例**: 「おっけー！」「めっちゃいいじゃん！」「〜だよね〜✨」

## プロジェクト概要

Discogs POP Maker は、レコード店用の POP（販促物）を作成・印刷する Web アプリケーションです。
Discogs のデータベースと連携してレコード情報を取得し、視覚的な POP を生成できます。

## 技術スタック

- **フレームワーク**: Next.js 15.4.4 (App Router)
- **React**: 19.1.0
- **言語**: TypeScript 5.x
- **スタイリング**: Tailwind CSS 4.x, shadcn/ui (Radix UI)
- **アイコン**: lucide-react
- **アーキテクチャ**: DDD (Domain-Driven Design)
- **外部 API 連携**: Discogs API (disconnect library)
- **QR コード生成**: qrcode 1.5.4
- **画像生成**: html2canvas 1.4.1
- **状態管理**: React Hooks
- **データ保存**: LocalStorage

## ディレクトリ構造

プロジェクトは DDD アーキテクチャに基づいて構成されています：

```
/
├── app/                    # Presentation層 (Next.js App Router)
│   ├── components/        # UIコンポーネント
│   │   ├── modal/        # モーダルコンポーネント
│   │   └── visual-editor/ # ビジュアルエディタ関連
│   ├── hooks/            # カスタムフック
│   └── api/              # APIルート
│       └── discogs/      # Discogs API連携
│
└── src/                   # ビジネスロジック層 (DDD)
    ├── domain/           # ドメイン層
    │   ├── entities/     # エンティティ (Pop, Release)
    │   ├── value-objects/ # 値オブジェクト
    │   └── repositories/ # リポジトリインターフェース
    ├── application/      # アプリケーション層
    │   ├── services/     # アプリケーションサービス
    │   └── dtos/        # データ転送オブジェクト
    └── infrastructure/   # インフラストラクチャ層
        ├── repositories/ # リポジトリ実装
        └── external/    # 外部API連携
```

## 重要な概念

### Pop (ポップ)

レコード店で使用する販促物。以下の情報を含む：

- Release 情報（Discogs から取得）
- コメント
- バッジ（RECOMMEND, MUST, RAVE, ACID）
- コンディション（New, M, M-, EX++等）
- 価格

### Release (リリース)

Discogs から取得したレコード情報：

- DiscogsId
- DiscogsType ("release" | "master") - URL タイプ
- タイトル、アーティスト名
- レーベル、国、リリース日
- ジャンル、スタイル

### Discogs URL タイプ

- **Release**: 特定のリリース版 `/release/{id}`
- **Master**: マスターリリース `/master/{id}`

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint

# フォーマット
npm run format
```

## 重要な開発ルール

### 🚨 作業完了時の必須確認事項

**すべての作業後、必ず以下のコマンドを実行してエラーがないことを確認してください：**

```bash
npm run build
npm run typecheck
npm run lint
```

これらのコマンドがすべて通ることを確認してから作業を完了としてください。

### コーディング規約

1. **Next.js 15 App Router のベストプラクティス**

   - Server Components をデフォルトとして使用する
   - Client Components は `'use client'` ディレクティブで明示的に宣言
   - API Routes は `/app/api/` ディレクトリに配置
   - データフェッチングは Server Components で行う
   - 状態管理が必要な場合のみ Client Components を使用

2. **ライブラリ使用時の鉄則**

   - **新しいライブラリを使用する前に、必ず公式ドキュメントを検索して確認する**
   - バージョンによる差異に注意する
   - package.json で使用中のバージョンを確認する
   - **アイコンは lucide-react を使用する**

3. **DDD 層の分離を守る**

   - Presentation 層 (app/) は Application 層の DTO のみを扱う
   - Domain 層は他の層に依存しない
   - Infrastructure 層は外部サービスとの連携を担当

4. **型安全性**

   - すべての関数に型定義を付ける
   - any の使用は避ける
   - 値オブジェクトを活用する

5. **エラーハンドリング**
   - try-catch で適切にエラーをハンドリング
   - ユーザーにわかりやすいエラーメッセージを表示

## よくある作業パターン

### 新機能追加の流れ

1. Domain 層にエンティティ/値オブジェクトを追加
2. Application 層に DTO とサービスメソッドを追加
3. Infrastructure 層に必要な実装を追加
4. Presentation 層で UI を実装
5. `npm run build` でビルドエラーがないことを確認
6. `npm run typecheck` で型エラーがないことを確認

### Discogs 連携の追加

1. `/app/api/discogs/` に API ルートを追加
2. `DiscogsRepositoryImpl` に取得ロジックを実装
3. `PopApplicationService` でビジネスロジックを実装
4. UI コンポーネントから利用

### データの永続化

- LocalStorage を使用（`PopRepositoryImpl`）
- 保存時は `PopStorageData` 形式に変換
- 読み込み時は Domain エンティティに復元

## 環境変数

```env
# .env.local
DISCOGS_API_TOKEN=your_discogs_api_token
```

## デバッグ Tips

- ブラウザの DevTools で LocalStorage の内容を確認
- Network タブで Discogs API の通信を確認
- Console.log でデータの流れを追跡

## 主要ファイルの説明

- `app/components/modal/CreatePopModal.tsx` - Pop 作成/編集モーダル
- `app/hooks/usePopMaker.ts` - Pop 管理のメインフック
- `src/application/services/PopApplicationService.ts` - ビジネスロジック
- `src/infrastructure/repositories/PopRepositoryImpl.ts` - データ永続化

## 📝 ドキュメント管理ルール

### Visual Editor 開発時の必須事項

**機能の追加・変更を行った場合は、必ず以下の2つのドキュメントを更新すること：**

1. **`docs/pop-template-visual-editor-requirements.md`** - 要件定義書
   - 新機能を追加した場合は、該当セクションに仕様を追記
   - 既存機能を変更した場合は、仕様を更新
   - データ構造を変更した場合は、TypeScript定義を更新

2. **`docs/visual-editor-progress.md`** - 進捗管理
   - 実装完了した機能を「実装済み機能 ✅」セクションに移動
   - 最終更新日を更新
   - 「最新追加機能」セクションに実装内容を記載

### 更新タイミング

- 機能実装が完了したらすぐに更新（コミット前に必ず更新）
- 思いつきで追加した機能も必ず記録
- ブラッシュアップや改善も記録

### 記載例

```markdown
# visual-editor-progress.md の更新例
#### 2025-08-XX の追加機能
- **[機能名]**: 実装内容の説明
  - 詳細な仕様説明
  - 技術的な実装方法
```

これにより、要件書と実装が常に同期された状態を保つこと！💫
