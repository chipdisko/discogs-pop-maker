'use client';

import React, { useRef, useCallback, useState } from 'react';
import { useDrag } from 'react-dnd';
import type { BackgroundFrame, DropResult } from './types';
import BackgroundFrameRenderer from './BackgroundFrameRenderer';
import BackgroundFrameResizeHandles from './BackgroundFrameResizeHandles';

interface DraggableBackgroundFrameProps {
  frame: BackgroundFrame;
  isSelected: boolean;
  showBackSidePreview: boolean;
  zoom: number;
  mmToPx: (mm: number) => number;
  pxToMm: (px: number) => number;
  onMove: (frameId: string, deltaX: number, deltaY: number) => void;
  onResize: (frameId: string, newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => void;
  onSelect: () => void;
  onUpdateFrame?: (frameId: string, updates: Partial<BackgroundFrame>) => void;
  isPanningMode?: boolean;
  isEditable: boolean; // 背景枠作成モードの時のみtrue
}

export default function DraggableBackgroundFrame({
  frame,
  isSelected,
  showBackSidePreview,
  zoom,
  mmToPx,
  pxToMm,
  onMove,
  onResize,
  onSelect,
  onUpdateFrame,
  isPanningMode = false,
  isEditable,
}: DraggableBackgroundFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [isLineDragging, setIsLineDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // ドラッグ設定（編集可能な時のみ、線以外）
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: 'element',
      canDrag: () => !isPanningMode && isEditable && frame.type !== 'line',
      item: () => {
        setIsDragging(true);
        return {
          id: frame.id,
          type: 'existing' as const,
          position: {
            x: frame.position.x,
            y: frame.position.y,
          },
        };
      },
      end: (item, monitor) => {
        setIsDragging(false);

        // ドロップターゲットからの結果を確認
        const dropResult = monitor.getDropResult() as DropResult | null;
        if (dropResult && dropResult.delta) {
          onMove(frame.id, dropResult.delta.x, dropResult.delta.y);
          return;
        }

        // フォールバック: react-dndの標準方法
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta && (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1)) {
          onMove(frame.id, delta.x, delta.y);
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [frame.id, frame.position.x, frame.position.y, onMove, isPanningMode, isEditable]
  );

  // 要素の位置とサイズ
  const style: React.CSSProperties = {
    position: 'absolute',
    left: mmToPx(frame.position.x),
    top: mmToPx(frame.position.y),
    width: mmToPx(frame.size.width),
    height: mmToPx(frame.size.height),
    opacity,
    cursor: !isEditable ? 'default' : isPanningMode ? 'grab' : isDragging ? 'grabbing' : 'move',
    pointerEvents: isEditable && frame.type !== 'line' ? 'auto' : 'none', // 線の場合はpointer-eventsを無効化
    zIndex: frame.zIndex || 1,
  };

  // テキスト編集の開始
  const handleStartEditing = useCallback(() => {
    if (frame.type === 'text' && isEditable && onUpdateFrame) {
      setIsEditing(true);
      setEditingText(frame.text || 'テキスト');
    }
  }, [frame.type, frame.text, isEditable, onUpdateFrame]);

  // テキスト編集の終了
  const handleFinishEditing = useCallback(() => {
    if (onUpdateFrame && editingText !== frame.text) {
      onUpdateFrame(frame.id, { text: editingText });
    }
    setIsEditing(false);
  }, [frame.id, frame.text, editingText, onUpdateFrame]);

  // エスケープキーでテキスト編集を中止
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      setEditingText(frame.text || 'テキスト');
      setIsEditing(false);
    }
  }, [frame.text, handleFinishEditing]);

  // クリックハンドラー
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging && isEditable) {
        e.stopPropagation();
        onSelect();
      }
    },
    [onSelect, isDragging, isEditable]
  );

  // ダブルクリックハンドラー（テキスト要素のみ）
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (frame.type === 'text' && isEditable && !isDragging) {
        e.stopPropagation();
        handleStartEditing();
      }
    },
    [frame.type, isEditable, isDragging, handleStartEditing]
  );

  // 線専用のドラッグハンドラー
  const handleLineMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (frame.type !== 'line' || !isEditable || isPanningMode) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      setIsLineDragging(true);
      onSelect();

      // ドラッグ開始位置をローカル変数で保持
      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // ドラッグ中の視覚的なフィードバック
        const currentDeltaX = moveEvent.clientX - startX;
        const currentDeltaY = moveEvent.clientY - startY;
        setDragOffset({ x: currentDeltaX, y: currentDeltaY });
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        setIsLineDragging(false);
        setDragOffset({ x: 0, y: 0 }); // プレビューをリセット
        
        // ドラッグ終了時に総移動量を計算して一回だけ移動
        const totalDeltaX = upEvent.clientX - startX;
        const totalDeltaY = upEvent.clientY - startY;
        
        if (Math.abs(totalDeltaX) > 1 || Math.abs(totalDeltaY) > 1) {
          onMove(frame.id, totalDeltaX, totalDeltaY);
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [frame.type, frame.id, isEditable, isPanningMode, onMove, onSelect]
  );

  const ref = isEditable && frame.type !== 'line' ? drag : null;

  return (
    <div
      ref={ref}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`${isSelected && isEditable && frame.type !== 'line' ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* 背景枠の内容（テキスト編集中でない場合） */}
      {!isEditing && (
        <BackgroundFrameRenderer
          frame={frame}
          isBackSide={frame.isBackSide || false}
          showBackSidePreview={showBackSidePreview}
          zoom={zoom}
          isSelected={isSelected && isEditable}
          onLineClick={frame.type === 'line' ? handleClick : undefined}
          onLineMouseDown={frame.type === 'line' ? handleLineMouseDown : undefined}
          isEditable={isEditable}
          dragOffset={isLineDragging ? dragOffset : undefined}
          mmToPx={mmToPx}
        />
      )}

      {/* テキスト編集インライン入力 */}
      {isEditing && frame.type === 'text' && (
        <input
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={handleFinishEditing}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            fontSize: `${(frame.style.fontSize || 12) * zoom}px`,
            fontFamily: frame.fontFamily || 'Arial, sans-serif',
            color: frame.style.color || '#000000',
            backgroundColor: 'transparent',
            border: '2px solid #3b82f6',
            borderRadius: '2px',
            padding: '2px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="outline-none"
        />
      )}

      {/* 選択時の枠線（編集可能時のみ、編集中でない場合、線以外） */}
      {isSelected && isEditable && !isDragging && !isEditing && frame.type !== 'line' && (
        <div className='absolute inset-0 border-2 border-blue-500 pointer-events-none' />
      )}

      {/* リサイズハンドル（選択時かつ編集可能時のみ、編集中でない場合、線のドラッグ中でない場合） */}
      {isSelected && isEditable && !isDragging && !isEditing && !isLineDragging && (
        <BackgroundFrameResizeHandles
          frame={frame}
          mmToPx={mmToPx}
          pxToMm={pxToMm}
          onResize={onResize}
          onUpdateFrame={onUpdateFrame}
          zoom={zoom}
        />
      )}
    </div>
  );
}