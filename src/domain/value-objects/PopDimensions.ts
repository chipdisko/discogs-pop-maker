export class PopDimensions {
  // 標準サイズ（ハガキの半分）
  static readonly STANDARD = new PopDimensions(100, 74);

  constructor(private readonly width: number, private readonly height: number) {
    this.validate(width, height);
  }

  private validate(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error("幅と高さは0より大きい値である必要があります");
    }

    if (width > 1000 || height > 1000) {
      throw new Error("サイズが大きすぎます（最大1000mm）");
    }
  }

  // 幅を取得（mm）
  getWidth(): number {
    return this.width;
  }

  // 高さを取得（mm）
  getHeight(): number {
    return this.height;
  }

  // 面積を計算（mm²）
  getArea(): number {
    return this.width * this.height;
  }

  // アスペクト比を計算
  getAspectRatio(): number {
    return this.width / this.height;
  }

  // 横向きかどうか
  isLandscape(): boolean {
    return this.width > this.height;
  }

  // 縦向きかどうか
  isPortrait(): boolean {
    return this.height > this.width;
  }

  // 正方形かどうか
  isSquare(): boolean {
    return this.width === this.height;
  }

  // 同値性の比較
  equals(other: PopDimensions): boolean {
    return this.width === other.width && this.height === other.height;
  }

  // 文字列表現
  toString(): string {
    return `${this.width}mm × ${this.height}mm`;
  }

  // CSS用のピクセル値に変換（96dpi基準）
  toCssPixels(): { width: number; height: number } {
    const mmToPixel = (mm: number) => Math.round(mm * 3.7795); // 96dpi
    return {
      width: mmToPixel(this.width),
      height: mmToPixel(this.height),
    };
  }

  // 印刷用の高解像度ピクセル値に変換（300dpi基準）
  toPrintPixels(): { width: number; height: number } {
    const mmToPixel = (mm: number) => Math.round(mm * 11.811); // 300dpi
    return {
      width: mmToPixel(this.width),
      height: mmToPixel(this.height),
    };
  }
}
