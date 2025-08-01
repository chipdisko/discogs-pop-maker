'use client';

import React, { useMemo } from 'react';
import type { PopResponse } from '@/src/application';
import type { TemplateElement } from './types';
import { calculateAutoFitStyle } from './utils/textUtils';
import { getSampleValue, getSampleBadges } from './utils/sampleData';
import QRCodeRenderer from './QRCodeRenderer';
import BadgeRenderer from './BadgeRenderer';

interface ElementRendererProps {
  element: TemplateElement;
  pop: PopResponse;
  isBackSide: boolean;
  showBackSidePreview?: boolean;
  useSampleData?: boolean; // エディター用のサンプルデータを使用するかどうか
  zoom?: number; // ズームレベル
}

export default function ElementRenderer({
  element,
  pop,
  isBackSide,
  showBackSidePreview = false,
  useSampleData = true,
  zoom = 1,
}: ElementRendererProps) {
  // データバインディングから実際の値またはサンプル値を取得
  const dataValue = useMemo((): string => {
    if (useSampleData) {
      return getSampleValue(element.dataBinding, element.customText);
    }
    
    switch (element.dataBinding) {
      case 'artist':
        return pop.release.artistName;
      case 'title':
        return pop.release.title;
      case 'label':
        return pop.release.label || '不明';
      case 'countryYear':
        return [pop.release.country || '不明', pop.release.releaseYear || '不明']
          .filter(Boolean)
          .join(' • ');
      case 'condition':
        return pop.condition;
      case 'genre':
        return pop.release.genreStyleString || '';
      case 'price':
        return pop.price === 0 ? 'FREE' : `¥${pop.price.toLocaleString()}`;
      case 'comment':
        return pop.comment || '';
      case 'custom':
        return element.customText || '';
      case 'discogsUrl':
        return `https://www.discogs.com/release/${pop.release.discogsId}` || '';
      default:
        return '';
    }
  }, [element.dataBinding, element.customText, pop, useSampleData]);

  // 自動調整スタイルの計算
  const autoFitStyle = useMemo(() => {
    if (element.type !== 'text' || !dataValue) return {};
    
    // 実際の寸法をピクセルに変換（仮の値、実際はmm→pxの変換が必要）
    const containerWidth = element.size.width * 3.7795275591; // mm to px
    const containerHeight = element.size.height * 3.7795275591;
    
    return calculateAutoFitStyle(element, dataValue, containerWidth, containerHeight);
  }, [element, dataValue]);

  // スタイルの適用
  const style: React.CSSProperties = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${(autoFitStyle.fontSize || element.style?.fontSize || 12) * zoom}px`,
      fontFamily: element.style?.fontFamily || 'Arial, sans-serif',
      color: element.style?.color || '#000000',
      backgroundColor: element.style?.backgroundColor || 'transparent',
      borderRadius: element.style?.borderRadius ? `${element.style.borderRadius}px` : '0',
      opacity: element.style?.opacity || 1,
      overflow: 'hidden',
    };

    // 変換の適用
    const transforms: string[] = [];
    
    // 裏面要素の180度回転（プレビューモード時のみ）
    if (isBackSide && element.autoRotate && showBackSidePreview) {
      transforms.push('rotateX(180deg)');
    }

    // テキストの圧縮（自動調整またはマニュアル設定）
    const scaleX = autoFitStyle.scaleX || element.style?.scaleX || 1;
    const scaleY = autoFitStyle.scaleY || element.style?.scaleY || 1;
    
    if (scaleX !== 1 || scaleY !== 1) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }
    
    if (transforms.length > 0) {
      baseStyle.transform = transforms.join(' ');
      baseStyle.transformOrigin = 'center center';
    }

    // 影の適用
    if (element.style?.shadow) {
      const { offsetX, offsetY, blur, color } = element.style.shadow;
      baseStyle.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    }

    return baseStyle;
  }, [element, autoFitStyle, isBackSide, showBackSidePreview, zoom]);

  // 要素タイプに応じたレンダリング
  const renderContent = () => {

    switch (element.type) {
      case 'text':
        return (
          <div 
            className="w-full h-full flex items-center px-1"
            style={{
              textAlign: 'left',
              wordBreak: 'break-word',
              lineHeight: 1.2,
            }}
          >
            {element.dataBinding === 'comment' ? (
              // コメントは3行固定
              <div 
                className="w-full"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textAlign: 'left',
                  lineHeight: 1.2,
                }}
              >
                {dataValue}
              </div>
            ) : (
              <span style={{ textAlign: 'left' }}>{dataValue}</span>
            )}
          </div>
        );

      case 'badge':
        // バッジのレンダリング
        return (
          <BadgeRenderer
            pop={pop}
            useSampleData={useSampleData}
            style={{
              fontSize: `${(element.style?.fontSize || 12) * zoom}px`,
              fontFamily: element.style?.fontFamily || 'Arial, sans-serif',
            }}
          />
        );

      case 'qrcode':
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

  return (
    <div style={style}>
      {renderContent()}
    </div>
  );
}