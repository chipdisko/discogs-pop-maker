import { ConditionType } from "../../domain";

// ========== リクエストDTO ==========

export interface CreatePopRequest {
  // Discogs URL（オプション）
  discogsUrl?: string;
  discogsType?: "release" | "master"; // URLタイプを追加

  // リリース情報（手動入力またはDiscogsデータ）
  title?: string;
  artistName?: string;
  label?: string;
  country?: string;
  releaseDate?: string;
  genres?: string[];
  styles?: string[];

  // ユーザー入力
  comment?: string;
  badgeId?: string | null; // バッジID
  condition?: ConditionType;
  price?: number;
}

export interface UpdatePopRequest {
  id: string;
  // リリース情報の更新
  title?: string;
  artistName?: string;
  label?: string;
  country?: string;
  releaseDate?: string;
  genres?: string[];
  styles?: string[];
  // ユーザー入力の更新
  comment?: string;
  badgeId?: string | null; // バッジID
  condition?: ConditionType;
  price?: number;
}

// カスタムバッジ関連のリクエストは別途管理

// ========== レスポンスDTO ==========

export interface PopResponse {
  id: string;
  release: ReleaseResponse;
  comment: string;
  badgeId?: string | null; // バッジID
  condition: ConditionType;
  price: number;
  dimensions: DimensionsResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseResponse {
  discogsId: string;
  discogsType?: "release" | "master"; // URLタイプを追加
  title: string;
  artistName: string;
  label: string;
  country: string;
  releaseDate: string;
  genres: string[];
  styles: string[];
  fullTitle: string;
  releaseYear: string;
  genreStyleString: string;
}

// BadgeResponse削除 - カスタムバッジに置き換え

export interface DimensionsResponse {
  width: number;
  height: number;
  area: number;
  aspectRatio: number;
  isLandscape: boolean;
  isPortrait: boolean;
  cssPixels: {
    width: number;
    height: number;
  };
  printPixels: {
    width: number;
    height: number;
  };
}

// ========== リストレスポンス ==========

export interface PopListResponse {
  pops: PopResponse[];
  total: number;
}

// ========== エラーレスポンス ==========

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: string;
}
