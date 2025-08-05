export interface VisualTemplate {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrame[]; // 新規追加
  elements: TemplateElement[];
  settings: TemplateSettings;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'badge' | 'image' | 'shape' | 'qrcode';
  dataBinding: string; // 'artist', 'title', 'price', 'discogsUrl', 'custom' etc.
  position: { x: number; y: number }; // 単位：mm、左上が原点
  size: { width: number; height: number }; // 単位：mm
  style?: ElementStyle;
  conditions?: DisplayCondition[];
  // 位置による自動処理
  isBackSide?: boolean; // 裏面エリア（y < 15mm）に配置されているか
  autoRotate?: boolean; // 裏面エリアで自動180度回転（デフォルトtrue）
  // カスタムテキスト用
  customText?: string; // dataBindingが'custom'の場合の任意テキスト
  // データ名ラベル設定
  label?: {
    show: boolean; // ラベル表示するかどうか
    text?: string; // カスタムラベルテキスト（未設定時はデフォルト）
    fontSize?: number; // ラベルフォントサイズ（デフォルト12px）
    color?: string; // ラベル文字色（デフォルト#666666）
  };
  // QRコード要素専用
  qrSettings?: {
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number; // QRコード内部の余白
    color: string; // 前景色（通常は黒）
    backgroundColor: string; // 背景色（通常は白）
  };
  // 画像要素専用
  imageSettings?: {
    src: string; // 画像のData URL
    fileName?: string; // ファイル名
    originalWidth: number; // 元の画像サイズ（px）
    originalHeight: number; // 元の画像サイズ（px）
    crop?: {
      x: number; // クロップ開始位置（元画像に対する比率 0-1）
      y: number; // クロップ開始位置（元画像に対する比率 0-1）
      width: number; // クロップ幅（元画像に対する比率 0-1）
      height: number; // クロップ高さ（元画像に対する比率 0-1）
    };
  };
}

export interface BackgroundFrame {
  id: string;
  type: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  position: { x: number; y: number }; // 単位：mm、左上が原点
  size: { width: number; height: number }; // 単位：mm
  style: FrameStyle;
  zIndex: number; // 重なり順序
  // テキスト用プロパティ
  text?: string;
  fontFamily?: string;
  // 線用プロパティ
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
  // 位置による自動処理
  isBackSide?: boolean; // 裏面エリア（y < 15mm）に配置されているか
  autoRotate?: boolean; // 裏面エリアで自動180度回転
}

export interface FrameStyle {
  fillColor?: string; // 塗りつぶし色
  strokeColor?: string; // 枠線色
  strokeWidth?: number; // 枠線太さ
  borderRadius?: number; // 角丸半径（角丸四角形用）
  fontSize?: number; // フォントサイズ（テキスト用）
  color?: string; // 文字色（テキスト用）
  opacity?: number; // 透明度
  lineStyle?: "solid" | "dashed" | "dotted"; // 線のスタイル
}

// 枠線の詳細設定用
export interface BorderStyle {
  color: string; // 枠線の色
  width: number; // 枠線の太さ（mm単位、0.5mm刻み）
  style: "solid" | "dashed" | "dotted" | "double" | "none"; // 線のタイプ
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  // 詳細な枠線設定
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
  // 詳細な角丸設定
  borderTopLeftRadius?: number; // 左上の角丸（mm単位）
  borderTopRightRadius?: number; // 右上の角丸（mm単位）
  borderBottomRightRadius?: number; // 右下の角丸（mm単位）
  borderBottomLeftRadius?: number; // 左下の角丸（mm単位）
  shadow?: ShadowStyle;
  opacity?: number;
  // テキスト要素の自動調整
  scaleX?: number; // 横方向の圧縮率（0.5〜1.0）
  scaleY?: number; // 縦方向の圧縮率（0.5〜1.0）
  minFontSize?: number; // 自動調整時の最小フォントサイズ
  maxLines?: number; // 最大行数
  overflow?: 'clip' | 'scale' | 'shrink' | 'auto'; // オーバーフロー時の処理
  // テキスト配置設定
  textAlign?: "left" | "center" | "right"; // 水平方向の配置
  verticalAlign?: "top" | "middle" | "bottom"; // 垂直方向の配置
}

export interface ShadowStyle {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface DisplayCondition {
  field: string;
  operator: 'exists' | 'equals' | 'contains' | 'greater' | 'less';
  value?: string | number | boolean;
}

export interface TemplateSettings {
  gridSize: number; // グリッドサイズ（mm単位）
  snapToGrid: boolean;
  showGuides: boolean;
  showFoldLine: boolean;
}

// エディタの状態管理用
export interface EditorState {
  selectedElementId: string | null;
  selectedBackgroundFrameId: string | null; // 新規追加
  isDragging: boolean;
  zoom: number; // 50-200%
  panOffset: { x: number; y: number };
  showBackSidePreview: boolean; // 裏面の回転プレビュー表示
  editMode: "background" | "elements"; // 新規追加
}

// ドラッグ&ドロップ用
export interface DragItem {
  id?: string;
  type: 'new' | 'existing';
  elementType?: TemplateElement['type'];
  frameType?: BackgroundFrame['type']; // 背景枠用
  dataBinding?: string;
  position?: { x: number; y: number };
}

export interface DropResult {
  success?: boolean;
  delta?: { x: number; y: number };
}

// POP寸法定数
export const POP_DIMENSIONS = {
  WIDTH: 105, // mm
  HEIGHT: 74, // mm
  FOLD_LINE_Y: 15, // mm
} as const;

// デフォルト値
export const DEFAULT_ELEMENT_STYLE: Partial<ElementStyle> = {
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  color: '#1e293b',
  opacity: 1,
};

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  gridSize: 2, // 2mm
  snapToGrid: true,
  showGuides: true,
  showFoldLine: true,
};