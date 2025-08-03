'use client';

import React from 'react';
import type { BackgroundFrame } from './types';

interface BackgroundFrameRendererProps {
  frame: BackgroundFrame;
  isBackSide: boolean;
  showBackSidePreview: boolean;
  zoom: number;
  isSelected?: boolean; // 選択状態
  onLineClick?: (e: React.MouseEvent) => void; // 線クリック用
  onLineMouseDown?: (e: React.MouseEvent) => void; // 線ドラッグ用
  isEditable?: boolean; // 編集可能かどうか
  dragOffset?: { x: number; y: number }; // ドラッグ中のオフセット
  mmToPx?: (mm: number) => number; // mm to px変換関数
}

export default function BackgroundFrameRenderer({
  frame,
  isBackSide,
  showBackSidePreview,
  zoom,
  isSelected = false,
  onLineClick,
  onLineMouseDown,
  isEditable = false,
  dragOffset,
  mmToPx,
}: BackgroundFrameRendererProps) {
  // スタイル計算
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  };

  // 裏面要素の180度回転
  if (isBackSide && frame.autoRotate && showBackSidePreview) {
    style.transform = 'rotateZ(180deg)';
    style.transformOrigin = 'center center';
  }

  const renderFrame = () => {
    switch (frame.type) {
      case 'rectangle':
        return (
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${frame.size.width} ${frame.size.height}`}>
            <rect
              x={frame.style.strokeWidth ? (frame.style.strokeWidth / 2) : 0.5}
              y={frame.style.strokeWidth ? (frame.style.strokeWidth / 2) : 0.5}
              width={frame.size.width - (frame.style.strokeWidth || 1)}
              height={frame.size.height - (frame.style.strokeWidth || 1)}
              fill={frame.style.fillColor || 'transparent'}
              stroke={frame.style.strokeColor || '#000000'}
              strokeWidth={frame.style.strokeWidth || 1}
              strokeDasharray={
                frame.style.lineStyle === 'dashed' 
                  ? `${(frame.style.strokeWidth || 1) * 3},${(frame.style.strokeWidth || 1) * 3}` 
                  : frame.style.lineStyle === 'dotted' 
                  ? `${frame.style.strokeWidth || 1},${frame.style.strokeWidth || 1}` 
                  : undefined
              }
              fillOpacity={frame.style.opacity || 1}
              strokeOpacity={frame.style.opacity || 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'roundedRectangle':
        return (
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${frame.size.width} ${frame.size.height}`}>
            <rect
              x={frame.style.strokeWidth ? (frame.style.strokeWidth / 2) : 0.5}
              y={frame.style.strokeWidth ? (frame.style.strokeWidth / 2) : 0.5}
              width={frame.size.width - (frame.style.strokeWidth || 1)}
              height={frame.size.height - (frame.style.strokeWidth || 1)}
              rx={frame.style.borderRadius || 5}
              ry={frame.style.borderRadius || 5}
              fill={frame.style.fillColor || 'transparent'}
              stroke={frame.style.strokeColor || '#000000'}
              strokeWidth={frame.style.strokeWidth || 1}
              strokeDasharray={
                frame.style.lineStyle === 'dashed' 
                  ? `${(frame.style.strokeWidth || 1) * 3},${(frame.style.strokeWidth || 1) * 3}` 
                  : frame.style.lineStyle === 'dotted' 
                  ? `${frame.style.strokeWidth || 1},${frame.style.strokeWidth || 1}` 
                  : undefined
              }
              fillOpacity={frame.style.opacity || 1}
              strokeOpacity={frame.style.opacity || 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'circle':
        return (
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${frame.size.width} ${frame.size.height}`}>
            <ellipse
              cx={frame.size.width / 2}
              cy={frame.size.height / 2}
              rx={(frame.size.width - (frame.style.strokeWidth || 1)) / 2}
              ry={(frame.size.height - (frame.style.strokeWidth || 1)) / 2}
              fill={frame.style.fillColor || 'transparent'}
              stroke={frame.style.strokeColor || '#000000'}
              strokeWidth={frame.style.strokeWidth || 1}
              strokeDasharray={
                frame.style.lineStyle === 'dashed' 
                  ? `${(frame.style.strokeWidth || 1) * 3},${(frame.style.strokeWidth || 1) * 3}` 
                  : frame.style.lineStyle === 'dotted' 
                  ? `${frame.style.strokeWidth || 1},${frame.style.strokeWidth || 1}` 
                  : undefined
              }
              fillOpacity={frame.style.opacity || 1}
              strokeOpacity={frame.style.opacity || 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'line':
        // 線の場合は始点・終点を使用
        const startPoint = frame.lineStart || { x: frame.position.x, y: frame.position.y };
        const endPoint = frame.lineEnd || { 
          x: frame.position.x + frame.size.width, 
          y: frame.position.y 
        };
        
        // フレームの位置を基準とした相対座標に変換（mmToPx変換は親で行われるので、ここではmm単位で計算）
        const relativeStartX = startPoint.x - frame.position.x;
        const relativeStartY = startPoint.y - frame.position.y;
        const relativeEndX = endPoint.x - frame.position.x;
        const relativeEndY = endPoint.y - frame.position.y;
        
        const lineStyle: React.CSSProperties = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // ハンドルのイベントを妨げないようにnoneに設定
          overflow: 'visible', // 線がフレーム外に出ても表示
          cursor: 'default', // ハンドルのカーソルを優先するためdefaultに設定
          transform: dragOffset ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined,
          zIndex: 1, // ハンドルより下に配置
        };
        
        // ハンドル領域をチェックする関数
        const isInHandleArea = (e: React.MouseEvent) => {
          if (!isSelected || !mmToPx) return false;
          
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          
          const handleSize = 8; // ハンドルのサイズ（px）
          const handleRadius = handleSize / 2;
          
          // 始点と終点の画面座標を計算
          const startScreenX = (relativeStartX / frame.size.width) * rect.width;
          const startScreenY = (relativeStartY / frame.size.height) * rect.height;
          const endScreenX = (relativeEndX / frame.size.width) * rect.width;
          const endScreenY = (relativeEndY / frame.size.height) * rect.height;
          
          // 始点ハンドル領域内かチェック
          const distToStart = Math.sqrt(
            Math.pow(clickX - startScreenX, 2) + Math.pow(clickY - startScreenY, 2)
          );
          
          // 終点ハンドル領域内かチェック
          const distToEnd = Math.sqrt(
            Math.pow(clickX - endScreenX, 2) + Math.pow(clickY - endScreenY, 2)
          );
          
          return distToStart <= handleRadius || distToEnd <= handleRadius;
        };
        
        const handleLineClick = (e: React.MouseEvent) => {
          if (!isInHandleArea(e) && onLineClick) {
            onLineClick(e);
          }
        };
        
        const handleLineMouseDown = (e: React.MouseEvent) => {
          if (!isInHandleArea(e) && onLineMouseDown) {
            onLineMouseDown(e);
          }
        };

        // マウスオーバー時のカーソル制御
        const handleMouseMove = (e: React.MouseEvent) => {
          const svg = e.currentTarget as SVGElement;
          if (isInHandleArea(e)) {
            svg.style.cursor = 'default'; // ハンドル領域では default カーソル
          } else {
            svg.style.cursor = isEditable ? 'move' : 'default'; // 線の領域では move カーソル
          }
        };

        return (
          <svg 
            width="100%" 
            height="100%" 
            style={lineStyle} 
            viewBox={`0 0 ${frame.size.width} ${frame.size.height}`}
          >
            {/* クリック領域用の透明な太い線 */}
            <line
              x1={relativeStartX}
              y1={relativeStartY}
              x2={relativeEndX}
              y2={relativeEndY}
              stroke="transparent"
              strokeWidth={Math.max((frame.style.strokeWidth || 1) + 6, 10)}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: isEditable ? 'auto' : 'none' }}
              onClick={handleLineClick}
              onMouseDown={handleLineMouseDown}
            />
            {/* 選択状態の場合、太い透明な線を背景に表示 */}
            {isSelected && (
              <line
                x1={relativeStartX}
                y1={relativeStartY}
                x2={relativeEndX}
                y2={relativeEndY}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth={Math.max((frame.style.strokeWidth || 1) + 4, 8)}
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            )}
            {/* 実際の線 */}
            <line
              x1={relativeStartX}
              y1={relativeStartY}
              x2={relativeEndX}
              y2={relativeEndY}
              stroke={frame.style.strokeColor || '#000000'}
              strokeWidth={frame.style.strokeWidth || 1}
              strokeDasharray={
                frame.style.lineStyle === 'dashed' 
                  ? `${(frame.style.strokeWidth || 1) * 3},${(frame.style.strokeWidth || 1) * 3}` 
                  : frame.style.lineStyle === 'dotted' 
                  ? `${frame.style.strokeWidth || 1},${frame.style.strokeWidth || 1}` 
                  : undefined
              }
              strokeOpacity={frame.style.opacity || 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          </svg>
        );

      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${(frame.style.fontSize || 12) * zoom}px`,
              fontFamily: frame.fontFamily || 'Arial, sans-serif',
              color: frame.style.color || '#000000',
              opacity: frame.style.opacity || 1,
            }}
          >
            {frame.text || 'テキスト'}
          </div>
        );

      default:
        return null;
    }
  };

  return <div style={style}>{renderFrame()}</div>;
}