'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { TemplateElement } from './types';

interface QRCodeRendererProps {
  url: string;
  element: TemplateElement;
  size: { width: number; height: number }; // ピクセル単位
}

export default function QRCodeRenderer({ url, element, size }: QRCodeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    const qrSettings = element.qrSettings || {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      color: '#000000',
      backgroundColor: '#ffffff',
    };

    QRCode.toCanvas(
      canvas,
      url,
      {
        errorCorrectionLevel: qrSettings.errorCorrectionLevel,
        margin: qrSettings.margin,
        width: Math.min(size.width, size.height), // 正方形にする
        color: {
          dark: qrSettings.color,
          light: qrSettings.backgroundColor,
        },
      },
      (error) => {
        if (error) {
          console.error('QR Code generation failed:', error);
        }
      }
    );
  }, [url, element.qrSettings, size]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
        <span className="text-xs text-gray-500">URLが必要</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
        }}
      />
    </div>
  );
}