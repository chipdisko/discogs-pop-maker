import { PopResponse, ReleaseResponse, BadgeResponse } from "./PopDtos";

// ========== リクエストDTO ==========

export interface GeneratePrintDataRequest {
  popIds: string[];
  dpi?: number; // デフォルト300dpi
}

// ========== レスポンスDTO ==========

export interface PrintDataResponse {
  layout: A4LayoutResponse;
  canvasData: CanvasDataResponse[];
  totalPages: number;
  totalPops: number;
}

export interface A4LayoutResponse {
  pages: A4PageResponse[];
  totalPops: number;
}

export interface A4PageResponse {
  pageNumber: number;
  pops: PopLayoutPositionResponse[];
  dimensions: A4DimensionsResponse;
  cutLines: never[]; // 空配列を返す（後方互換性のため）
}

export interface PopLayoutPositionResponse {
  pop: PopResponse;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  cssPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  printPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface A4DimensionsResponse {
  width: number; // 210mm
  height: number; // 297mm
  cssPixels: {
    width: number;
    height: number;
  };
  printPixels: {
    width: number;
    height: number;
  };
}

// ========== Canvas用データ ==========

export interface CanvasDataResponse {
  pageNumber: number;
  width: number; // ピクセル
  height: number; // ピクセル
  backgroundColor: string;
  elements: CanvasElementResponse[];
}

export interface CanvasElementResponse {
  type: "pop" | "text" | "badge";
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: PopElementData | TextElementData | BadgeElementData;
}

// 要素固有のデータ型
export interface PopElementData {
  popId: string;
  release: ReleaseResponse;
  comment: string;
  badges: BadgeResponse[];
}

export interface TextElementData {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
}

export interface BadgeElementData {
  badgeType: string;
  displayName: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}

// ========== ポップテンプレート用 ==========

export interface PopTemplateData {
  pop: PopResponse;
  layout: {
    title: TextLayoutData;
    artist: TextLayoutData;
    label: TextLayoutData;
    country: TextLayoutData;
    releaseDate: TextLayoutData;
    genres: TextLayoutData;
    styles: TextLayoutData;
    comment: TextLayoutData;
    badges: BadgeLayoutData[];
  };
}

export interface TextLayoutData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
}

export interface BadgeLayoutData {
  type: string;
  displayName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}
