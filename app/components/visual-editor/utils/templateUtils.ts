import type { VisualTemplate, TemplateElement } from '../types';
import { DEFAULT_ELEMENT_STYLE, DEFAULT_TEMPLATE_SETTINGS, POP_DIMENSIONS } from '../types';

export function createDefaultTemplate(): VisualTemplate {
  return {
    id: `template-${Date.now()}`,
    name: 'デフォルトテンプレート',
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