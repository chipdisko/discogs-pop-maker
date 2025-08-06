# CLAUDE.md - Discogs POP Maker プロジェクトガイド

## Claude使用時の設定

### 推奨する対応スタイル
- **言語**: 日本語
- **口調**: ギャル天文学者風（フレンドリーで楽しい雰囲気）
- **例**: 「おっけー！」「めっちゃいいじゃん！」「〜だよね〜✨」

## プロジェクト概要

Discogs POP Makerは、レコード店用のPOP（販促物）を作成・印刷するWebアプリケーションです。
Discogsのデータベースと連携してレコード情報を取得し、視覚的なPOPを生成できます。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **アーキテクチャ**: DDD (Domain-Driven Design)
- **外部API**: Discogs API
- **状態管理**: React Hooks
- **データ保存**: LocalStorage

## ディレクトリ構造

プロジェクトはDDDアーキテクチャに基づいて構成されています：

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
- Release情報（Discogsから取得）
- コメント
- バッジ（RECOMMEND, MUST, RAVE, ACID）
- コンディション（New, M, M-, EX++等）
- 価格

### Release (リリース)
Discogsから取得したレコード情報：
- DiscogsId
- DiscogsType ("release" | "master") - URLタイプ
- タイトル、アーティスト名
- レーベル、国、リリース日
- ジャンル、スタイル

### Discogs URLタイプ
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

1. **DDD層の分離を守る**
   - Presentation層 (app/) はApplication層のDTOのみを扱う
   - Domain層は他の層に依存しない
   - Infrastructure層は外部サービスとの連携を担当

2. **型安全性**
   - すべての関数に型定義を付ける
   - anyの使用は避ける
   - 値オブジェクトを活用する

3. **エラーハンドリング**
   - try-catchで適切にエラーをハンドリング
   - ユーザーにわかりやすいエラーメッセージを表示

## よくある作業パターン

### 新機能追加の流れ

1. Domain層にエンティティ/値オブジェクトを追加
2. Application層にDTOとサービスメソッドを追加
3. Infrastructure層に必要な実装を追加
4. Presentation層でUIを実装
5. `npm run build` でビルドエラーがないことを確認
6. `npm run typecheck` で型エラーがないことを確認

### Discogs連携の追加

1. `/app/api/discogs/` にAPIルートを追加
2. `DiscogsRepositoryImpl` に取得ロジックを実装
3. `PopApplicationService` でビジネスロジックを実装
4. UIコンポーネントから利用

### データの永続化

- LocalStorageを使用（`PopRepositoryImpl`）
- 保存時は `PopStorageData` 形式に変換
- 読み込み時は Domain エンティティに復元

## 環境変数

```env
# .env.local
DISCOGS_API_TOKEN=your_discogs_api_token
```

## デバッグTips

- ブラウザのDevToolsでLocalStorageの内容を確認
- Network タブでDiscogs APIの通信を確認
- Console.logでデータの流れを追跡

## 主要ファイルの説明

- `app/components/modal/CreatePopModal.tsx` - Pop作成/編集モーダル
- `app/hooks/usePopMaker.ts` - Pop管理のメインフック
- `src/application/services/PopApplicationService.ts` - ビジネスロジック
- `src/infrastructure/repositories/PopRepositoryImpl.ts` - データ永続化