'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TemplateElement } from './types';

interface ImageCropModalProps {
  element: TemplateElement;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cropData: { x: number; y: number; width: number; height: number }) => void;
}

export default function ImageCropModal({
  element,
  isOpen,
  onClose,
  onSave,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // クロップ領域の状態（画像に対する比率 0-1）
  const [cropArea, setCropArea] = useState({
    x: element.imageSettings?.crop?.x || 0,
    y: element.imageSettings?.crop?.y || 0,
    width: element.imageSettings?.crop?.width || 1,
    height: element.imageSettings?.crop?.height || 1,
  });

  const drawCropArea = useCallback((ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const x = cropArea.x * canvasWidth;
    const y = cropArea.y * canvasHeight;
    const width = cropArea.width * canvasWidth;
    const height = cropArea.height * canvasHeight;

    // 先に画像を描画
    const img = new Image();
    img.onload = () => {
      // 画像全体を描画
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // 半透明オーバーレイを描画（全体）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // クロップ領域をクリアして元の画像を表示
      ctx.clearRect(x, y, width, height);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // クロップ領域の枠線を描画
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // リサイズハンドルを描画
      const drawHandle = (hx: number, hy: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 4, hy - 4, 8, 8);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx - 4, hy - 4, 8, 8);
      };
      
      // 四隅のハンドル
      drawHandle(x, y);
      drawHandle(x + width, y);
      drawHandle(x, y + height);
      drawHandle(x + width, y + height);
      
      // 辺の中央のハンドル
      drawHandle(x + width/2, y);
      drawHandle(x + width/2, y + height);
      drawHandle(x, y + height/2);
      drawHandle(x + width, y + height/2);
    };
    img.src = element.imageSettings!.src;
  }, [cropArea, element.imageSettings]);

  // 画像の読み込みとキャンバスの描画
  useEffect(() => {
    if (!isOpen || !element.imageSettings?.src) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // キャンバスサイズを適切に設定（最大500x400）
      const maxWidth = 500;
      const maxHeight = 400;
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      setImageDimensions({ width, height });

      // 画像を描画
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // クロップ領域を描画
      drawCropArea(ctx, width, height);
    };
    img.src = element.imageSettings.src;
  }, [isOpen, element.imageSettings?.src, cropArea, drawCropArea]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const getHandleAtPosition = (x: number, y: number) => {
    const handleSize = 8;
    const cropX = cropArea.x * imageDimensions.width;
    const cropY = cropArea.y * imageDimensions.height;
    const cropWidth = cropArea.width * imageDimensions.width;
    const cropHeight = cropArea.height * imageDimensions.height;

    const handles = [
      { name: 'nw', x: cropX, y: cropY },
      { name: 'ne', x: cropX + cropWidth, y: cropY },
      { name: 'sw', x: cropX, y: cropY + cropHeight },
      { name: 'se', x: cropX + cropWidth, y: cropY + cropHeight },
      { name: 'n', x: cropX + cropWidth/2, y: cropY },
      { name: 's', x: cropX + cropWidth/2, y: cropY + cropHeight },
      { name: 'w', x: cropX, y: cropY + cropHeight/2 },
      { name: 'e', x: cropX + cropWidth, y: cropY + cropHeight/2 },
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) <= handleSize/2 && Math.abs(y - handle.y) <= handleSize/2) {
        return handle.name;
      }
    }

    // クロップ領域内かチェック
    if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const handle = getHandleAtPosition(pos.x, pos.y);

    if (handle === 'move') {
      setIsDragging(true);
      setStartPos(pos);
    } else if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setStartPos(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isDragging) {
      const deltaX = (pos.x - startPos.x) / imageDimensions.width;
      const deltaY = (pos.y - startPos.y) / imageDimensions.height;

      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(1 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(1 - prev.height, prev.y + deltaY)),
      }));

      setStartPos(pos);
    } else if (isResizing && resizeHandle) {
      const deltaX = (pos.x - startPos.x) / imageDimensions.width;
      const deltaY = (pos.y - startPos.y) / imageDimensions.height;

      setCropArea(prev => {
        const newArea = { ...prev };

        switch (resizeHandle) {
          case 'nw':
            newArea.x = Math.max(0, Math.min(prev.x + prev.width - 0.1, prev.x + deltaX));
            newArea.y = Math.max(0, Math.min(prev.y + prev.height - 0.1, prev.y + deltaY));
            newArea.width = prev.width - (newArea.x - prev.x);
            newArea.height = prev.height - (newArea.y - prev.y);
            break;
          case 'ne':
            newArea.y = Math.max(0, Math.min(prev.y + prev.height - 0.1, prev.y + deltaY));
            newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX));
            newArea.height = prev.height - (newArea.y - prev.y);
            break;
          case 'sw':
            newArea.x = Math.max(0, Math.min(prev.x + prev.width - 0.1, prev.x + deltaX));
            newArea.width = prev.width - (newArea.x - prev.x);
            newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY));
            break;
          case 'se':
            newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX));
            newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY));
            break;
          case 'n':
            newArea.y = Math.max(0, Math.min(prev.y + prev.height - 0.1, prev.y + deltaY));
            newArea.height = prev.height - (newArea.y - prev.y);
            break;
          case 's':
            newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY));
            break;
          case 'w':
            newArea.x = Math.max(0, Math.min(prev.x + prev.width - 0.1, prev.x + deltaX));
            newArea.width = prev.width - (newArea.x - prev.x);
            break;
          case 'e':
            newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX));
            break;
        }

        return newArea;
      });

      setStartPos(pos);
    } else {
      // カーソルの変更
      const handle = getHandleAtPosition(pos.x, pos.y);
      const canvas = canvasRef.current;
      if (canvas) {
        if (handle === 'move') {
          canvas.style.cursor = 'move';
        } else if (handle?.includes('n') || handle?.includes('s')) {
          canvas.style.cursor = handle.includes('w') || handle.includes('e') ? 
            (handle.includes('n') ? 'nw-resize' : 'sw-resize') : 'ns-resize';
        } else if (handle?.includes('w') || handle?.includes('e')) {
          canvas.style.cursor = 'ew-resize';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleSave = () => {
    onSave(cropArea);
    onClose();
  };

  const handleReset = () => {
    setCropArea({ x: 0, y: 0, width: 1, height: 1 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">画像のトリミング</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ドラッグして位置を変更、ハンドルをドラッグしてサイズを変更
          </p>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border border-gray-300 dark:border-gray-600 max-w-full"
            style={{ cursor: 'default' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}