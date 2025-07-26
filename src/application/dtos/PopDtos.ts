import { BadgeType } from "../../domain";

// ========== リクエストDTO ==========

export interface CreatePopRequest {
  discogsUrl: string;
  comment?: string;
  badges?: BadgeType[];
}

export interface UpdatePopRequest {
  id: string;
  comment?: string;
  badges?: BadgeType[];
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
