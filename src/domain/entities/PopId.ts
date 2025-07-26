// ブラウザ・Node.js両対応のUUID生成関数
function generateUUID(): string {
  // ブラウザ環境でcrypto.randomUUIDが利用可能な場合
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック：手動生成
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class PopId {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === "") {
      throw new Error("PopIDは空にできません");
    }

    // UUID形式のチェック（簡易版）
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("PopIDは有効なUUID形式である必要があります");
    }
  }

  // 新しいIDを生成（ブラウザ・Node.js両対応）
  static generate(): PopId {
    return new PopId(generateUUID());
  }

  // 既存のIDから作成
  static fromString(value: string): PopId {
    return new PopId(value);
  }

  // 値を取得
  getValue(): string {
    return this.value;
  }

  // 同値性の比較
  equals(other: PopId): boolean {
    return this.value === other.value;
  }

  // 文字列表現
  toString(): string {
    return this.value;
  }
}
