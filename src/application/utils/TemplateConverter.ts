import { 
  VisualTemplateData, 
  BackgroundFrameData, 
  TemplateElementData, 
  TemplateSettingsData 
} from '../dtos/PrintDtos';

// ビジュアルエディターの型（フロントエンド）からPrintDTO（バックエンド）への変換

export interface VisualTemplate {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrame[];
  elements: TemplateElement[];
  settings: TemplateSettings;
}

export interface BackgroundFrame {
  id: string;
  type: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: FrameStyle;
  zIndex: number;
  text?: string;
  fontFamily?: string;
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
  isBackSide?: boolean;
  autoRotate?: boolean;
}

export interface FrameStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  lineStyle?: "solid" | "dashed" | "dotted";
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'badge' | 'image' | 'shape' | 'qrcode';
  dataBinding: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: ElementStyle;
  conditions?: DisplayCondition[];
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
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  minFontSize?: number;
  maxLines?: number;
  overflow?: 'clip' | 'scale' | 'shrink' | 'auto';
}

export interface DisplayCondition {
  field: string;
  operator: 'exists' | 'equals' | 'contains' | 'greater' | 'less';
  value?: string | number | boolean;
}

export interface TemplateSettings {
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  showFoldLine: boolean;
}

export class TemplateConverter {
  /**
   * フロントエンドのVisualTemplateをバックエンドのDTOに変換
   */
  static toVisualTemplateData(template: VisualTemplate): VisualTemplateData {
    return {
      id: template.id,
      name: template.name,
      backgroundFrames: template.backgroundFrames.map(this.toBackgroundFrameData),
      elements: template.elements.map(this.toTemplateElementData),
      settings: this.toTemplateSettingsData(template.settings),
    };
  }

  /**
   * バックエンドのDTOをフロントエンドのVisualTemplateに変換
   */
  static fromVisualTemplateData(data: VisualTemplateData): VisualTemplate {
    return {
      id: data.id,
      name: data.name,
      backgroundFrames: data.backgroundFrames.map(this.fromBackgroundFrameData),
      elements: data.elements.map(this.fromTemplateElementData),
      settings: this.fromTemplateSettingsData(data.settings),
    };
  }

  private static toBackgroundFrameData(frame: BackgroundFrame): BackgroundFrameData {
    return {
      id: frame.id,
      type: frame.type,
      position: frame.position,
      size: frame.size,
      style: frame.style,
      zIndex: frame.zIndex,
      text: frame.text,
      fontFamily: frame.fontFamily,
      lineStart: frame.lineStart,
      lineEnd: frame.lineEnd,
      isBackSide: frame.isBackSide,
      autoRotate: frame.autoRotate,
    };
  }

  private static fromBackgroundFrameData(data: BackgroundFrameData): BackgroundFrame {
    return {
      id: data.id,
      type: data.type,
      position: data.position,
      size: data.size,
      style: data.style,
      zIndex: data.zIndex,
      text: data.text,
      fontFamily: data.fontFamily,
      lineStart: data.lineStart,
      lineEnd: data.lineEnd,
      isBackSide: data.isBackSide,
      autoRotate: data.autoRotate,
    };
  }

  private static toTemplateElementData(element: TemplateElement): TemplateElementData {
    return {
      id: element.id,
      type: element.type,
      dataBinding: element.dataBinding,
      position: element.position,
      size: element.size,
      style: element.style || {},
      isBackSide: element.isBackSide,
      autoRotate: element.autoRotate,
      customText: element.customText,
      label: element.label,
      qrSettings: element.qrSettings,
    };
  }

  private static fromTemplateElementData(data: TemplateElementData): TemplateElement {
    return {
      id: data.id,
      type: data.type,
      dataBinding: data.dataBinding,
      position: data.position,
      size: data.size,
      style: data.style,
      isBackSide: data.isBackSide,
      autoRotate: data.autoRotate,
      customText: data.customText,
      label: data.label,
      qrSettings: data.qrSettings,
    };
  }

  private static toTemplateSettingsData(settings: TemplateSettings): TemplateSettingsData {
    return {
      gridSize: settings.gridSize,
      snapToGrid: settings.snapToGrid,
      showGuides: settings.showGuides,
      showFoldLine: settings.showFoldLine,
    };
  }

  private static fromTemplateSettingsData(data: TemplateSettingsData): TemplateSettings {
    return {
      gridSize: data.gridSize,
      snapToGrid: data.snapToGrid,
      showGuides: data.showGuides,
      showFoldLine: data.showFoldLine,
    };
  }
}