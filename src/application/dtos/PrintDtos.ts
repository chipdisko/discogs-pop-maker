import { PopResponse, ReleaseResponse, BadgeResponse } from "./PopDtos";

// ========== リクエストDTO ==========

export interface GeneratePrintDataRequest {
  popIds: string[];
  dpi?: number; // デフォルト300dpi
  template?: VisualTemplateData; // カスタムテンプレート（オプション）
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
  type: "pop" | "text" | "badge" | "backgroundFrame";
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: PopElementData | TextElementData | BadgeElementData | BackgroundFrameElementData;
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

export interface BackgroundFrameElementData {
  frameType: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
    lineStyle?: "solid" | "dashed" | "dotted";
  };
  text?: string; // テキスト要素の場合
  fontFamily?: string; // テキスト要素の場合
  lineStart?: { x: number; y: number }; // 線要素の場合
  lineEnd?: { x: number; y: number }; // 線要素の場合
  zIndex?: number;
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

// ========== ビジュアルテンプレート用 ==========

export interface VisualTemplateData {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrameData[];
  elements: TemplateElementData[];
  settings: TemplateSettingsData;
}

export interface BackgroundFrameData {
  id: string;
  type: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  position: { x: number; y: number }; // mm
  size: { width: number; height: number }; // mm
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
    lineStyle?: "solid" | "dashed" | "dotted";
  };
  zIndex: number;
  text?: string;
  fontFamily?: string;
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
  isBackSide?: boolean;
  autoRotate?: boolean;
}

export interface TemplateElementData {
  id: string;
  type: 'text' | 'badge' | 'image' | 'shape' | 'qrcode';
  dataBinding: string;
  position: { x: number; y: number }; // mm
  size: { width: number; height: number }; // mm
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    // 詳細な枠線設定
    borderTop?: {
      color: string;
      width: number;
      style: "solid" | "dashed" | "dotted" | "double" | "none";
    };
    borderRight?: {
      color: string;
      width: number;
      style: "solid" | "dashed" | "dotted" | "double" | "none";
    };
    borderBottom?: {
      color: string;
      width: number;
      style: "solid" | "dashed" | "dotted" | "double" | "none";
    };
    borderLeft?: {
      color: string;
      width: number;
      style: "solid" | "dashed" | "dotted" | "double" | "none";
    };
    // 詳細な角丸設定
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomRightRadius?: number;
    borderBottomLeftRadius?: number;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    minFontSize?: number;
    maxLines?: number;
    overflow?: 'clip' | 'scale' | 'shrink' | 'auto';
    // テキスト配置設定
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    shadow?: {
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
  };
  conditions?: {
    field: string;
    operator: 'exists' | 'equals' | 'contains' | 'greater' | 'less';
    value?: string | number | boolean;
  }[];
  isBackSide?: boolean;
  autoRotate?: boolean;
  customText?: string;
  label?: {
    show: boolean;
    text?: string;
    fontSize?: number;
    color?: string;
  };
  qrSettings?: {
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number;
    color: string;
    backgroundColor: string;
  };
  imageSettings?: {
    src: string;
    fileName?: string;
    originalWidth: number;
    originalHeight: number;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export interface TemplateSettingsData {
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  showFoldLine: boolean;
}
