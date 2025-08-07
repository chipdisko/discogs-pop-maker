/**
 * カスタムバッジ機能の型定義
 */

// カスタムバッジの基本型
export interface CustomBadge {
  id: string; // 一意ID
  name: string; // バッジ名（「おすすめ」「新入荷」など）
  type: 'text' | 'image'; // テキストバッジ or 画像バッジ
  
  // 形状・サイズ設定
  shape: 'circle' | 'rectangle'; // 形状
  width: number; // 幅(mm)
  height: number; // 高さ(mm)
  borderRadius?: number; // 角丸半径(mm) - rectangleの時のみ
  
  // テキストバッジの設定
  text?: string; // 表示テキスト（「MUST」「★★★」など）
  backgroundColor?: string; // 背景色（デフォルト: #3b82f6）
  textColor?: string; // 文字色（デフォルト: #ffffff）
  fontSize?: number; // フォントサイズ（デフォルト: 12px）
  
  // 枠線設定
  borderEnabled?: boolean; // 枠線の有無
  borderColor?: string; // 枠線の色
  borderWidth?: number; // 枠線の太さ(mm)
  
  // バッジ配置設定（ビジュアルエディタで使用）
  badgeAlign?: 'left' | 'center' | 'right'; // 要素エリア内の水平配置
  badgeVerticalAlign?: 'top' | 'middle' | 'bottom'; // 要素エリア内の垂直配置
  
  // 画像バッジの設定
  imageSettings?: {
    src: string; // 画像のData URL
    fileName?: string;
    originalWidth: number;
    originalHeight: number;
    crop?: {
      x: number; // クロップ開始位置（元画像に対する比率 0-1）
      y: number; // クロップ開始位置（元画像に対する比率 0-1）
      width: number; // クロップ幅（元画像に対する比率 0-1）
      height: number; // クロップ高さ（元画像に対する比率 0-1）
    };
  };
  
  createdAt: number; // 作成日時
  updatedAt: number; // 更新日時
}

// LocalStorage管理用の型
export interface CustomBadgeStorage {
  badges: CustomBadge[]; // 最大5個
  version: string; // データバージョン管理（将来のマイグレーション用）
}

// バッジ作成・編集用の入力型
export interface CustomBadgeInput {
  name: string;
  type: 'text' | 'image';
  
  // 形状・サイズ設定
  shape: 'circle' | 'rectangle';
  width: number;
  height: number;
  borderRadius?: number;
  
  // テキスト設定
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  
  // 枠線設定
  borderEnabled?: boolean;
  borderColor?: string;
  borderWidth?: number;
  
  // バッジ配置設定
  badgeAlign?: 'left' | 'center' | 'right';
  badgeVerticalAlign?: 'top' | 'middle' | 'bottom';
  
  imageSettings?: CustomBadge['imageSettings'];
}

// デフォルト値
export const DEFAULT_CUSTOM_BADGE_VALUES = {
  // 形状・サイズ
  shape: 'circle' as const,
  width: 20,
  height: 20,
  borderRadius: 4,
  
  // テキスト設定
  backgroundColor: '#3b82f6', // blue-500
  textColor: '#ffffff', // white
  fontSize: 12,
  text: 'バッジ',
  
  // 枠線設定
  borderEnabled: true,
  borderColor: '#ffffff', // white
  borderWidth: 1,
  
  // バッジ配置設定
  badgeAlign: 'center' as const,
  badgeVerticalAlign: 'middle' as const,
} as const;

// バッジの制限値
export const CUSTOM_BADGE_LIMITS = {
  MAX_COUNT: 5, // 最大作成可能数
  MAX_NAME_LENGTH: 20, // バッジ名最大文字数
  MAX_TEXT_LENGTH: 10, // テキスト最大文字数（目安）
  
  // サイズ制限
  MIN_SIZE: 10, // 最小サイズ(mm)
  MAX_SIZE: 50, // 最大サイズ(mm)
  MIN_BORDER_RADIUS: 0, // 最小角丸(mm)
  MAX_BORDER_RADIUS: 10, // 最大角丸(mm)
  
  // フォント制限
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 24,
  
  // 枠線制限
  MIN_BORDER_WIDTH: 0.5,
  MAX_BORDER_WIDTH: 3,
} as const;

// LocalStorageのキー
export const CUSTOM_BADGE_STORAGE_KEY = 'discogs-pop-maker-custom-badges' as const;
export const CUSTOM_BADGE_STORAGE_VERSION = '1.0.0' as const;