export type DiscogsUrlType = "release" | "master" | "artist" | "label";

export interface DiscogsUrlInfo {
  type: DiscogsUrlType;
  id: string;
}

export class DiscogsUrl {
  private readonly urlInfo: DiscogsUrlInfo;

  constructor(private readonly value: string) {
    this.urlInfo = this.parseUrl(value);
  }

  private parseUrl(url: string): DiscogsUrlInfo {
    try {
      const urlObj = new URL(url);

      // Discogs URLかチェック
      if (!urlObj.hostname.includes("discogs.com")) {
        throw new Error("Discogs URLではありません");
      }

      const pathParts = urlObj.pathname
        .split("/")
        .filter((part) => part !== "");

      // Pattern: /release/12345 or /release/12345-Artist-Title
      if (pathParts[0] === "release" && pathParts[1]) {
        const id = pathParts[1].split("-")[0];
        return { type: "release", id };
      }

      // Pattern: /master/12345 or /master/12345-Artist-Title
      if (pathParts[0] === "master" && pathParts[1]) {
        const id = pathParts[1].split("-")[0];
        return { type: "master", id };
      }

      // Pattern: /artist/12345 or /artist/12345-Artist-Name
      if (pathParts[0] === "artist" && pathParts[1]) {
        const id = pathParts[1].split("-")[0];
        return { type: "artist", id };
      }

      // Pattern: /label/12345 or /label/12345-Label-Name
      if (pathParts[0] === "label" && pathParts[1]) {
        const id = pathParts[1].split("-")[0];
        return { type: "label", id };
      }

      // Pattern with language: /ja/release/12345
      if (pathParts.length > 2 && pathParts[0].length === 2) {
        const type = pathParts[1];
        if (
          ["release", "master", "artist", "label"].includes(type) &&
          pathParts[2]
        ) {
          const id = pathParts[2].split("-")[0];
          return { type: type as DiscogsUrlType, id };
        }
      }

      throw new Error("URLパターンが認識できません");
    } catch (error) {
      throw new Error(
        `無効なDiscogs URLです: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  // 元のURL文字列を取得
  getValue(): string {
    return this.value;
  }

  // URLの種類を取得
  getType(): DiscogsUrlType {
    return this.urlInfo.type;
  }

  // IDを取得
  getId(): string {
    return this.urlInfo.id;
  }

  // URLの情報を取得
  getInfo(): DiscogsUrlInfo {
    return { ...this.urlInfo };
  }

  // リリースURLかどうか
  isRelease(): boolean {
    return this.urlInfo.type === "release";
  }

  // マスターURLかどうか
  isMaster(): boolean {
    return this.urlInfo.type === "master";
  }

  // 同値性の比較
  equals(other: DiscogsUrl): boolean {
    return this.value === other.value;
  }

  // 文字列表現
  toString(): string {
    return this.value;
  }

  // バリデーション用の静的メソッド
  static isValid(url: string): boolean {
    try {
      new DiscogsUrl(url);
      return true;
    } catch {
      return false;
    }
  }
}
