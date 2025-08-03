'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import type { BackgroundFrame } from './types';

interface BackgroundFramePaletteProps {
  onAddFrame: (frame: BackgroundFrame) => void;
}

interface PaletteItemProps {
  type: BackgroundFrame['type'];
  label: string;
  icon: React.ReactNode;
}

function PaletteItem({ type, label, icon }: PaletteItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: {
      type: 'new' as const,
      frameType: type,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [type]);

  return (
    <div
      ref={drag}
      className={`
        p-4 bg-white dark:bg-gray-700 rounded-lg border-2 
        border-gray-200 dark:border-gray-600 
        hover:border-blue-400 dark:hover:border-blue-500 
        cursor-move transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="text-3xl">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export default function BackgroundFramePalette({ onAddFrame }: BackgroundFramePaletteProps) {
  const frameTypes: PaletteItemProps[] = [
    {
      type: 'rectangle',
      label: '四角形',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="8" width="24" height="16" />
        </svg>
      ),
    },
    {
      type: 'circle',
      label: '円形',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="12" />
        </svg>
      ),
    },
    {
      type: 'line',
      label: '直線',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="16" x2="28" y2="16" />
        </svg>
      ),
    },
    {
      type: 'text',
      label: 'テキスト',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <text x="16" y="20" textAnchor="middle" fontSize="14" fill="currentColor" stroke="none">A</text>
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">背景枠</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            基本図形
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {frameTypes.map((frameType) => (
              <PaletteItem
                key={frameType.type}
                type={frameType.type}
                label={frameType.label}
                icon={frameType.icon}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            図形をドラッグしてキャンバスに配置してください
          </p>
        </div>
      </div>
    </div>
  );
}