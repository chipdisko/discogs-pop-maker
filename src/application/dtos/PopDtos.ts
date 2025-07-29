import { BadgeType, ConditionType } from "../../domain";

// ========== リクエストDTO ==========

export interface CreatePopRequest {
  // Discogs URL（オプション）
  discogsUrl?: string;

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
  badges?: BadgeType[];
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
  badges?: BadgeType[];
  condition?: ConditionType;
  price?: number;
}

export interface AddBadgeRequest {
  popId: string;
  badge: BadgeType;
}

export interface RemoveBadgeRequest {
  popId: string;
  badge: BadgeType;
}

// ========== レスポンスDTO ==========

export interface PopResponse {
  id: string;
  release: ReleaseResponse;
  comment: string;
  badges: BadgeResponse[];
  condition: ConditionType;
  price: number;
  dimensions: DimensionsResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseResponse {
  discogsId: string;
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

export interface BadgeResponse {
  type: BadgeType;
  displayName: string;
}

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
