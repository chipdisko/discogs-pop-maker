'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useDrag, ConnectDragSource } from 'react-dnd';
import type { PopResponse } from '@/src/application';
import type { TemplateElement, DropResult } from './types';
import ElementRenderer from './ElementRenderer';
import ResizeHandler from './ResizeHandler';

interface DraggableElementProps {
  element: TemplateElement;
  isSelected: boolean;
  showBackSidePreview: boolean;
  zoom: number;
  mmToPx: (mm: number) => number;
  pxToMm: (px: number) => number;
  onMove: (elementId: string, deltaX: number, deltaY: number) => void;
  onResize: (elementId: string, newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => void;
  onSelect: () => void;
  pop: PopResponse;
  isPanningMode?: boolean;
}

export default function DraggableElement({
  element,
  isSelected,
  showBackSidePreview,
  zoom,
  mmToPx,
  pxToMm,
  onMove,
  onResize,
  onSelect,
  pop,
  isPanningMode = false,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  // ドラッグ設定
  const [{ opacity }, drag] = useDrag(() => ({
    type: 'element',
    canDrag: () => !isPanningMode,
    item: () => {
      setIsDragging(true);
      return { 
        id: element.id, 
        type: 'existing' as const,
        position: { 
          x: element.position.x, 
          y: element.position.y 
        }
      };
    },
    end: (item, monitor) => {
      setIsDragging(false);
      
      // ドロップターゲットからの結果を確認
      const dropResult = monitor.getDropResult() as DropResult | null;
      if (dropResult && dropResult.delta) {
        onMove(element.id, dropResult.delta.x, dropResult.delta.y);
        return;
      }
      
      // フォールバック: react-dndの標準方法
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1)) {
        onMove(element.id, delta.x, delta.y);
      }
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  }), [element.id, element.position.x, element.position.y, onMove, isPanningMode]);

  // 要素の位置とサイズ
  const style: React.CSSProperties = {
    position: 'absolute',
    left: mmToPx(element.position.x),
    top: mmToPx(element.position.y),
    width: mmToPx(element.size.width),
    height: mmToPx(element.size.height),
    opacity,
    cursor: isPanningMode ? 'grab' : (isDragging ? 'grabbing' : 'grab'),
    overflow: 'visible',  // テキストが圧縮されても見えるように
  };
  

  // クリックハンドラー
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onSelect();
    }
  }, [onSelect, isDragging]);

  // リサイズハンドル
  const renderResizeHandles = () => {
    if (!isSelected || isDragging) return null;

    return (
      <ResizeHandler
        element={element}
        onResize={onResize}
        mmToPx={mmToPx}
        pxToMm={pxToMm}
      />
    );
  };

  return drag(
    <div
      style={style}
      onClick={handleClick}
      className={`group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* 要素の内容 */}
      <ElementRenderer
        element={element}
        pop={pop}
        isBackSide={element.isBackSide || false}
        showBackSidePreview={showBackSidePreview}
        useSampleData={true}
        zoom={zoom}
      />
      
      {/* リサイズハンドル */}
      {renderResizeHandles()}
      
      {/* 選択時の枠線 */}
      {isSelected && !isDragging && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
      )}
    </div>
  ) as React.ReactElement;
}