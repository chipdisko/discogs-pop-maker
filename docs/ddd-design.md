# DDD 設計図 - Discogs Pop Maker

## ドメインモデル設計

### Core Domain（中心ドメイン）

このアプリの核となるビジネス価値

- **Pop（ポップ）** - レコード店の POP 広告
- **Release（リリース）** - Discogs のレコード情報

### Value Objects（値オブジェクト）

不変で同値性で比較される値

```typescript
// バッジ
class Badge {
  private constructor(private readonly value: BadgeType) {}

  static readonly RECOMMEND = new Badge("RECOMMEND");
  static readonly MUST = new Badge("MUST");
  static readonly RAVE = new Badge("RAVE");
  static readonly ACID = new Badge("ACID");
}

// ユーザーコメント
class Comment {
  constructor(private readonly value: string) {
    if (value.length > 200) {
      throw new Error("コメントは200文字以内にしてください");
    }
  }
}

// ポップサイズ
class PopDimensions {
  static readonly STANDARD = new PopDimensions(100, 74); // mm

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {}
}

// Discogs URL
class DiscogsUrl {
  constructor(private readonly value: string) {
    if (!this.isValidDiscogsUrl(value)) {
      throw new Error("無効なDiscogs URLです");
    }
  }
}
```

### Entities（エンティティ）

識別子を持つオブジェクト

```typescript
// Pop エンティティ
class Pop {
  constructor(
    private readonly id: PopId,
    private release: Release,
    private comment: Comment,
    private badges: Badge[],
    private readonly createdAt: Date
  ) {}

  // バッジを追加
  addBadge(badge: Badge): void {
    if (this.badges.length >= 4) {
      throw new Error("バッジは最大4個まで設定できます");
    }
    this.badges.push(badge);
  }

  // コメントを更新
  updateComment(comment: Comment): void {
    this.comment = comment;
  }
}

// Release エンティティ
class Release {
  constructor(
    private readonly discogsId: string,
    private readonly title: string,
    private readonly artistName: string,
    private readonly label: string,
    private readonly country: string,
    private readonly releaseDate: string,
    private readonly genres: string[],
    private readonly styles: string[]
  ) {}
}
```

### Aggregates（集約）

エンティティと値オブジェクトの境界

```typescript
// Pop Aggregate Root
class PopAggregate {
  constructor(private readonly pop: Pop) {}

  // ドメインルール：リリース情報が必須
  static create(
    release: Release,
    comment?: Comment,
    badges?: Badge[]
  ): PopAggregate {
    const popId = PopId.generate();
    const initialComment = comment || new Comment("");
    const initialBadges = badges || [];

    const pop = new Pop(
      popId,
      release,
      initialComment,
      initialBadges,
      new Date()
    );

    return new PopAggregate(pop);
  }
}
```

### Repositories（リポジトリ）

データ永続化の抽象化

```typescript
// Discogs情報取得
interface DiscogsRepository {
  getReleaseByUrl(url: DiscogsUrl): Promise<Release>;
}

// Pop管理
interface PopRepository {
  save(pop: PopAggregate): Promise<void>;
  findById(id: PopId): Promise<PopAggregate | null>;
  findAll(): Promise<PopAggregate[]>;
}
```

### Domain Services（ドメインサービス）

複数のオブジェクトにまたがるロジック

```typescript
// A4レイアウト生成
class PrintLayoutService {
  generateA4Layout(pops: PopAggregate[]): A4Layout {
    // 2x4配置で8枚まで
    // 9枚以上は次のページ
  }
}
```

### Application Services（アプリケーションサービス）

ユースケースの実装

```typescript
class PopApplicationService {
  async createPopFromDiscogsUrl(
    url: string,
    comment?: string,
    badges?: string[]
  ): Promise<PopResponse> {
    // 1. Discogs URLからリリース情報取得
    // 2. Pop作成
    // 3. 保存
  }

  async generatePrintData(popIds: string[]): Promise<PrintData> {
    // 印刷用データ生成
  }
}
```

## レイヤー構造

```
src/
├── domain/           # ドメイン層
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── services/
├── application/      # アプリケーション層
│   ├── services/
│   └── dtos/
├── infrastructure/   # インフラ層
│   ├── repositories/
│   └── external/
└── presentation/     # プレゼンテーション層
    ├── components/
    └── pages/
```
