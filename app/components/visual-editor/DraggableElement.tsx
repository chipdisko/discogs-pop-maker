"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import type { PopResponse } from "@/src/application";
import type { TemplateElement, DropResult, VisualTemplate } from "./types";
import ElementRenderer from "./ElementRenderer";
import ResizeHandler from "./ResizeHandler";


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
  pop: PopResponse | null;
  isPanningMode?: boolean;
  sampleKey?: string;
  gridSize: number; // グリッドサイズ（mm単位）
  snapToGrid: boolean; // グリッドスナップ有効フラグ
  template: VisualTemplate; // 統一カラー設定用
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
  template,
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
  // ラベル表示はElementRendererで行うため、ここでは削除

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
        template={template}
      />

      {/* データ名ラベル - ElementRendererで処理 */}

      {/* リサイズハンドル */}
      {renderResizeHandles()}

      {/* 選択時の枠線 */}
      {isSelected && !isDragging && (
        <div className='absolute inset-0 border-2 border-blue-500 pointer-events-none' />
      )}
    </div>
  ) as React.ReactElement;
}
