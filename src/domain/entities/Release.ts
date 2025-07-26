export class Release {
  constructor(
    private readonly discogsId: string,
    private readonly title: string,
    private readonly artistName: string,
    private readonly label: string,
    private readonly country: string,
    private readonly releaseDate: string,
    private readonly genres: string[],
    private readonly styles: string[]
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.discogsId || this.discogsId.trim() === "") {
      throw new Error("Discogs IDは必須です");
    }

    if (!this.title || this.title.trim() === "") {
      throw new Error("タイトルは必須です");
    }

    if (!this.artistName || this.artistName.trim() === "") {
      throw new Error("アーティスト名は必須です");
    }
  }

  // ファクトリーメソッド
  static create(params: {
    discogsId: string;
    title: string;
    artistName: string;
    label?: string;
    country?: string;
    releaseDate?: string;
    genres?: string[];
    styles?: string[];
  }): Release {
    return new Release(
      params.discogsId,
      params.title,
      params.artistName,
      params.label || "",
      params.country || "",
      params.releaseDate || "",
      params.genres || [],
      params.styles || []
    );
  }

  // Discogs IDを取得
  getDiscogsId(): string {
    return this.discogsId;
  }

  // タイトルを取得
  getTitle(): string {
    return this.title;
  }

  // アーティスト名を取得
  getArtistName(): string {
    return this.artistName;
  }

  // レーベルを取得
  getLabel(): string {
    return this.label;
  }

  // 国を取得
  getCountry(): string {
    return this.country;
  }

  // リリース日を取得
  getReleaseDate(): string {
    return this.releaseDate;
  }

  // ジャンルを取得
  getGenres(): string[] {
    return [...this.genres];
  }

  // スタイルを取得
  getStyles(): string[] {
    return [...this.styles];
  }

  // フルタイトル（アーティスト - タイトル）
  getFullTitle(): string {
    return `${this.artistName} - ${this.title}`;
  }

  // リリース年を取得
  getReleaseYear(): string {
    if (!this.releaseDate) return "";
    // 日付形式から年を抽出
    const year = this.releaseDate.match(/\d{4}/);
    return year ? year[0] : "";
  }

  // ジャンル/スタイルの文字列を取得
  getGenreStyleString(): string {
    const allTags = [...this.genres, ...this.styles];
    return allTags.join(", ");
  }

  // 同値性の比較（Discogs IDで判定）
  equals(other: Release): boolean {
    return this.discogsId === other.discogsId;
  }

  // 文字列表現
  toString(): string {
    return this.getFullTitle();
  }
}
