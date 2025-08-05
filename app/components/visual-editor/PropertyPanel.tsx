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
    let numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // 2mmグリッドにスナップ
      numValue = Math.round(numValue / 2) * 2;
      onUpdateElement(selectedElement.id, {
        position: {
          ...selectedElement.position,
          [axis]: numValue,
        },
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    let numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // 2mmグリッドにスナップ
      numValue = Math.round(numValue / 2) * 2;
      onUpdateElement(selectedElement.id, {
        size: {
          ...selectedElement.size,
          [dimension]: numValue,
        },
      });
    }
  };

  const handleBorderChange = (side: 'Top' | 'Right' | 'Bottom' | 'Left', property: 'color' | 'width' | 'style', value: string | number) => {
    const borderKey = `border${side}` as keyof typeof selectedElement.style;
    const currentBorder = (selectedElement.style?.[borderKey] as { color: string; width: number; style: string }) || { color: '#000000', width: 0, style: 'solid' };
    
    onUpdateElement(selectedElement.id, {
      style: {
        ...(selectedElement.style || {}),
        [borderKey]: {
          ...currentBorder,
          [property]: value,
        },
      },
    });
  };

  const handleBorderRadiusChange = (corner: 'TopLeft' | 'TopRight' | 'BottomRight' | 'BottomLeft', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const radiusKey = `border${corner}Radius` as keyof typeof selectedElement.style;
      onUpdateElement(selectedElement.id, {
        style: {
          ...(selectedElement.style || {}),
          [radiusKey]: numValue,
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

            {/* テキスト配置設定 */}
            <div>
              <h5 className="text-sm font-medium mb-2">テキスト配置</h5>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">水平配置</label>
                  <div className="flex gap-1 mt-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleStyleChange('textAlign', align)}
                        className={`px-2 py-1 text-xs border rounded ${
                          (selectedElement.style?.textAlign || 'center') === align
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {align === 'left' ? '左' : align === 'center' ? '中央' : '右'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">垂直配置</label>
                  <div className="flex gap-1 mt-1">
                    {(['top', 'middle', 'bottom'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleStyleChange('verticalAlign', align)}
                        className={`px-2 py-1 text-xs border rounded ${
                          (selectedElement.style?.verticalAlign || 'middle') === align
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {align === 'top' ? '上' : align === 'middle' ? '中央' : '下'}
                      </button>
                    ))}
                  </div>
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

        {/* 枠線設定 */}
        <div>
          <h4 className="text-sm font-medium mb-2">枠線設定</h4>
          <div className="space-y-3">
            {(['Top', 'Right', 'Bottom', 'Left'] as const).map((side) => {
              const borderKey = `border${side}` as keyof typeof selectedElement.style;
              const currentBorder = (selectedElement.style?.[borderKey] as { color: string; width: number; style: string }) || { color: '#000000', width: 0, style: 'solid' };
              
              return (
                <div key={side} className="p-2 border rounded dark:border-gray-600">
                  <h5 className="text-xs font-medium mb-2">{side === 'Top' ? '上' : side === 'Right' ? '右' : side === 'Bottom' ? '下' : '左'}辺</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">色</label>
                      <input
                        type="color"
                        value={currentBorder.color}
                        onChange={(e) => handleBorderChange(side, 'color', e.target.value)}
                        className="w-full h-6 border rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">太さ(mm)</label>
                      <input
                        type="number"
                        value={currentBorder.width}
                        onChange={(e) => handleBorderChange(side, 'width', parseFloat(e.target.value) || 0)}
                        step="0.5"
                        min="0"
                        max="5"
                        className="w-full px-1 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">スタイル</label>
                      <select
                        value={currentBorder.style}
                        onChange={(e) => handleBorderChange(side, 'style', e.target.value)}
                        className="w-full px-1 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="none">なし</option>
                        <option value="solid">実線</option>
                        <option value="dashed">破線</option>
                        <option value="dotted">点線</option>
                        <option value="double">二重線</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 角丸設定 */}
        <div>
          <h4 className="text-sm font-medium mb-2">角丸設定</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">左上 (mm)</label>
                <input
                  type="number"
                  value={selectedElement.style?.borderTopLeftRadius || 0}
                  onChange={(e) => handleBorderRadiusChange('TopLeft', e.target.value)}
                  step="0.5"
                  min="0"
                  max="20"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">右上 (mm)</label>
                <input
                  type="number"
                  value={selectedElement.style?.borderTopRightRadius || 0}
                  onChange={(e) => handleBorderRadiusChange('TopRight', e.target.value)}
                  step="0.5"
                  min="0"
                  max="20"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">左下 (mm)</label>
                <input
                  type="number"
                  value={selectedElement.style?.borderBottomLeftRadius || 0}
                  onChange={(e) => handleBorderRadiusChange('BottomLeft', e.target.value)}
                  step="0.5"
                  min="0"
                  max="20"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">右下 (mm)</label>
                <input
                  type="number"
                  value={selectedElement.style?.borderBottomRightRadius || 0}
                  onChange={(e) => handleBorderRadiusChange('BottomRight', e.target.value)}
                  step="0.5"
                  min="0"
                  max="20"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => {
                  handleBorderRadiusChange('TopLeft', '0');
                  handleBorderRadiusChange('TopRight', '0');
                  handleBorderRadiusChange('BottomRight', '0');
                  handleBorderRadiusChange('BottomLeft', '0');
                }}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                なし
              </button>
              <button
                onClick={() => {
                  handleBorderRadiusChange('TopLeft', '2');
                  handleBorderRadiusChange('TopRight', '2');
                  handleBorderRadiusChange('BottomRight', '2');
                  handleBorderRadiusChange('BottomLeft', '2');
                }}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                小(2mm)
              </button>
              <button
                onClick={() => {
                  handleBorderRadiusChange('TopLeft', '4');
                  handleBorderRadiusChange('TopRight', '4');
                  handleBorderRadiusChange('BottomRight', '4');
                  handleBorderRadiusChange('BottomLeft', '4');
                }}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                中(4mm)
              </button>
              <button
                onClick={() => {
                  handleBorderRadiusChange('TopLeft', '8');
                  handleBorderRadiusChange('TopRight', '8');
                  handleBorderRadiusChange('BottomRight', '8');
                  handleBorderRadiusChange('BottomLeft', '8');
                }}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                大(8mm)
              </button>
            </div>
          </div>
        </div>

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
                      show: e.target.checked,
                      text: selectedElement.label?.text,
                      fontSize: selectedElement.label?.fontSize,
                      color: selectedElement.label?.color,
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
                          show: selectedElement.label?.show ?? false,
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
                          show: selectedElement.label?.show ?? false,
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
                          show: selectedElement.label?.show ?? false,
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