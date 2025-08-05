'use client';

import React, { useState, useCallback } from 'react';
import type { BackgroundFrame } from './types';

interface BackgroundFrameResizeHandlesProps {
  frame: BackgroundFrame;
  mmToPx: (mm: number) => number;
  pxToMm: (px: number) => number;
  onResize: (frameId: string, newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => void;
  onUpdateFrame?: (frameId: string, updates: Partial<BackgroundFrame>) => void;
  zoom: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'line-start' | 'line-end';

export default function BackgroundFrameResizeHandles({
  frame,
  mmToPx,
  pxToMm,
  onResize,
  onUpdateFrame,
  zoom,
}: BackgroundFrameResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [originalFrame, setOriginalFrame] = useState<BackgroundFrame | null>(null);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // キーボードイベントの監視
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(true);
      setActiveHandle(handle);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = frame.size.width;
      const startHeight = frame.size.height;
      const startPosX = frame.position.x;
      const startPosY = frame.position.y;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = Math.round(pxToMm(e.clientX - startX) * 2) / 2; // 0.5mm単位に丸める
        const deltaY = Math.round(pxToMm(e.clientY - startY) * 2) / 2; // 0.5mm単位に丸める
        
        // リアルタイムでSHIFTキーの状態を取得
        const currentShiftPressed = e.shiftKey;

        let newSize = { width: startWidth, height: startHeight };
        let newPosition = { x: startPosX, y: startPosY };

        if (frame.type === 'line') {
          // 線の場合は始点・終点の処理
          const currentStart = frame.lineStart || { x: startPosX, y: startPosY };
          const currentEnd = frame.lineEnd || { 
            x: startPosX + startWidth, 
            y: startPosY 
          };

          if (handle === 'line-start') {
            let newStart = {
              x: Math.round((currentStart.x + deltaX) * 2) / 2, // 0.5mm単位に丸める
              y: Math.round((currentStart.y + deltaY) * 2) / 2, // 0.5mm単位に丸める
            };
            

            // SHIFT制約: 0度、45度、90度にスナップ
            if (currentShiftPressed) {
              const deltaX = newStart.x - currentEnd.x;
              const deltaY = newStart.y - currentEnd.y;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              
              // 角度を計算（ラジアン）
              const angle = Math.atan2(deltaY, deltaX);
              const angleDegrees = (angle * 180 / Math.PI + 360) % 360;
              
              // 最も近い0度、45度、90度、135度、180度、225度、270度、315度にスナップ
              const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315];
              let closestAngle = snapAngles[0];
              let minDiff = Math.abs(angleDegrees - snapAngles[0]);
              
              for (const snapAngle of snapAngles) {
                const diff = Math.min(Math.abs(angleDegrees - snapAngle), Math.abs(angleDegrees - snapAngle + 360), Math.abs(angleDegrees - snapAngle - 360));
                if (diff < minDiff) {
                  minDiff = diff;
                  closestAngle = snapAngle;
                }
              }
              
              // スナップした角度で新しい位置を計算
              const snapAngleRad = closestAngle * Math.PI / 180;
              newStart.x = currentEnd.x + distance * Math.cos(snapAngleRad);
              newStart.y = currentEnd.y + distance * Math.sin(snapAngleRad);
              
              // 0.5mm単位に丸める
              newStart.x = Math.round(newStart.x * 2) / 2;
              newStart.y = Math.round(newStart.y * 2) / 2;
            }

            // 新しい位置とサイズを計算
            const minX = Math.min(newStart.x, currentEnd.x);
            const minY = Math.min(newStart.y, currentEnd.y);
            const maxX = Math.max(newStart.x, currentEnd.x);
            const maxY = Math.max(newStart.y, currentEnd.y);

            newPosition = { x: minX, y: minY };
            newSize = { 
              width: Math.max(1, maxX - minX), 
              height: Math.max(1, maxY - minY) 
            };

            // 線の始点・終点を更新
            if (onUpdateFrame) {
              onUpdateFrame(frame.id, {
                position: newPosition,
                size: newSize,
                lineStart: newStart,
                lineEnd: currentEnd
              });
            }
            return;
          } else if (handle === 'line-end') {
            let newEnd = {
              x: Math.round((currentEnd.x + deltaX) * 2) / 2, // 0.5mm単位に丸める
              y: Math.round((currentEnd.y + deltaY) * 2) / 2, // 0.5mm単位に丸める
            };

            // SHIFT制約: 0度、45度、90度にスナップ
            if (currentShiftPressed) {
              const deltaX = newEnd.x - currentStart.x;
              const deltaY = newEnd.y - currentStart.y;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              
              // 角度を計算（ラジアン）
              const angle = Math.atan2(deltaY, deltaX);
              const angleDegrees = (angle * 180 / Math.PI + 360) % 360;
              
              // 最も近い0度、45度、90度、135度、180度、225度、270度、315度にスナップ
              const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315];
              let closestAngle = snapAngles[0];
              let minDiff = Math.abs(angleDegrees - snapAngles[0]);
              
              for (const snapAngle of snapAngles) {
                const diff = Math.min(Math.abs(angleDegrees - snapAngle), Math.abs(angleDegrees - snapAngle + 360), Math.abs(angleDegrees - snapAngle - 360));
                if (diff < minDiff) {
                  minDiff = diff;
                  closestAngle = snapAngle;
                }
              }
              
              // スナップした角度で新しい位置を計算
              const snapAngleRad = closestAngle * Math.PI / 180;
              newEnd.x = currentStart.x + distance * Math.cos(snapAngleRad);
              newEnd.y = currentStart.y + distance * Math.sin(snapAngleRad);
              
              // 0.5mm単位に丸める
              newEnd.x = Math.round(newEnd.x * 2) / 2;
              newEnd.y = Math.round(newEnd.y * 2) / 2;
            }

            // 新しい位置とサイズを計算
            const minX = Math.min(currentStart.x, newEnd.x);
            const minY = Math.min(currentStart.y, newEnd.y);
            const maxX = Math.max(currentStart.x, newEnd.x);
            const maxY = Math.max(currentStart.y, newEnd.y);

            newPosition = { x: minX, y: minY };
            newSize = { 
              width: Math.max(1, maxX - minX), 
              height: Math.max(1, maxY - minY) 
            };

            // 線の始点・終点を更新
            if (onUpdateFrame) {
              onUpdateFrame(frame.id, {
                position: newPosition,
                size: newSize,
                lineStart: currentStart,
                lineEnd: newEnd
              });
            }
            return;
          }
        } else {
          // 通常の図形の場合
          switch (handle) {
            case 'nw':
              newSize.width = Math.max(5, Math.round((startWidth - deltaX) * 2) / 2);
              newSize.height = Math.max(5, Math.round((startHeight - deltaY) * 2) / 2);
              newPosition.x = Math.round((startPosX + (startWidth - newSize.width)) * 2) / 2;
              newPosition.y = Math.round((startPosY + (startHeight - newSize.height)) * 2) / 2;
              break;
            case 'n':
              newSize.height = Math.max(5, Math.round((startHeight - deltaY) * 2) / 2);
              newPosition.y = Math.round((startPosY + (startHeight - newSize.height)) * 2) / 2;
              break;
            case 'ne':
              newSize.width = Math.max(5, Math.round((startWidth + deltaX) * 2) / 2);
              newSize.height = Math.max(5, Math.round((startHeight - deltaY) * 2) / 2);
              newPosition.y = Math.round((startPosY + (startHeight - newSize.height)) * 2) / 2;
              break;
            case 'e':
              newSize.width = Math.max(5, Math.round((startWidth + deltaX) * 2) / 2);
              break;
            case 'se':
              newSize.width = Math.max(5, Math.round((startWidth + deltaX) * 2) / 2);
              newSize.height = Math.max(5, Math.round((startHeight + deltaY) * 2) / 2);
              break;
            case 's':
              newSize.height = Math.max(5, Math.round((startHeight + deltaY) * 2) / 2);
              break;
            case 'sw':
              newSize.width = Math.max(5, Math.round((startWidth - deltaX) * 2) / 2);
              newSize.height = Math.max(5, Math.round((startHeight + deltaY) * 2) / 2);
              newPosition.x = Math.round((startPosX + (startWidth - newSize.width)) * 2) / 2;
              break;
            case 'w':
              newSize.width = Math.max(5, Math.round((startWidth - deltaX) * 2) / 2);
              newPosition.x = Math.round((startPosX + (startWidth - newSize.width)) * 2) / 2;
              break;
          }

          // 円形の場合は縦横比を1:1に保つ
          if (frame.type === 'circle') {
            const size = Math.round(Math.max(newSize.width, newSize.height) * 2) / 2;
            const centerX = startPosX + startWidth / 2;
            const centerY = startPosY + startHeight / 2;
            newSize.width = size;
            newSize.height = size;
            newPosition.x = Math.round((centerX - size / 2) * 2) / 2;
            newPosition.y = Math.round((centerY - size / 2) * 2) / 2;
          }

          // 画像の場合は元の縦横比を保つ
          if (frame.type === 'image' && frame.originalAspectRatio) {
            const aspectRatio = frame.originalAspectRatio;
            
            // ハンドルの種類に応じて基準となる辺を決定
            if (['e', 'w'].includes(handle)) {
              // 横方向のリサイズ: 幅に合わせて高さを調整
              newSize.height = Math.round((newSize.width / aspectRatio) * 2) / 2;
            } else if (['n', 's'].includes(handle)) {
              // 縦方向のリサイズ: 高さに合わせて幅を調整
              newSize.width = Math.round((newSize.height * aspectRatio) * 2) / 2;
            } else {
              // 角のハンドル: より大きな変化量に合わせる
              const widthRatio = newSize.width / startWidth;
              const heightRatio = newSize.height / startHeight;
              
              if (Math.abs(widthRatio - 1) > Math.abs(heightRatio - 1)) {
                // 幅の変化が大きい場合
                newSize.height = Math.round((newSize.width / aspectRatio) * 2) / 2;
              } else {
                // 高さの変化が大きい場合
                newSize.width = Math.round((newSize.height * aspectRatio) * 2) / 2;
              }
            }

            // 位置調整（左上を基準とする場合は不要だが、他のハンドルの場合は調整が必要）
            if (['nw', 'n', 'w'].includes(handle)) {
              if (['nw', 'n'].includes(handle)) {
                newPosition.y = Math.round((startPosY + startHeight - newSize.height) * 2) / 2;
              }
              if (['nw', 'w'].includes(handle)) {
                newPosition.x = Math.round((startPosX + startWidth - newSize.width) * 2) / 2;
              }
            }
          }
        }

        onResize(frame.id, newSize, newPosition);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setActiveHandle(null);
        setOriginalFrame(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [frame, resizeStart, originalFrame, onResize, onUpdateFrame, pxToMm]
  );

  // ハンドルのスタイル
  const getHandleStyle = (handle: ResizeHandle) => ({
    position: 'absolute' as const,
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    border: '1px solid #ffffff',
    borderRadius: '2px',
    cursor: isResizing && activeHandle === handle ? 'grabbing' : 'pointer',
    zIndex: 1000,
  });

  const getLineHandleStyle = (handle: ResizeHandle) => {
    const isDraggingThis = isResizing && activeHandle === handle;
    return {
      position: 'absolute' as const,
      width: '10px',
      height: '10px',
      backgroundColor: '#3b82f6',
      border: '2px solid #ffffff',
      borderRadius: '50%',
      cursor: isDraggingThis ? 'grabbing' : 'grab',
      zIndex: 99999, // 高いz-indexを維持
      pointerEvents: 'auto' as const,
    };
  };

  // 線の場合の特別なハンドル
  if (frame.type === 'line') {
    const startPoint = frame.lineStart || { x: frame.position.x, y: frame.position.y };
    const endPoint = frame.lineEnd || { 
      x: frame.position.x + frame.size.width, 
      y: frame.position.y 
    };
    

    return (
      <>
        {/* 始点ハンドル */}
        <div
          style={{
            ...getLineHandleStyle('line-start'),
            left: mmToPx(startPoint.x - frame.position.x) - 5,
            top: mmToPx(startPoint.y - frame.position.y) - 5,
          }}
          onMouseDown={(e) => handleMouseDown(e, 'line-start')}
        />
        {/* 終点ハンドル */}
        <div
          style={{
            ...getLineHandleStyle('line-end'),
            left: mmToPx(endPoint.x - frame.position.x) - 5,
            top: mmToPx(endPoint.y - frame.position.y) - 5,
          }}
          onMouseDown={(e) => handleMouseDown(e, 'line-end')}
        />
      </>
    );
  }

  // 通常の図形のリサイズハンドル
  const handles: Array<{ handle: ResizeHandle; style: React.CSSProperties }> = [
    // 四角形と角丸四角形は8個のハンドル
    { handle: 'nw', style: { ...getHandleStyle('nw'), left: '-4px', top: '-4px', cursor: 'nw-resize' } },
    { handle: 'n', style: { ...getHandleStyle('n'), left: '50%', top: '-4px', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { handle: 'ne', style: { ...getHandleStyle('ne'), right: '-4px', top: '-4px', cursor: 'ne-resize' } },
    { handle: 'e', style: { ...getHandleStyle('e'), right: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { handle: 'se', style: { ...getHandleStyle('se'), right: '-4px', bottom: '-4px', cursor: 'se-resize' } },
    { handle: 's', style: { ...getHandleStyle('s'), left: '50%', bottom: '-4px', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { handle: 'sw', style: { ...getHandleStyle('sw'), left: '-4px', bottom: '-4px', cursor: 'sw-resize' } },
    { handle: 'w', style: { ...getHandleStyle('w'), left: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ];

  // 円形の場合は対角線上の4個のハンドルのみ表示
  const circleHandles = handles.filter(h => ['nw', 'ne', 'se', 'sw'].includes(h.handle));

  const activeHandles = frame.type === 'circle' ? circleHandles : handles;

  return (
    <>
      {activeHandles.map(({ handle, style }) => (
        <div
          key={handle}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, handle)}
        />
      ))}
    </>
  );
}