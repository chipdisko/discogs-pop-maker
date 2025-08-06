"use client";

import React, { useMemo, useCallback } from "react";
import type { PopResponse } from "@/src/application";
import type { TemplateElement, VisualTemplate } from "./types";
import { calculateAutoFitStyle } from "./utils/textUtils";
import { getSampleValue } from "./utils/sampleData";
import QRCodeRenderer from "./QRCodeRenderer";
import BadgeRenderer from "./BadgeRenderer";
import ImageRenderer from "./ImageRenderer";

interface ElementRendererProps {
  element: TemplateElement;
  pop: PopResponse | null;
  isBackSide: boolean;
  showBackSidePreview?: boolean;
  useSampleData?: boolean; // エディター用のサンプルデータを使用するかどうか
  zoom?: number; // ズームレベル
  sampleKey?: string; // サンプルデータの変更を検知するためのキー
  template: VisualTemplate; // 統一カラー設定用
}

export default function ElementRenderer({
  element,
  pop,
  isBackSide,
  showBackSidePreview = false,
  useSampleData = true,
  zoom = 1,
  template,
}: ElementRendererProps) {
  // データバインディングから実際の値またはサンプル値を取得
  const dataValue = useMemo((): string => {
    console.log(`🎯 Element ${element.id} | binding: ${element.dataBinding} | value: "${element.dataBinding === 'artist' ? pop?.release?.artistName || 'sample' : element.dataBinding === 'title' ? pop?.release?.title || 'sample' : 'other'}" | useSample: ${useSampleData}`);
    
    if (useSampleData || !pop) {
      return getSampleValue(element.dataBinding, element.customText);
    }

    switch (element.dataBinding) {
      case "artist":
        return pop?.release?.artistName || "";
      case "title":
        return pop?.release?.title || "";
      case "label":
        return pop?.release?.label || "不明";
      case "countryYear":
        return [
          pop?.release?.country || "不明",
          pop?.release?.releaseYear || "不明",
        ]
          .filter(Boolean)
          .join(" • ");
      case "condition":
        return pop?.condition || "";
      case "genre":
        return pop?.release?.genreStyleString || "";
      case "price":
        return pop?.price === 0 ? "FREE" : `¥${pop?.price?.toLocaleString() || 0}`;
      case "comment":
        return pop?.comment || "";
      case "custom":
        return element.customText || "";
      case "discogsUrl":
        // discogsTypeに応じて適切なURLを生成
        const urlType = pop?.release?.discogsType || "release";
        return `https://www.discogs.com/${urlType}/${pop?.release?.discogsId}` || "";
      default:
        return "";
    }
  }, [element.id, element.dataBinding, element.customText, pop, useSampleData]);

  // 実際に返される値をログ出力
  console.log(`✅ Final value for ${element.id} (${element.dataBinding}): "${dataValue}"`);

  // データバインディングに対応するラベル名を取得
  const getDataBindingLabel = (dataBinding: string): string => {
    const labelMap: Record<string, string> = {
      artist: "アーティスト名",
      title: "タイトル", 
      label: "レーベル",
      countryYear: "国・年",
      condition: "コンディション",
      genre: "ジャンル",
      price: "価格",
      comment: "コメント",
      custom: "カスタムテキスト",
    };
    return labelMap[dataBinding] || dataBinding;
  };

  // 統一カラー設定の適用（カスタムテキスト以外）
  const getElementColor = () => {
    // カスタムテキストの場合は個別色設定を保持
    if (element.dataBinding === "custom") {
      return element.style?.color || "#000000";
    }
    // カスタムテキスト以外は統一色設定を使用（フォールバック付き）
    return template.settings.unifiedColors?.contentColor || "#000000";
  };

  const getLabelColor = () => {
    // カスタムテキストの場合は個別色設定を保持
    if (element.dataBinding === "custom") {
      return element.label?.color || "#666666";
    }
    // カスタムテキスト以外は統一色設定を使用（フォールバック付き）
    return template.settings.unifiedColors?.dataLabelColor || "#666666";
  };

  // データラベル用のフォント設定を取得
  const getLabelFontStyle = useCallback(() => {
    const fontSettings = template.settings.unifiedFonts?.dataLabel || {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
    };
    
    const style: React.CSSProperties = {
      fontFamily: fontSettings.fontFamily,
      fontWeight: fontSettings.fontWeight,
      fontStyle: fontSettings.fontStyle,
      letterSpacing: fontSettings.letterSpacing ? `${fontSettings.letterSpacing}em` : undefined,
    };

    // テキスト装飾の適用
    if (fontSettings.textDecoration?.line && fontSettings.textDecoration.line.length > 0) {
      style.textDecorationLine = fontSettings.textDecoration.line.join(' ');
      style.textDecorationColor = fontSettings.textDecoration.color;
      style.textDecorationStyle = fontSettings.textDecoration.style as React.CSSProperties['textDecorationStyle'];
      if (fontSettings.textDecoration.thickness) {
        style.textDecorationThickness = `${fontSettings.textDecoration.thickness}px`;
      }
      if (fontSettings.textDecoration.underlineOffset) {
        style.textUnderlineOffset = `${fontSettings.textDecoration.underlineOffset}px`;
      }
    }

    return style;
  }, [template.settings.unifiedFonts]);

  // コンテンツ用のフォント設定を取得
  const getContentFontStyle = useCallback(() => {
    // カスタムテキストの場合は個別設定を保持
    if (element.dataBinding === "custom") {
      return {};
    }

    const fontSettings = template.settings.unifiedFonts?.content || {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
    };
    
    const style: React.CSSProperties = {
      fontFamily: fontSettings.fontFamily,
      fontWeight: fontSettings.fontWeight,
      fontStyle: fontSettings.fontStyle,
      letterSpacing: fontSettings.letterSpacing ? `${fontSettings.letterSpacing}em` : undefined,
    };

    // テキスト装飾の適用
    if (fontSettings.textDecoration?.line && fontSettings.textDecoration.line.length > 0) {
      style.textDecorationLine = fontSettings.textDecoration.line.join(' ');
      style.textDecorationColor = fontSettings.textDecoration.color;
      style.textDecorationStyle = fontSettings.textDecoration.style as React.CSSProperties['textDecorationStyle'];
      if (fontSettings.textDecoration.thickness) {
        style.textDecorationThickness = `${fontSettings.textDecoration.thickness}px`;
      }
      if (fontSettings.textDecoration.underlineOffset) {
        style.textUnderlineOffset = `${fontSettings.textDecoration.underlineOffset}px`;
      }
    }

    return style;
  }, [element.dataBinding, template.settings.unifiedFonts]);

  // 自動調整スタイルの計算
  const autoFitStyle = useMemo(() => {
    if (element.type !== "text" || !dataValue) return {};

    // 実際の寸法をピクセルに変換（仮の値、実際はmm→pxの変換が必要）
    const containerWidth = element.size.width * 3.7795275591; // mm to px
    const containerHeight = element.size.height * 3.7795275591;

    return calculateAutoFitStyle(
      element,
      dataValue,
      containerWidth,
      containerHeight
    );
  }, [element, dataValue]);

  // 外側のコンテナスタイル（レイアウト用）
  const containerStyle: React.CSSProperties = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      position: "relative",
      fontSize: `${
        (autoFitStyle.fontSize || element.style?.fontSize || 12) * zoom
      }px`,
      fontFamily: element.style?.fontFamily || "Arial, sans-serif",
      color: getElementColor(), // 統一カラーまたは個別カラーを適用
      backgroundColor: element.style?.backgroundColor || "transparent",
      opacity: element.style?.opacity || 1,
      overflow: "visible",
      // コンテンツ用のフォント設定を適用（カスタムテキスト以外）
      ...getContentFontStyle(),
    };

    // border設定の適用
    if (element.style?.borderTop) {
      baseStyle.borderTopStyle = element.style.borderTop.style;
      baseStyle.borderTopColor = element.style.borderTop.color;
      baseStyle.borderTopWidth = `${element.style.borderTop.width}mm`;
    }
    if (element.style?.borderRight) {
      baseStyle.borderRightStyle = element.style.borderRight.style;
      baseStyle.borderRightColor = element.style.borderRight.color;
      baseStyle.borderRightWidth = `${element.style.borderRight.width}mm`;
    }
    if (element.style?.borderBottom) {
      baseStyle.borderBottomStyle = element.style.borderBottom.style;
      baseStyle.borderBottomColor = element.style.borderBottom.color;
      baseStyle.borderBottomWidth = `${element.style.borderBottom.width}mm`;
    }
    if (element.style?.borderLeft) {
      baseStyle.borderLeftStyle = element.style.borderLeft.style;
      baseStyle.borderLeftColor = element.style.borderLeft.color;
      baseStyle.borderLeftWidth = `${element.style.borderLeft.width}mm`;
    }

    // 角丸設定の適用
    if (element.style?.borderTopLeftRadius !== undefined) {
      baseStyle.borderTopLeftRadius = `${element.style.borderTopLeftRadius}mm`;
    }
    if (element.style?.borderTopRightRadius !== undefined) {
      baseStyle.borderTopRightRadius = `${element.style.borderTopRightRadius}mm`;
    }
    if (element.style?.borderBottomRightRadius !== undefined) {
      baseStyle.borderBottomRightRadius = `${element.style.borderBottomRightRadius}mm`;
    }
    if (element.style?.borderBottomLeftRadius !== undefined) {
      baseStyle.borderBottomLeftRadius = `${element.style.borderBottomLeftRadius}mm`;
    }

    // 変換の適用（ボーダーに影響しない裏面回転のみ）
    const transforms: string[] = [];

    // 裏面要素の180度回転（プレビューモード時のみ）
    if (isBackSide && element.autoRotate && showBackSidePreview) {
      transforms.push("rotateZ(180deg)");
    }

    if (transforms.length > 0) {
      baseStyle.transform = transforms.join(" ");
      baseStyle.transformOrigin = "center center";
    }

    // 影の適用
    if (element.style?.shadow) {
      const { offsetX, offsetY, blur, color } = element.style.shadow;
      baseStyle.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    }

    return baseStyle;
  }, [element, autoFitStyle, isBackSide, showBackSidePreview, zoom, template.settings.unifiedColors, template.settings.unifiedFonts, getContentFontStyle]);

  // 内側のコンテンツスタイル（テキスト配置用）
  const innerStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    };

    // テキスト配置の適用
    if (element.style?.textAlign) {
      style.alignItems = 
        element.style.textAlign === "left" ? "flex-start" :
        element.style.textAlign === "right" ? "flex-end" : "center";
    } else {
      style.alignItems = "center";
    }

    if (element.style?.verticalAlign) {
      style.justifyContent = 
        element.style.verticalAlign === "top" ? "flex-start" :
        element.style.verticalAlign === "bottom" ? "flex-end" : "center";
    } else {
      style.justifyContent = "center";
    }

    // テキスト要素の場合のみ、長体/平体の圧縮を適用
    if (element.type === "text") {
      const scaleX = autoFitStyle.scaleX || element.style?.scaleX || 1;
      const scaleY = autoFitStyle.scaleY || element.style?.scaleY || 1;

      if (scaleX !== 1 || scaleY !== 1) {
        const textTransforms: string[] = [];
        textTransforms.push(`scale(${scaleX}, ${scaleY})`);
        style.transform = textTransforms.join(" ");

        // テキスト配置設定に基づいてtransform-originを調整
        const horizontalOrigin = 
          element.style?.textAlign === "left" ? "left" :
          element.style?.textAlign === "right" ? "right" : "center";
        const verticalOrigin = 
          element.style?.verticalAlign === "top" ? "top" :
          element.style?.verticalAlign === "bottom" ? "bottom" : "center";
        style.transformOrigin = `${horizontalOrigin} ${verticalOrigin}`;
      }
    }

    return style;
  }, [element.style?.textAlign, element.style?.verticalAlign, element.type, autoFitStyle, element.style?.scaleX, element.style?.scaleY]);

  // 要素タイプに応じたレンダリング
  const renderContent = () => {
    switch (element.type) {
      case "text":
        const singleLineBindings = [
          "artist",
          "title",
          "label",
          "countryYear",
          "condition",
          "genre",
          "price",
        ];
        const isSingleLine = singleLineBindings.includes(element.dataBinding);

        // インラインモードの場合は [ラベル]: [内容] 形式で表示
        const isInlineMode = element.label?.show && element.label.displayMode === 'inline';
        const labelText = element.label?.text || getDataBindingLabel(element.dataBinding);

        return (
          <div
            className='px-1'
            style={{
              textAlign: element.style?.textAlign || "left",
              wordBreak: isSingleLine ? "keep-all" : "break-word",
              whiteSpace: isSingleLine ? "nowrap" : "normal",
              lineHeight: 1.2,
            }}
          >
            {element.dataBinding === "comment" ? (
              // コメントは改行を保持、各行は折り返さない
              <div
                className='w-full'
                style={{
                  textAlign: element.style?.textAlign || "left",
                  lineHeight: 1.2,
                  whiteSpace: "pre", // 改行を保持し、空白を維持、自動折り返しなし
                  wordBreak: "keep-all",
                  overflow: "visible",
                }}
              >
                {isInlineMode ? (
                  <>
                    <span style={{ 
                      color: getLabelColor(),
                      fontSize: `${(element.label?.fontSize || 12) * zoom}px`,
                      ...getLabelFontStyle()
                    }}>
                      {labelText}:{' '}
                    </span>
                    <span style={{
                      color: getElementColor()
                    }}>
                      {dataValue}
                    </span>
                  </>
                ) : (
                  dataValue
                )}
              </div>
            ) : (
              <span
                style={{
                  display: "block",
                  width: "100%",
                }}
              >
                {isInlineMode ? (
                  <>
                    <span style={{ 
                      color: getLabelColor(),
                      fontSize: `${(element.label?.fontSize || 12) * zoom}px`,
                      ...getLabelFontStyle()
                    }}>
                      {labelText}:{' '}
                    </span>
                    <span style={{
                      color: getElementColor()
                    }}>
                      {dataValue}
                    </span>
                  </>
                ) : (
                  dataValue
                )}
              </span>
            )}
          </div>
        );

      case "badge":
        // バッジのレンダリング
        return (
          <BadgeRenderer
            pop={pop}
            useSampleData={useSampleData}
            style={{
              fontSize: `${(element.style?.fontSize || 12) * zoom}px`,
              fontFamily: element.style?.fontFamily || "Arial, sans-serif",
            }}
          />
        );

      case "image":
        // 画像のレンダリング
        return (
          <ImageRenderer
            element={element}
            zoom={zoom}
          />
        );

      case "qrcode":
        // QRコードのレンダリング
        return (
          <QRCodeRenderer
            url={dataValue}
            element={element}
            size={{
              width: element.size.width * 3.7795275591 * zoom, // mm to px with zoom
              height: element.size.height * 3.7795275591 * zoom,
            }}
          />
        );

      default:
        return null;
    }
  };

  // データラベルのレンダリング
  const renderLabel = () => {
    if (!element.label?.show) return null;

    const labelText = element.label?.text || getDataBindingLabel(element.dataBinding);
    const displayMode = element.label?.displayMode || 'positioned';

    // インラインモード: [ラベル]: [内容] 形式
    if (displayMode === 'inline') {
      return null; // インラインモードの場合はここでは何も返さず、メインコンテンツ内で処理
    }

    // 配置モード: 要素の外側または内側に配置
    const placement = element.label?.placement || 'outside';
    const position = element.label?.position || 'top-left';
    
    // 配置位置の計算
    const getPositionStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        fontSize: `${(element.label?.fontSize || 12) * zoom}px`,
        color: getLabelColor(),
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 10,
        ...getLabelFontStyle(), // ラベル用フォント設定を適用
      };

      // 外側配置の場合
      if (placement === 'outside') {
        switch (position) {
          case 'top-left':
            return { ...baseStyle, bottom: '100%', left: '0', marginBottom: '2px' };
          case 'top-center':
            return { ...baseStyle, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '2px' };
          case 'top-right':
            return { ...baseStyle, bottom: '100%', right: '0', marginBottom: '2px' };
          case 'bottom-left':
            return { ...baseStyle, top: '100%', left: '0', marginTop: '2px' };
          case 'bottom-center':
            return { ...baseStyle, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '2px' };
          case 'bottom-right':
            return { ...baseStyle, top: '100%', right: '0', marginTop: '2px' };
          case 'middle-left':
            return { ...baseStyle, top: '50%', right: '100%', transform: 'translateY(-50%)', marginRight: '4px' };
          case 'middle-right':
            return { ...baseStyle, top: '50%', left: '100%', transform: 'translateY(-50%)', marginLeft: '4px' };
          default:
            return { ...baseStyle, bottom: '100%', left: '0', marginBottom: '2px' };
        }
      }
      
      // 内側配置の場合
      else {
        switch (position) {
          case 'top-left':
            return { ...baseStyle, top: '2px', left: '2px' };
          case 'top-center':
            return { ...baseStyle, top: '2px', left: '50%', transform: 'translateX(-50%)' };
          case 'top-right':
            return { ...baseStyle, top: '2px', right: '2px' };
          case 'bottom-left':
            return { ...baseStyle, bottom: '2px', left: '2px' };
          case 'bottom-center':
            return { ...baseStyle, bottom: '2px', left: '50%', transform: 'translateX(-50%)' };
          case 'bottom-right':
            return { ...baseStyle, bottom: '2px', right: '2px' };
          case 'middle-left':
            return { ...baseStyle, top: '50%', left: '2px', transform: 'translateY(-50%)' };
          case 'middle-right':
            return { ...baseStyle, top: '50%', right: '2px', transform: 'translateY(-50%)' };
          default:
            return { ...baseStyle, top: '2px', left: '2px' };
        }
      }
    };

    return (
      <div style={getPositionStyle()}>
        {labelText}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {renderLabel()}
      <div style={innerStyle}>
        {renderContent()}
      </div>
    </div>
  );
}