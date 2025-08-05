import type { VisualTemplate, TemplateElement, BackgroundFrame } from '../types';
import { DEFAULT_ELEMENT_STYLE, DEFAULT_TEMPLATE_SETTINGS, POP_DIMENSIONS } from '../types';

export function createDefaultTemplate(): VisualTemplate {
  return {
    id: `template-${Date.now()}`,
    name: 'デフォルトテンプレート',
    backgroundFrames: [], // 空の配列で初期化
    settings: DEFAULT_TEMPLATE_SETTINGS,
    elements: [
      // 裏面要素（軒先レコード）
      {
        id: 'backside-shop-name',
        type: 'text',
        dataBinding: 'custom',
        customText: '軒先レコード',
        position: { x: POP_DIMENSIONS.WIDTH / 2 - 20, y: 7.5 },
        size: { width: 40, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          color: '#1e293b',
        },
        isBackSide: true,
        autoRotate: true,
      },
      // 表面要素
      {
        id: 'artist',
        type: 'text',
        dataBinding: 'artist',
        position: { x: 5, y: 20 },
        size: { width: 95, height: 8 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 18,
          fontFamily: 'Arial, sans-serif',
          color: '#1e293b',
        },
      },
      {
        id: 'title',
        type: 'text',
        dataBinding: 'title',
        position: { x: 5, y: 32 },
        size: { width: 95, height: 10 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 16,
          fontFamily: 'Arial, sans-serif',
          color: '#334155',
        },
      },
      {
        id: 'label',
        type: 'text',
        dataBinding: 'label',
        position: { x: 5, y: 45 },
        size: { width: 40, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 12,
          color: '#666666',
        },
      },
      {
        id: 'country-year',
        type: 'text',
        dataBinding: 'countryYear',
        position: { x: 50, y: 45 },
        size: { width: 30, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 12,
          color: '#666666',
        },
      },
      {
        id: 'condition',
        type: 'text',
        dataBinding: 'condition',
        position: { x: 85, y: 45 },
        size: { width: 15, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 14,
          color: '#1e293b',
        },
      },
      {
        id: 'genre',
        type: 'text',
        dataBinding: 'genre',
        position: { x: 5, y: 53 },
        size: { width: 95, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 11,
          color: '#333333',
        },
      },
      {
        id: 'price',
        type: 'text',
        dataBinding: 'price',
        position: { x: 5, y: 62 },
        size: { width: 30, height: 8 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 20,
          fontFamily: 'Arial, sans-serif',
          color: '#1e293b',
        },
      },
    ],
  };
}

export function generateElementId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isInBackSide(y: number): boolean {
  return y < POP_DIMENSIONS.FOLD_LINE_Y;
}

export function createElement(
  type: TemplateElement['type'],
  dataBinding: string,
  position: { x: number; y: number }
): TemplateElement {
  const id = generateElementId(type);
  const isBackSide = isInBackSide(position.y);
  
  const baseElement: TemplateElement = {
    id,
    type,
    dataBinding,
    position,
    size: { width: 30, height: 8 }, // デフォルトサイズ
    style: { ...DEFAULT_ELEMENT_STYLE },
    isBackSide,
    autoRotate: isBackSide,
  };

  // タイプごとの特別な設定
  switch (type) {
    case 'text':
      if (dataBinding === 'custom') {
        baseElement.customText = 'カスタムテキスト';
      }
      break;
    case 'image':
      baseElement.size = { width: 40, height: 30 }; // 4:3のアスペクト比
      baseElement.imageSettings = {
        src: '', // 空の画像として開始
        fileName: '',
        originalWidth: 0,
        originalHeight: 0,
      };
      break;
    case 'qrcode':
      baseElement.size = { width: 20, height: 20 }; // 正方形
      baseElement.qrSettings = {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: '#000000',
        backgroundColor: '#ffffff',
      };
      break;
    case 'badge':
      baseElement.size = { width: 20, height: 6 };
      break;
  }

  return baseElement;
}

export function createBackgroundFrame(
  type: BackgroundFrame['type'],
  position: { x: number; y: number }
): BackgroundFrame {
  const id = generateElementId(`frame-${type}`);
  const isBackSide = isInBackSide(position.y);
  
  const baseFrame: BackgroundFrame = {
    id,
    type,
    position,
    size: { width: 30, height: 20 }, // デフォルトサイズ
    style: {
      strokeColor: '#000000',
      strokeWidth: 1,
      opacity: 1,
    },
    zIndex: 1,
    isBackSide,
    autoRotate: isBackSide,
  };

  // タイプごとの特別な設定
  switch (type) {
    case 'rectangle':
    case 'roundedRectangle':
      baseFrame.style.fillColor = 'transparent';
      if (type === 'roundedRectangle') {
        baseFrame.style.borderRadius = 5;
      }
      break;
    case 'circle':
      baseFrame.size = { width: 20, height: 20 }; // 正円
      baseFrame.style.fillColor = 'transparent';
      break;
    case 'line':
      baseFrame.lineStart = { x: position.x, y: position.y };
      baseFrame.lineEnd = { x: position.x + 30, y: position.y };
      // 始点と終点から適切なサイズを計算
      baseFrame.size = { width: 30, height: 1 }; // 最小高さ1mmを確保
      baseFrame.position = { x: position.x, y: position.y };
      break;
    case 'text':
      baseFrame.text = 'テキスト';
      baseFrame.fontFamily = 'Arial, sans-serif';
      baseFrame.style.fontSize = 12;
      baseFrame.style.color = '#000000';
      baseFrame.size = { width: 40, height: 8 };
      break;
  }

  return baseFrame;
}