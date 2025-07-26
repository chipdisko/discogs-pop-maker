import { PopId } from "./PopId";
import { Release } from "./Release";
import { Comment } from "../value-objects/Comment";
import { Badge } from "../value-objects/Badge";
import { PopDimensions } from "../value-objects/PopDimensions";

export class Pop {
  private static readonly MAX_BADGES = 4;

  constructor(
    private readonly id: PopId,
    private release: Release,
    private comment: Comment,
    private badges: Badge[],
    private readonly dimensions: PopDimensions,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.badges.length > Pop.MAX_BADGES) {
      throw new Error(`バッジは最大${Pop.MAX_BADGES}個まで設定できます`);
    }
  }

  // ファクトリーメソッド
  static create(
    release: Release,
    comment?: Comment,
    badges?: Badge[],
    dimensions?: PopDimensions
  ): Pop {
    const now = new Date();
    return new Pop(
      PopId.generate(),
      release,
      comment || Comment.empty(),
      badges || [],
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
    badges: Badge[],
    dimensions: PopDimensions,
    createdAt: Date,
    updatedAt: Date
  ): Pop {
    return new Pop(
      id,
      release,
      comment,
      badges,
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

  // バッジ一覧を取得
  getBadges(): Badge[] {
    return [...this.badges];
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

  // バッジを追加
  addBadge(badge: Badge): void {
    if (this.badges.length >= Pop.MAX_BADGES) {
      throw new Error(`バッジは最大${Pop.MAX_BADGES}個まで設定できます`);
    }

    // 同じバッジの重複チェック
    if (this.badges.some((b) => b.equals(badge))) {
      throw new Error("同じバッジは複数設定できません");
    }

    this.badges.push(badge);
    this.updatedAt = new Date();
  }

  // バッジを削除
  removeBadge(badge: Badge): void {
    const index = this.badges.findIndex((b) => b.equals(badge));
    if (index >= 0) {
      this.badges.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  // 全バッジをクリア
  clearBadges(): void {
    this.badges = [];
    this.updatedAt = new Date();
  }

  // バッジを設定（既存を置き換え）
  setBadges(badges: Badge[]): void {
    if (badges.length > Pop.MAX_BADGES) {
      throw new Error(`バッジは最大${Pop.MAX_BADGES}個まで設定できます`);
    }

    // 重複チェック
    const uniqueBadges = badges.filter(
      (badge, index, self) => self.findIndex((b) => b.equals(badge)) === index
    );

    if (uniqueBadges.length !== badges.length) {
      throw new Error("同じバッジは複数設定できません");
    }

    this.badges = [...badges];
    this.updatedAt = new Date();
  }

  // 特定のバッジを持っているかチェック
  hasBadge(badge: Badge): boolean {
    return this.badges.some((b) => b.equals(badge));
  }

  // バッジ数を取得
  getBadgeCount(): number {
    return this.badges.length;
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
