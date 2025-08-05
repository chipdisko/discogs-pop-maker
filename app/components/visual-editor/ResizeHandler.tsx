'use client';

import React, { useState, useCallback } from 'react';
import type { TemplateElement } from './types';

interface ResizeHandlerProps {
  element: TemplateElement;
  onResize: (elementId: string, newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => void;
  mmToPx: (mm: number) => number;
  pxToMm: (px: number) => number;
  gridSize: number; // グリッドサイズ（mm単位）
  snapToGrid: boolean; // グリッドスナップ有効フラグ
}

export default function ResizeHandler({
  element,
  onResize,
  mmToPx,
  pxToMm,
  gridSize,
  snapToGrid,
}: ResizeHandlerProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.size.width;
    const startHeight = element.size.height;
    const startPosX = element.position.x;
    const startPosY = element.position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = pxToMm(moveEvent.clientX - startX);
      const deltaY = pxToMm(moveEvent.clientY - startY);
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      switch (handle) {
        case 'top-left':
          newWidth = Math.max(5, startWidth - deltaX);
          newHeight = Math.max(3, startHeight - deltaY);
          // 左上をドラッグした場合、位置も変更（ただし最小サイズ制約を考慮）
          newPosX = startPosX + (startWidth - newWidth);
          newPosY = startPosY + (startHeight - newHeight);
          break;
        case 'top-right':
          newWidth = Math.max(5, startWidth + deltaX);
          newHeight = Math.max(3, startHeight - deltaY);
          // 上をドラッグした場合、Y位置を変更（最小サイズ制約を考慮）
          newPosY = startPosY + (startHeight - newHeight);
          break;
        case 'bottom-left':
          newWidth = Math.max(5, startWidth - deltaX);
          newHeight = Math.max(3, startHeight + deltaY);
          // 左をドラッグした場合、X位置を変更（最小サイズ制約を考慮）
          newPosX = startPosX + (startWidth - newWidth);
          break;
        case 'bottom-right':
          newWidth = Math.max(5, startWidth + deltaX);
          newHeight = Math.max(3, startHeight + deltaY);
          break;
        case 'left':
          newWidth = Math.max(5, startWidth - deltaX);
          // 左をドラッグした場合、X位置を変更（最小サイズ制約を考慮）
          newPosX = startPosX + (startWidth - newWidth);
          break;
        case 'right':
          newWidth = Math.max(5, startWidth + deltaX);
          break;
        case 'top':
          newHeight = Math.max(3, startHeight - deltaY);
          // 上をドラッグした場合、Y位置を変更（最小サイズ制約を考慮）
          newPosY = startPosY + (startHeight - newHeight);
          break;
        case 'bottom':
          newHeight = Math.max(3, startHeight + deltaY);
          break;
      }

      // QRコードは正方形を維持
      if (element.type === 'qrcode') {
        const size = Math.min(newWidth, newHeight);
        newWidth = size;
        newHeight = size;
      }

      // グリッドスナップの適用
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newPosX = Math.round(newPosX / gridSize) * gridSize;
        newPosY = Math.round(newPosY / gridSize) * gridSize;
        
        // 最小サイズの確保（グリッドスナップ後も最小サイズを維持）
        newWidth = Math.max(gridSize, newWidth);
        newHeight = Math.max(gridSize, newHeight);
      }

      // 位置が変更された場合は、新しい位置も渡す
      if (newPosX !== startPosX || newPosY !== startPosY) {
        onResize(element.id, { width: newWidth, height: newHeight }, { x: newPosX, y: newPosY });
      } else {
        onResize(element.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, onResize, pxToMm, gridSize, snapToGrid]);

  const renderHandle = (position: string, cursor: string) => (
    <div
      key={position}
      className="absolute bg-blue-500 border border-white shadow-sm hover:bg-blue-600"
      style={{
        width: 8,
        height: 8,
        cursor,
        ...getHandlePosition(position),
      }}
      onMouseDown={(e) => handleMouseDown(e, position)}
    />
  );

  return (
    <>
      {/* 角のハンドル */}
      {renderHandle('top-left', 'nw-resize')}
      {renderHandle('top-right', 'ne-resize')}
      {renderHandle('bottom-left', 'sw-resize')}
      {renderHandle('bottom-right', 'se-resize')}
      
      {/* 辺のハンドル */}
      {renderHandle('top', 'n-resize')}
      {renderHandle('bottom', 's-resize')}
      {renderHandle('left', 'w-resize')}
      {renderHandle('right', 'e-resize')}
    </>
  );
}

// ハンドル位置の計算
function getHandlePosition(position: string): React.CSSProperties {
  const offset = -4; // ハンドルサイズの半分
  
  switch (position) {
    case 'top-left':
      return { top: offset, left: offset };
    case 'top-right':
      return { top: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
    case 'top':
      return { top: offset, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom':
      return { bottom: offset, left: '50%', transform: 'translateX(-50%)' };
    case 'left':
      return { left: offset, top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { right: offset, top: '50%', transform: 'translateY(-50%)' };
    default:
      return {};
  }
}