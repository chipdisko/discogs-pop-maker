'use client';

import React from 'react';
import type { PopResponse } from '@/src/application';
import { getSampleBadges } from './utils/sampleData';

interface BadgeRendererProps {
  pop: PopResponse;
  style: React.CSSProperties;
  useSampleData?: boolean;
}

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  RECOMMEND: { bg: '#10b981', text: '#ffffff' },
  MUST: { bg: '#ef4444', text: '#ffffff' },
  RAVE: { bg: '#8b5cf6', text: '#ffffff' },
  ACID: { bg: '#f59e0b', text: '#ffffff' },
};

export default function BadgeRenderer({ pop, style, useSampleData = false }: BadgeRendererProps) {
  const badges = useSampleData ? getSampleBadges() : pop.badges;
  
  if (badges.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
        <span className="text-xs text-gray-500">バッジなし</span>
      </div>
    );
  }

  // 複数のバッジがある場合は最初のものを表示
  const badge = badges[0];
  const colors = BADGE_COLORS[badge.type] || { bg: '#6b7280', text: '#ffffff' };

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded text-white font-bold"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: style.fontSize || '12px',
        fontFamily: style.fontFamily || 'Arial, sans-serif',
      }}
    >
      <span>{badge.displayName}</span>
    </div>
  );
}