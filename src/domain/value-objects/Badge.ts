export type BadgeType = "RECOMMEND" | "MUST" | "RAVE" | "ACID";

export class Badge {
  private constructor(private readonly value: BadgeType) {}

  // 定数として定義
  static readonly RECOMMEND = new Badge("RECOMMEND");
  static readonly MUST = new Badge("MUST");
  static readonly RAVE = new Badge("RAVE");
  static readonly ACID = new Badge("ACID");

  // ファクトリーメソッド
  static fromString(value: string): Badge {
    switch (value) {
      case "RECOMMEND":
        return Badge.RECOMMEND;
      case "MUST":
        return Badge.MUST;
      case "RAVE":
        return Badge.RAVE;
      case "ACID":
        return Badge.ACID;
      default:
        throw new Error(`不正なバッジタイプです: ${value}`);
    }
  }

  // 値を取得
  getValue(): BadgeType {
    return this.value;
  }

  // 同値性の比較
  equals(other: Badge): boolean {
    return this.value === other.value;
  }

  // 文字列表現
  toString(): string {
    return this.value;
  }

  // 表示用の日本語名
  getDisplayName(): string {
    switch (this.value) {
      case "RECOMMEND":
        return "Recommend";
      case "MUST":
        return "MUST!";
      case "RAVE":
        return "RAVE";
      case "ACID":
        return "ACID";
    }
  }

  // 全てのバッジタイプを取得
  static getAllBadges(): Badge[] {
    return [Badge.RECOMMEND, Badge.MUST, Badge.RAVE, Badge.ACID];
  }
}
