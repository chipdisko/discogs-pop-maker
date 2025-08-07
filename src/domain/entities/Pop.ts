import { PopId } from "./PopId";
import { Release } from "./Release";
import { Comment } from "../value-objects/Comment";
import { Condition } from "../value-objects/Condition";
import { Price } from "../value-objects/Price";
import { PopDimensions } from "../value-objects/PopDimensions";

export class Pop {
  constructor(
    private readonly id: PopId,
    private release: Release,
    private comment: Comment,
    private badgeId: string | null,
    private condition: Condition,
    private price: Price,
    private readonly dimensions: PopDimensions,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}


  // ファクトリーメソッド
  static create(
    release: Release,
    comment?: Comment,
    badgeId?: string | null,
    condition?: Condition,
    price?: Price,
    dimensions?: PopDimensions
  ): Pop {
    const now = new Date();
    return new Pop(
      PopId.generate(),
      release,
      comment || Comment.empty(),
      badgeId || null,
      condition || Condition.create("New"),
      price || Price.empty(),
      dimensions || PopDimensions.STANDARD,
      now,
      now
    );
  }

  // 既存データから復元
  static restore(
    id: PopId,
    release: Release,
    comment: Comment,
    badgeId: string | null,
    condition: Condition,
    price: Price,
    dimensions: PopDimensions,
    createdAt: Date,
    updatedAt: Date
  ): Pop {
    return new Pop(
      id,
      release,
      comment,
      badgeId,
      condition,
      price,
      dimensions,
      createdAt,
      updatedAt
    );
  }

  // IDを取得
  getId(): PopId {
    return this.id;
  }

  // リリース情報を取得
  getRelease(): Release {
    return this.release;
  }

  // コメントを取得
  getComment(): Comment {
    return this.comment;
  }

  // バッジIDを取得
  getBadgeId(): string | null {
    return this.badgeId;
  }

  // コンディションを取得
  getCondition(): Condition {
    return this.condition;
  }

  // 価格を取得
  getPrice(): Price {
    return this.price;
  }

  // サイズを取得
  getDimensions(): PopDimensions {
    return this.dimensions;
  }

  // 作成日時を取得
  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  // 更新日時を取得
  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // コメントを更新
  updateComment(comment: Comment): void {
    this.comment = comment;
    this.updatedAt = new Date();
  }

  // バッジIDを設定
  setBadgeId(badgeId: string | null): void {
    this.badgeId = badgeId;
    this.updatedAt = new Date();
  }

  // バッジをクリア
  clearBadge(): void {
    this.badgeId = null;
    this.updatedAt = new Date();
  }

  // コンディションを更新
  updateCondition(condition: Condition): void {
    this.condition = condition;
    this.updatedAt = new Date();
  }

  // 価格を更新
  updatePrice(price: Price): void {
    this.price = price;
    this.updatedAt = new Date();
  }

  // リリース情報を更新
  updateRelease(release: Release): void {
    this.release = release;
    this.updatedAt = new Date();
  }

  // バッジを持っているかチェック
  hasBadge(): boolean {
    return this.badgeId !== null;
  }

  // ポップのタイトルを取得
  getTitle(): string {
    return this.release.getFullTitle();
  }

  // 同値性の比較（IDで判定）
  equals(other: Pop): boolean {
    return this.id.equals(other.id);
  }

  // 文字列表現
  toString(): string {
    return `${this.getTitle()} (${this.id.toString()})`;
  }
}
