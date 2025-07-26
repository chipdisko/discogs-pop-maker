export class Comment {
  private static readonly MAX_LENGTH = 200;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (value.length > Comment.MAX_LENGTH) {
      throw new Error(`コメントは${Comment.MAX_LENGTH}文字以内にしてください`);
    }
  }

  // 値を取得
  getValue(): string {
    return this.value;
  }

  // 空かどうか
  isEmpty(): boolean {
    return this.value.trim() === "";
  }

  // 文字数を取得
  getLength(): number {
    return this.value.length;
  }

  // 同値性の比較
  equals(other: Comment): boolean {
    return this.value === other.value;
  }

  // 文字列表現
  toString(): string {
    return this.value;
  }

  // 空のコメントを作成
  static empty(): Comment {
    return new Comment("");
  }

  // 最大文字数を取得
  static getMaxLength(): number {
    return Comment.MAX_LENGTH;
  }
}
