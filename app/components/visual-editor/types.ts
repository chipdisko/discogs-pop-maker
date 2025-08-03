export interface VisualTemplate {
  id: string;
  name: string;
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
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: ShadowStyle;
  opacity?: number;
  // テキスト要素の自動調整
  scaleX?: number; // 横方向の圧縮率（0.5〜1.0）
  scaleY?: number; // 縦方向の圧縮率（0.5〜1.0）
  minFontSize?: number; // 自動調整時の最小フォントサイズ
  maxLines?: number; // 最大行数
  overflow?: 'clip' | 'scale' | 'shrink' | 'auto'; // オーバーフロー時の処理
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
  value?: any;
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
  isDragging: boolean;
  zoom: number; // 50-200%
  panOffset: { x: number; y: number };
  showBackSidePreview: boolean; // 裏面の回転プレビュー表示
}

// ドラッグ&ドロップ用
export interface DragItem {
  id?: string;
  type: 'new' | 'existing';
  elementType?: TemplateElement['type'];
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
  gridSize: 1, // 1mm
  snapToGrid: true,
  showGuides: true,
  showFoldLine: true,
};