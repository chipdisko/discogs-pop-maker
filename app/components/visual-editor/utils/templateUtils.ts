import type {
  VisualTemplate,
  TemplateElement,
  BackgroundFrame,
} from "../types";
import {
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_TEMPLATE_SETTINGS,
  POP_DIMENSIONS,
} from "../types";

export function createDefaultTemplate(): VisualTemplate {
  return {
    id: `template-${Date.now()}`,
    name: "デフォルトテンプレート",
    backgroundFrames: [], // 空の配列で初期化
    settings: DEFAULT_TEMPLATE_SETTINGS,
    elements: [
      // 裏面要素（軒先レコード）
      {
        id: "backside-shop-name",
        type: "text",
        dataBinding: "custom",
        customText: "軒先レコード",
        position: { x: 32, y: 8 },
        size: { width: 40, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 14,
          fontFamily: "Arial, sans-serif",
          color: "#1e293b",
          textAlign: "left",
          alignItems: "center",
        },
        isBackSide: true,
        autoRotate: true,
      },
      // 表面要素
      {
        id: "artist",
        type: "text",
        dataBinding: "artist",
        position: { x: 6, y: 20 },
        size: { width: 94, height: 8 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 20,
          fontFamily: "Arial, sans-serif",
          color: "#1e293b",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "title",
        type: "text",
        dataBinding: "title",
        position: { x: 6, y: 32 },
        size: { width: 94, height: 10 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 18,
          fontFamily: "Arial, sans-serif",
          color: "#334155",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "label",
        type: "text",
        dataBinding: "label",
        position: { x: 6, y: 44 },
        size: { width: 38, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 12,
          color: "#666666",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "country-year",
        type: "text",
        dataBinding: "countryYear",
        position: { x: 50, y: 44 },
        size: { width: 30, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 12,
          color: "#666666",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "condition",
        type: "text",
        dataBinding: "condition",
        position: { x: 84, y: 44 },
        size: { width: 16, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 14,
          color: "#1e293b",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "genre",
        type: "text",
        dataBinding: "genre",
        position: { x: 6, y: 52 },
        size: { width: 94, height: 6 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 11,
          color: "#333333",
          textAlign: "left",
          alignItems: "center",
        },
      },
      {
        id: "price",
        type: "text",
        dataBinding: "price",
        position: { x: 6, y: 60 },
        size: { width: 30, height: 8 },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          fontSize: 20,
          fontFamily: "Arial, sans-serif",
          color: "#1e293b",
          textAlign: "right",
          alignItems: "center",
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
  type: TemplateElement["type"],
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
    case "text":
      // テキスト要素の初期配置設定
      if (dataBinding === "price") {
        // 価格は右寄せ/中央
        baseElement.style = {
          ...baseElement.style,
          textAlign: "right",
          alignItems: "center",
        };
      } else {
        // その他のテキスト要素は左寄せ/中央
        baseElement.style = {
          ...baseElement.style,
          textAlign: "left",
          alignItems: "center",
        };
      }

      if (dataBinding === "custom") {
        baseElement.customText = "カスタムテキスト";
      }
      break;
    case "image":
      baseElement.size = { width: 40, height: 30 }; // 4:3のアスペクト比
      baseElement.imageSettings = {
        src: "", // 空の画像として開始
        fileName: "",
        originalWidth: 0,
        originalHeight: 0,
      };
      break;
    case "qrcode":
      baseElement.size = { width: 20, height: 20 }; // 正方形
      baseElement.qrSettings = {
        errorCorrectionLevel: "M",
        margin: 2,
        color: "#000000",
        backgroundColor: "#ffffff",
      };
      break;
    case "badge":
      baseElement.size = { width: 20, height: 6 };
      break;
  }

  return baseElement;
}

export function createBackgroundFrame(
  type: BackgroundFrame["type"],
  position: { x: number; y: number }
): BackgroundFrame {
  const id = generateElementId(`frame-${type}`);
  const isBackSide = isInBackSide(position.y);

  const baseFrame: BackgroundFrame = {
    id,
    type,
    position: {
      x: Math.round(position.x / 2) * 2, // 2mmグリッドに合わせる
      y: Math.round(position.y / 2) * 2, // 2mmグリッドに合わせる
    },
    size: { width: 30, height: 20 }, // デフォルトサイズ
    style: {
      strokeColor: "#000000",
      strokeWidth: 1,
      opacity: 1,
    },
    zIndex: 1,
    isBackSide,
    autoRotate: isBackSide,
  };

  // タイプごとの特別な設定
  switch (type) {
    case "rectangle":
    case "roundedRectangle":
      baseFrame.style.fillColor = "transparent";
      if (type === "roundedRectangle") {
        baseFrame.style.borderRadius = 5;
      }
      break;
    case "circle":
      baseFrame.size = { width: 20, height: 20 }; // 正円
      baseFrame.style.fillColor = "transparent";
      break;
    case "line":
      // 2mmグリッドに合わせて初期位置を設定
      const startX = Math.round(position.x / 2) * 2;
      const startY = Math.round(position.y / 2) * 2;
      baseFrame.lineStart = { x: startX, y: startY };
      baseFrame.lineEnd = { x: startX + 30, y: startY };
      // 始点と終点から適切なサイズを計算
      baseFrame.size = { width: 30, height: 1 }; // 最小高さ1mmを確保
      baseFrame.position = { x: startX, y: startY }; // 2mmグリッドに合わせた位置を使用
      break;
    case "text":
      baseFrame.text = "テキスト";
      baseFrame.fontFamily = "Arial, sans-serif";
      baseFrame.style.fontSize = 12;
      baseFrame.style.color = "#000000";
      baseFrame.size = { width: 40, height: 8 };
      break;
  }

  return baseFrame;
}
