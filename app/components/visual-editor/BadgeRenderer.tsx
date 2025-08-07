"use client";

import React, { useMemo } from 'react';
import type { Badge } from '@/app/types/badge';
import { BadgeStorageManager } from '@/app/utils/badgeStorage';

interface BadgeRendererProps {
  badgeId?: string | null; // バッジID
  useSampleData?: boolean; // サンプルデータを使用するか
  zoom?: number; // ズームレベル
  // ビジュアルエディタでの配置設定（要素サイズとは別）
  containerWidth?: number; // コンテナ幅(px)
  containerHeight?: number; // コンテナ高さ(px)
  // 配置設定（ビジュアルエディタから渡される）
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export default function BadgeRenderer({
  badgeId,
  useSampleData = false,
  zoom = 1,
  containerWidth,
  containerHeight,
  horizontalAlign = 'center',
  verticalAlign = 'middle',
}: BadgeRendererProps) {
  // バッジデータを取得
  const badgeData = useMemo((): Badge | null => {
    if (!badgeId) return null;
    
    if (useSampleData) {
      // サンプル用のデフォルトバッジを返す
      return {
        id: 'sample-badge',
        name: 'サンプルバッジ',
        type: 'text',
        shape: 'circle',
        width: 20,
        height: 20,
        text: 'SAMPLE',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        fontSize: 12,
        borderEnabled: true,
        borderColor: '#ffffff',
        borderWidth: 1,
        badgeAlign: 'center',
        badgeVerticalAlign: 'middle',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return BadgeStorageManager.getBadgeById(badgeId);
  }, [badgeId, useSampleData]);

  // バッジが見つからない場合は何も表示しない
  if (!badgeData) {
    return null;
  }

  // mm to px 変換（1mm = 3.7795275591px）
  const mmToPx = (mm: number) => mm * 3.7795275591 * zoom;

  // バッジのサイズ（px）
  const badgeWidthPx = mmToPx(badgeData.width);
  const badgeHeightPx = mmToPx(badgeData.height);

  // コンテナ内でのバッジ配置位置を計算
  const getBadgePosition = () => {
    if (!containerWidth || !containerHeight) {
      return { left: 0, top: 0 };
    }

    let left = 0;
    let top = 0;

    // 水平配置（ビジュアルエディタの設定を優先）
    switch (horizontalAlign) {
      case 'left':
        left = 0;
        break;
      case 'center':
        left = (containerWidth - badgeWidthPx) / 2;
        break;
      case 'right':
        left = containerWidth - badgeWidthPx;
        break;
      default:
        left = (containerWidth - badgeWidthPx) / 2;
    }

    // 垂直配置（ビジュアルエディタの設定を優先）
    switch (verticalAlign) {
      case 'top':
        top = 0;
        break;
      case 'middle':
        top = (containerHeight - badgeHeightPx) / 2;
        break;
      case 'bottom':
        top = containerHeight - badgeHeightPx;
        break;
      default:
        top = (containerHeight - badgeHeightPx) / 2;
    }

    return { left, top };
  };

  const badgePosition = getBadgePosition();

  // バッジのスタイル
  const badgeStyle: React.CSSProperties = {
    position: containerWidth && containerHeight ? 'absolute' : 'relative',
    left: badgePosition.left,
    top: badgePosition.top,
    width: badgeWidthPx,
    height: badgeHeightPx,
    backgroundColor: badgeData.backgroundColor || '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: (badgeData.fontSize || 12) * zoom,
    color: badgeData.textColor || '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1,
    overflow: 'hidden',
    userSelect: 'none',
    pointerEvents: 'none', // バッジ自体はクリック不可
  };

  // 形状に応じたスタイル
  if (badgeData.shape === 'circle') {
    // 円形・楕円
    badgeStyle.borderRadius = '50%';
  } else if (badgeData.shape === 'rectangle') {
    // 四角形・長方形 + 角丸
    const borderRadius = badgeData.borderRadius || 0;
    badgeStyle.borderRadius = mmToPx(borderRadius);
  }

  // 枠線設定
  if (badgeData.borderEnabled) {
    const borderWidth = mmToPx(badgeData.borderWidth || 1);
    badgeStyle.border = `${borderWidth}px solid ${badgeData.borderColor || '#ffffff'}`;
  }

  // テキスト自動調整（円や小さな四角形に収まるように）
  const getAdjustedText = () => {
    const text = badgeData.text || 'バッジ';
    
    // 文字数に応じてフォントサイズを調整する簡易ロジック
    if (text.length > 8) {
      badgeStyle.fontSize = ((badgeData.fontSize || 12) * 0.7) * zoom;
    } else if (text.length > 5) {
      badgeStyle.fontSize = ((badgeData.fontSize || 12) * 0.8) * zoom;
    }

    return text;
  };

  // 画像バッジの場合
  if (badgeData.type === 'image' && badgeData.imageSettings?.src) {
    return (
      <div style={badgeStyle}>
        <img
          src={badgeData.imageSettings.src}
          alt={badgeData.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // テキストバッジの場合
  return (
    <div style={badgeStyle}>
      {getAdjustedText()}
    </div>
  );
}