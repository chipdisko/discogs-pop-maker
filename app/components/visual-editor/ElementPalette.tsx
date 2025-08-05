'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import type { TemplateElement } from './types';
import { createElement } from './utils/templateUtils';

interface ElementPaletteProps {
  onAddElement: (element: TemplateElement) => void;
}

interface PaletteItem {
  type: TemplateElement['type'];
  dataBinding: string;
  label: string;
  icon: string;
  description?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // テキスト要素
  { type: 'text', dataBinding: 'artist', label: 'アーティスト名', icon: '🎤' },
  { type: 'text', dataBinding: 'title', label: 'タイトル', icon: '💿' },
  { type: 'text', dataBinding: 'label', label: 'レーベル', icon: '🏷️' },
  { type: 'text', dataBinding: 'countryYear', label: '国・年', icon: '📅' },
  { type: 'text', dataBinding: 'condition', label: 'コンディション', icon: '⭐' },
  { type: 'text', dataBinding: 'genre', label: 'ジャンル', icon: '🎵' },
  { type: 'text', dataBinding: 'price', label: '価格', icon: '💰' },
  { type: 'text', dataBinding: 'comment', label: 'コメント', icon: '💬', description: '3行固定' },
  { type: 'text', dataBinding: 'custom', label: 'カスタムテキスト', icon: '✏️' },
  // その他の要素
  { type: 'badge', dataBinding: 'badges', label: 'バッジ', icon: '🏅' },
  { type: 'image', dataBinding: 'image', label: '画像', icon: '🖼️', description: 'JPG/PNG対応' },
  { type: 'qrcode', dataBinding: 'discogsUrl', label: 'QRコード', icon: '📱', description: '表面のみ' },
];

function PaletteItemComponent({ item }: { item: PaletteItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: () => ({
      id: `new-${item.type}-${item.dataBinding}`,
      type: 'new' as const,
      elementType: item.type,
      dataBinding: item.dataBinding,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item]);

  return drag(
    <div
      className={`
        p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600
        cursor-grab hover:shadow-md transition-all select-none
        ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
      `}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-center space-x-2 pointer-events-none">
        <span className="text-2xl">{item.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{item.label}</div>
          {item.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.description}
            </div>
          )}
        </div>
      </div>
    </div>
  ) as React.ReactElement;
}

export default function ElementPalette({ onAddElement }: ElementPaletteProps) {
  const handleQuickAdd = (item: PaletteItem) => {
    const element = createElement(
      item.type,
      item.dataBinding,
      { x: 10, y: item.type === 'qrcode' ? 20 : 10 } // QRコードは表面に配置
    );
    onAddElement(element);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <h3 className="text-lg font-semibold mb-4">要素パレット</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            ドラッグ&ドロップで配置
          </h4>
          <div className="space-y-2">
            {PALETTE_ITEMS.map((item) => (
              <PaletteItemComponent key={`${item.type}-${item.dataBinding}`} item={item} />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            クイック追加
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            ダブルクリックで既定位置に追加
          </p>
          <div className="space-y-2">
            {PALETTE_ITEMS.map((item) => (
              <button
                key={`quick-${item.type}-${item.dataBinding}`}
                onDoubleClick={() => handleQuickAdd(item)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="mr-2">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}