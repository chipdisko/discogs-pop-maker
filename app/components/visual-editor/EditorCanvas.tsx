'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { PopResponse } from '@/src/application';
import type { VisualTemplate, TemplateElement, EditorState, DragItem } from './types';
import { POP_DIMENSIONS } from './types';
import { createElement, isInBackSide } from './utils/templateUtils';
import DraggableElement from './DraggableElement';

interface EditorCanvasProps {
  pop: PopResponse;
  template: VisualTemplate;
  editorState: EditorState;
  onAddElement: (element: TemplateElement) => void;
  onUpdateElement: (elementId: string, updates: Partial<TemplateElement>) => void;
  onSelectElement: (elementId: string | null) => void;
  onDeleteElement: (elementId: string) => void;
}

export default function EditorCanvas({
  pop,
  template,
  editorState,
  onAddElement,
  onUpdateElement,
  onSelectElement,
  onDeleteElement,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // mm to pixel conversion based on zoom
  const mmToPx = useCallback((mm: number) => {
    return mm * 3.7795275591 * editorState.zoom; // 1mm = 3.7795275591px at 96dpi
  }, [editorState.zoom]);

  // pixel to mm conversion
  const pxToMm = useCallback((px: number) => {
    return px / (3.7795275591 * editorState.zoom);
  }, [editorState.zoom]);

  // Canvas size calculation
  useEffect(() => {
    setCanvasSize({
      width: mmToPx(POP_DIMENSIONS.WIDTH),
      height: mmToPx(POP_DIMENSIONS.HEIGHT),
    });
  }, [mmToPx]);

  // Drop handling for new and existing elements
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: DragItem, monitor) => {
      if (item.type === 'new' && item.elementType && item.dataBinding) {
        // 新しい要素の配置
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const x = pxToMm(offset.x - canvasRect.left);
          const y = pxToMm(offset.y - canvasRect.top);
          
          // QRコードは表面エリアのみ配置可能
          if (item.elementType === 'qrcode' && isInBackSide(y)) {
            alert('QRコードは表面エリアにのみ配置できます');
            return;
          }
          
          const newElement = createElement(item.elementType, item.dataBinding, { x, y });
          onAddElement(newElement);
          return { success: true };
        }
      } else if (item.type === 'existing' && item.id) {
        // 既存要素の移動処理 - ベストプラクティスに従い差分を計算して返す
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          return { delta };
        }
      }
      
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [pxToMm, onAddElement, isInBackSide]);

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPanning) {
      onSelectElement(null);
    }
  }, [onSelectElement, isPanning]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isSpacePressed && e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [isSpacePressed]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && isSpacePressed) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      // パンオフセットを更新（親コンポーネントのstateとして管理する必要がある）
      // 今回は簡易実装として、transformでキャンバス全体を移動
      if (canvasRef.current) {
        const currentTransform = canvasRef.current.style.transform || '';
        const newTransform = `translate(${deltaX}px, ${deltaY}px)`;
        canvasRef.current.style.transform = newTransform;
      }
      e.preventDefault();
    }
  }, [isPanning, isSpacePressed, panStart]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
    }
  }, [isPanning]);

  // スペースキーのイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Element resize handler
  const handleElementResize = useCallback((elementId: string, newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => {
    if (newPosition) {
      // 位置とサイズの両方を更新
      onUpdateElement(elementId, { 
        size: newSize,
        position: newPosition
      });
    } else {
      // サイズのみ更新
      onUpdateElement(elementId, { size: newSize });
    }
  }, [onUpdateElement]);

  // Element move handler
  const handleElementMove = useCallback((elementId: string, deltaX: number, deltaY: number) => {
    const element = template.elements.find(el => el.id === elementId);
    if (!element) return;

    let newX = element.position.x + pxToMm(deltaX);
    let newY = element.position.y + pxToMm(deltaY);

    // グリッドスナップ
    if (template.settings.snapToGrid) {
      const gridSize = template.settings.gridSize;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    // 境界チェック
    newX = Math.max(0, Math.min(newX, POP_DIMENSIONS.WIDTH - element.size.width));
    newY = Math.max(0, Math.min(newY, POP_DIMENSIONS.HEIGHT - element.size.height));

    // QRコードは表面エリアのみ
    if (element.type === 'qrcode' && isInBackSide(newY)) {
      return;
    }

    // 裏面/表面の自動判定
    const isBackSide = isInBackSide(newY + element.size.height / 2);

    onUpdateElement(elementId, {
      position: { x: newX, y: newY },
      isBackSide,
      autoRotate: isBackSide,
    });
  }, [template, pxToMm, onUpdateElement, isInBackSide]);

  return (
    <div className="flex justify-center items-center h-full">
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative bg-white shadow-lg transition-all ${
          isOver && canDrop ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        } ${isOver ? 'bg-blue-50' : ''}`}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          cursor: isSpacePressed ? (isPanning ? 'grabbing' : 'grab') : 'default',
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 裏面エリアの背景 */}
        {template.settings.showFoldLine && (
          <div
            className="absolute left-0 right-0 top-0"
            style={{
              height: mmToPx(POP_DIMENSIONS.FOLD_LINE_Y),
              backgroundColor: editorState.showBackSidePreview ? 'rgba(255, 235, 238, 0.5)' : 'rgba(245, 245, 245, 0.5)',
            }}
          />
        )}

        {/* 折り線 */}
        {template.settings.showFoldLine && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-gray-400"
            style={{ top: mmToPx(POP_DIMENSIONS.FOLD_LINE_Y) }}
          >
            <span className="absolute -top-3 left-2 text-xs text-gray-500 bg-white px-1">
              折り線（裏面 ↑ / 表面 ↓）
            </span>
          </div>
        )}

        {/* グリッド */}
        {template.settings.showGuides && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, #f0f0f0 0, #f0f0f0 1px, transparent 1px, transparent ${mmToPx(template.settings.gridSize)}px),
                repeating-linear-gradient(90deg, #f0f0f0 0, #f0f0f0 1px, transparent 1px, transparent ${mmToPx(template.settings.gridSize)}px)
              `,
            }}
          />
        )}

        {/* 要素の描画 */}
        {template.elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={editorState.selectedElementId === element.id}
            showBackSidePreview={editorState.showBackSidePreview}
            zoom={editorState.zoom}
            mmToPx={mmToPx}
            pxToMm={pxToMm}
            onMove={handleElementMove}
            onResize={handleElementResize}
            onSelect={() => onSelectElement(element.id)}
            pop={pop}
            isPanningMode={isSpacePressed}
          />
        ))}
      </div>
    </div>
  );
}