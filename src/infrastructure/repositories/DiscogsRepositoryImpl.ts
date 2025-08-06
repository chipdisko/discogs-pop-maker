import { DiscogsRepository, DiscogsUrl, Release } from "../../domain";
import { DiscogsReleaseData } from "../external/DiscogsApiTypes";

export class DiscogsRepositoryImpl implements DiscogsRepository {
  /**
   * Discogs URLからリリース情報を取得
   */
  async getReleaseByUrl(url: DiscogsUrl): Promise<Release> {
    try {
      const response = await fetch("/api/discogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.getValue() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Discogs API エラー");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("無効なレスポンス形式");
      }

      // Discogs URLのタイプを取得 (master or release)
      const discogsType = result.type as "release" | "master" | undefined;

      // Discogs APIレスポンスをReleaseエンティティに変換
      return this.mapDiscogsDataToRelease(result.data, discogsType);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Discogs情報の取得に失敗しました");
    }
  }

  /**
   * Discogs IDからリリース情報を取得
   */
  async getReleaseById(
    id: string,
    type: "release" | "master"
  ): Promise<Release> {
    // URLを構築してgetReleaseByUrlを使用
    const urlString = `https://www.discogs.com/${type}/${id}`;
    const url = new DiscogsUrl(urlString);
    // getReleaseByUrlの中でtypeが設定されるため、そのまま利用
    return this.getReleaseByUrl(url);
  }

  /**
   * API接続状態をチェック
   */
  async checkConnection(): Promise<boolean> {
    try {
      // 簡単なテスト用URL（有名なリリース）でAPIテスト
      const testUrl = new DiscogsUrl("https://www.discogs.com/release/1");
      await this.getReleaseByUrl(testUrl);
      return true;
    } catch {
      return false;
    }
  }

  // ========== プライベートメソッド ==========

  /**
   * Discogs APIレスポンスをReleaseエンティティに変換
   */
  private mapDiscogsDataToRelease(data: DiscogsReleaseData, discogsType?: "release" | "master"): Release {
    // アーティスト名を抽出
    const artistName = this.extractArtistName(data);

    // タイトルを取得
    const title = data.title || "";

    // Discogs IDを取得（有効性を検証）
    const discogsId = data.id?.toString();
    if (!discogsId || discogsId.trim() === "") {
      throw new Error("有効なDiscogs IDが取得できませんでした");
    }

    // レーベル情報を抽出
    const label = this.extractLabel(data);

    // 国を取得
    const country = data.country || "";

    // リリース日を抽出
    const releaseDate = this.extractReleaseDate(data);

    // ジャンル・スタイルを抽出
    const genres = data.genres || [];
    const styles = data.styles || [];

    return Release.create({
      discogsId,
      discogsType,
      title,
      artistName,
      label,
      country,
      releaseDate,
      genres,
      styles,
    });
  }

  /**
   * アーティスト名を抽出
   */
  private extractArtistName(data: DiscogsReleaseData): string {
    if (
      data.artists &&
      Array.isArray(data.artists) &&
      data.artists.length > 0
    ) {
      return data.artists.map((artist) => artist.name).join(", ");
    }

    // マスターリリースの場合
    if (data.main_release && data.main_release.artist) {
      return data.main_release.artist;
    }

    return "Unknown Artist";
  }

  /**
   * レーベル情報を抽出
   */
  private extractLabel(data: DiscogsReleaseData): string {
    if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
      return data.labels.map((label) => label.name).join(", ");
    }

    return "";
  }

  /**
   * リリース日を抽出
   */
  private extractReleaseDate(data: DiscogsReleaseData): string {
    // リリース日の優先順位
    if (data.released) {
      return data.released;
    }

    if (data.year) {
      return data.year.toString();
    }

    // マスターリリースの場合
    if (data.main_release && data.main_release.year) {
      return data.main_release.year.toString();
    }

    return "";
  }
}
