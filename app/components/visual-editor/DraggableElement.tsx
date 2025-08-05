"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import type { PopResponse } from "@/src/application";
import type { TemplateElement, DropResult } from "./types";
import ElementRenderer from "./ElementRenderer";
import ResizeHandler from "./ResizeHandler";
import { getLabelText } from "./utils/labelUtils";

interface DraggableElementProps {
  element: TemplateElement;
  isSelected: boolean;
  showBackSidePreview: boolean;
  zoom: number;
  mmToPx: (mm: number) => number;
  pxToMm: (px: number) => number;
  onMove: (elementId: string, deltaX: number, deltaY: number) => void;
  onResize: (
    elementId: string,
    newSize: { width: number; height: number },
    newPosition?: { x: number; y: number }
  ) => void;
  onSelect: () => void;
  pop: PopResponse;
  isPanningMode?: boolean;
  sampleKey?: string;
  gridSize: number; // グリッドサイズ（mm単位）
  snapToGrid: boolean; // グリッドスナップ有効フラグ
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
  sampleKey,
  gridSize,
  snapToGrid,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);

  // キーボード移動機能
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無効化
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // 矢印キーでの移動
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        
        let deltaX = 0;
        let deltaY = 0;
        const moveDistance = snapToGrid ? gridSize : 1; // グリッドスナップが有効な場合はグリッドサイズ、無効な場合は1mm

        switch (e.code) {
          case 'ArrowUp':
            deltaY = -moveDistance;
            break;
          case 'ArrowDown':
            deltaY = moveDistance;
            break;
          case 'ArrowLeft':
            deltaX = -moveDistance;
            break;
          case 'ArrowRight':
            deltaX = moveDistance;
            break;
        }

        // mmからpxに変換してonMoveを呼び出し
        const deltaXPx = deltaX * 3.7795275591 * zoom; // mm to px
        const deltaYPx = deltaY * 3.7795275591 * zoom;
        onMove(element.id, deltaXPx, deltaYPx);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, element.id, onMove, snapToGrid, gridSize, zoom]);

  // ドラッグ設定
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: "element",
      canDrag: () => !isPanningMode,
      item: () => {
        setIsDragging(true);
        return {
          id: element.id,
          type: "existing" as const,
          position: {
            x: element.position.x,
            y: element.position.y,
          },
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
    }),
    [element.id, element.position.x, element.position.y, onMove, isPanningMode]
  );

  // 要素の位置とサイズ
  const style: React.CSSProperties = {
    position: "absolute",
    left: mmToPx(element.position.x),
    top: mmToPx(element.position.y),
    width: mmToPx(element.size.width),
    height: mmToPx(element.size.height),
    opacity,
    cursor: isPanningMode ? "grab" : isDragging ? "grabbing" : "grab",
    overflow: "visible", // テキストが圧縮されても見えるように
    zIndex: isSelected ? 1000 : isDragging ? 999 : 1, // 選択中は最前面、ドラッグ中は準最前面
  };

  // クリックハンドラー
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        e.stopPropagation();
        onSelect();
      }
    },
    [onSelect, isDragging]
  );

  // リサイズハンドル
  const renderResizeHandles = () => {
    if (!isSelected || isDragging) return null;

    return (
      <ResizeHandler
        element={element}
        onResize={onResize}
        mmToPx={mmToPx}
        pxToMm={pxToMm}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
      />
    );
  };

  // データ名ラベル
  const renderLabel = () => {
    if (!element.label?.show) return null;

    const labelText = getLabelText(element.dataBinding, element.label?.text);
    const fontSize = (element.label?.fontSize || 12) * zoom;
    const color = element.label?.color || "#666666";

    return (
      <div
        className='absolute pointer-events-none leading-none'
        style={{
          top: -fontSize - 2,
          left: 0,
          fontSize: `${fontSize}px`,
          color,
          fontFamily: "Arial, sans-serif",
          padding: "1px 4px",
          borderRadius: "2px",
          whiteSpace: "pre",
          zIndex: 1001,
        }}
      >
        {labelText}
      </div>
    );
  };

  return drag(
    <div
      style={style}
      onClick={handleClick}
      className={`group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* 要素の内容 */}
      <ElementRenderer
        element={element}
        pop={pop}
        isBackSide={element.isBackSide || false}
        showBackSidePreview={showBackSidePreview}
        useSampleData={true}
        zoom={zoom}
        sampleKey={sampleKey}
      />

      {/* データ名ラベル */}
      {renderLabel()}

      {/* リサイズハンドル */}
      {renderResizeHandles()}

      {/* 選択時の枠線 */}
      {isSelected && !isDragging && (
        <div className='absolute inset-0 border-2 border-blue-500 pointer-events-none' />
      )}
    </div>
  ) as React.ReactElement;
}
