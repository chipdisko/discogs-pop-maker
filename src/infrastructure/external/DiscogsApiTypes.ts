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
