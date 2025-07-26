import { Release } from "../entities/Release";
import { DiscogsUrl } from "../value-objects/DiscogsUrl";

export interface DiscogsRepository {
  /**
   * Discogs URLからリリース情報を取得
   */
  getReleaseByUrl(url: DiscogsUrl): Promise<Release>;

  /**
   * Discogs IDからリリース情報を取得
   */
  getReleaseById(id: string, type: "release" | "master"): Promise<Release>;

  /**
   * API接続状態をチェック
   */
  checkConnection(): Promise<boolean>;
}
