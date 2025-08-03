'use client';

import React from 'react';
import type { TemplateElement } from './types';
import { getLabelText } from './utils/labelUtils';

interface PropertyPanelProps {
  selectedElement: TemplateElement | undefined;
  onUpdateElement: (elementId: string, updates: Partial<TemplateElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export default function PropertyPanel({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}: PropertyPanelProps) {
  if (!selectedElement) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          要素を選択してプロパティを編集
        </p>
      </div>
    );
  }

  const handleStyleChange = (key: string, value: string | number | boolean) => {
    onUpdateElement(selectedElement.id, {
      style: {
        ...(selectedElement.style || {}),
        [key]: value,
      },
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateElement(selectedElement.id, {
        position: {
          ...selectedElement.position,
          [axis]: numValue,
        },
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onUpdateElement(selectedElement.id, {
        size: {
          ...selectedElement.size,
          [dimension]: numValue,
        },
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">プロパティ</h3>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            削除
          </button>
        </div>

        {/* 要素情報 */}
        <div>
          <h4 className="text-sm font-medium mb-2">要素情報</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">タイプ</label>
              <p className="text-sm font-medium">{selectedElement.type}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">データ</label>
              <p className="text-sm font-medium">{selectedElement.dataBinding}</p>
            </div>
            {selectedElement.isBackSide && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ 裏面エリアに配置（180度回転）
              </div>
            )}
          </div>
        </div>

        {/* カスタムテキスト */}
        {selectedElement.dataBinding === 'custom' && (
          <div>
            <label className="text-sm font-medium block mb-1">カスタムテキスト</label>
            <input
              type="text"
              value={selectedElement.customText || ''}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { customText: e.target.value })
              }
              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}

        {/* 位置 */}
        <div>
          <h4 className="text-sm font-medium mb-2">位置 (mm)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">X</label>
              <input
                type="number"
                value={selectedElement.position.x}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                step="0.5"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Y</label>
              <input
                type="number"
                value={selectedElement.position.y}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                step="0.5"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* サイズ */}
        <div>
          <h4 className="text-sm font-medium mb-2">サイズ (mm)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">幅</label>
              <input
                type="number"
                value={selectedElement.size.width}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                step="0.5"
                min="1"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">高さ</label>
              <input
                type="number"
                value={selectedElement.size.height}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                step="0.5"
                min="1"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* テキストスタイル */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">テキストスタイル</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    フォントサイズ (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.style?.fontSize || 12}
                    onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                    min="8"
                    max="48"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">文字色</label>
                  <input
                    type="color"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-full h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* コメント専用設定 */}
            {selectedElement.dataBinding === 'comment' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  改行に対応しています（\nで改行）。
                  テキストは自動的にエリアに収まるよう圧縮されます。
                </p>
              </div>
            )}

          </>
        )}

        {/* QRコード設定 */}
        {selectedElement.type === 'qrcode' && selectedElement.qrSettings && (
          <div>
            <h4 className="text-sm font-medium mb-2">QRコード設定</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  エラー訂正レベル
                </label>
                <select
                  value={selectedElement.qrSettings.errorCorrectionLevel}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      qrSettings: {
                        ...selectedElement.qrSettings!,
                        errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H',
                      },
                    })
                  }
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* データ名ラベル設定 */}
        <div>
          <h4 className="text-sm font-medium mb-2">データ名ラベル</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedElement.label?.show || false}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    label: {
                      ...selectedElement.label,
                      show: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm">ラベルを表示</span>
            </label>
            
            {selectedElement.label?.show && (
              <div className="pl-6 space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    表示テキスト
                  </label>
                  <input
                    type="text"
                    value={selectedElement.label?.text || ''}
                    placeholder={getLabelText(selectedElement.dataBinding)}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        label: {
                          ...selectedElement.label,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    フォントサイズ (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.label?.fontSize || 12}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        label: {
                          ...selectedElement.label,
                          fontSize: parseInt(e.target.value),
                        },
                      })
                    }
                    min="8"
                    max="24"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    文字色
                  </label>
                  <input
                    type="color"
                    value={selectedElement.label?.color || '#666666'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        label: {
                          ...selectedElement.label,
                          color: e.target.value,
                        },
                      })
                    }
                    className="w-full h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}