// Discogs API レスポンスの型定義

export interface DiscogsArtist {
  name: string;
  role?: string;
  id?: number;
}

export interface DiscogsLabel {
  name: string;
  catno?: string;
  id?: number;
}

export interface DiscogsReleaseData {
  id: number;
  title: string;
  artists?: DiscogsArtist[];
  year?: number;
  released?: string;
  country?: string;
  genres?: string[];
  styles?: string[];
  labels?: DiscogsLabel[];
  main_release?: {
    artist: string;
    year: number;
  };
}

export interface DiscogsApiResponse {
  success: boolean;
  type: string;
  data: DiscogsReleaseData;
}

export interface DiscogsApiErrorResponse {
  error: string;
}

// 価格提案APIの型定義
export interface PriceSuggestion {
  condition: string;
  price: number;
  currency: string;
}

export interface PriceSuggestionsResponse {
  success: boolean;
  data: PriceSuggestion[];
  error?: string;
}

export interface DiscogsPriceSuggestionsData {
  [condition: string]: {
    price: number;
    currency: string;
  };
}
