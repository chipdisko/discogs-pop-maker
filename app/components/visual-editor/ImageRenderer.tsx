'use client';

import React, { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import type { TemplateElement } from './types';

interface ImageRendererProps {
  element: TemplateElement;
  zoom?: number;
  style?: React.CSSProperties;
}

export default function ImageRenderer({ 
  element,
  zoom = 1,
  style = {}
}: ImageRendererProps) {
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);

  // クロップされた画像を生成
  useEffect(() => {
    if (!element.imageSettings?.src || !element.imageSettings?.crop) {
      setCroppedImageSrc(null);
      return;
    }

    const { src, crop, originalWidth, originalHeight } = element.imageSettings;
    const { x, y, width, height } = crop;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // クロップ領域のサイズを計算
      const cropX = x * originalWidth;
      const cropY = y * originalHeight;
      const cropWidth = width * originalWidth;
      const cropHeight = height * originalHeight;

      // キャンバスサイズをクロップサイズに設定
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // クロップされた部分を描画
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight, // ソース画像の切り取り範囲
        0, 0, cropWidth, cropHeight // キャンバス上の描画範囲
      );

      // Data URLとして保存
      setCroppedImageSrc(canvas.toDataURL());
    };
    img.src = src;
  }, [element.imageSettings]);

  const imageStyle = useMemo(() => {
    if (!element.imageSettings) {
      return {
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        color: '#6b7280',
        fontSize: `${12 * zoom}px`,
      };
    }

    const baseStyle: React.CSSProperties = {
      ...style,
      width: '100%',
      height: '100%',
      objectFit: 'contain', // デフォルトでcontainを使用
      display: 'block',
    };

    return baseStyle;
  }, [element.imageSettings, zoom, style]);

  if (!element.imageSettings?.src) {
    return (
      <div style={imageStyle}>
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>画像を選択</div>
        </div>
      </div>
    );
  }

  // クロップ機能のためのコンテナスタイル
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      <Image
        src={croppedImageSrc || element.imageSettings.src}
        alt={element.imageSettings.fileName || '画像'}
        fill
        style={imageStyle}
        draggable={false}
        unoptimized // data URLやローカル画像の場合は最適化をスキップ
      />
    </div>
  );
}