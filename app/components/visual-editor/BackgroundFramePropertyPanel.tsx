'use client';

import React from 'react';
import type { BackgroundFrame } from './types';

interface BackgroundFramePropertyPanelProps {
  selectedFrame: BackgroundFrame | undefined;
  onUpdateFrame: (frameId: string, updates: Partial<BackgroundFrame>) => void;
  onDeleteFrame: (frameId: string) => void;
}

export default function BackgroundFramePropertyPanel({
  selectedFrame,
  onUpdateFrame,
  onDeleteFrame,
}: BackgroundFramePropertyPanelProps) {
  if (!selectedFrame) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          背景枠を選択してプロパティを編集
        </p>
      </div>
    );
  }

  const handleStyleChange = (key: string, value: string | number) => {
    onUpdateFrame(selectedFrame.id, {
      style: {
        ...(selectedFrame.style || {}),
        [key]: value,
      },
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateFrame(selectedFrame.id, {
        position: {
          ...selectedFrame.position,
          [axis]: numValue,
        },
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onUpdateFrame(selectedFrame.id, {
        size: {
          ...selectedFrame.size,
          [dimension]: numValue,
        },
      });
    }
  };

  const handleTextChange = (value: string) => {
    onUpdateFrame(selectedFrame.id, {
      text: value,
    });
  };


  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">背景枠プロパティ</h3>
          <button
            onClick={() => onDeleteFrame(selectedFrame.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            削除
          </button>
        </div>

        {/* 背景枠情報 */}
        <div>
          <h4 className="text-sm font-medium mb-2">背景枠情報</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">タイプ</label>
              <p className="text-sm font-medium">
                {selectedFrame.type === 'rectangle' && '四角形'}
                {selectedFrame.type === 'circle' && '円形'}
                {selectedFrame.type === 'roundedRectangle' && '角丸四角形'}
                {selectedFrame.type === 'line' && '直線'}
                {selectedFrame.type === 'text' && 'テキスト'}
              </p>
            </div>
            {selectedFrame.isBackSide && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ 裏面エリアに配置（180度回転）
              </div>
            )}
          </div>
        </div>

        {/* 位置 */}
        <div>
          <h4 className="text-sm font-medium mb-2">位置 (mm)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">X</label>
              <input
                type="number"
                value={selectedFrame.position.x}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                step="0.5"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Y</label>
              <input
                type="number"
                value={selectedFrame.position.y}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                step="0.5"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* サイズ（線以外） */}
        {selectedFrame.type !== 'line' && (
          <div>
            <h4 className="text-sm font-medium mb-2">サイズ (mm)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">幅</label>
                <input
                  type="number"
                  value={selectedFrame.size.width}
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
                  value={selectedFrame.size.height}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  step="0.5"
                  min="1"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 線の座標（線のみ） */}
        {selectedFrame.type === 'line' && (
          <div>
            <h4 className="text-sm font-medium mb-2">線の座標 (mm)</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">始点 X</label>
                  <input
                    type="number"
                    value={selectedFrame.lineStart?.x || selectedFrame.position.x}
                    onChange={(e) => {
                      const newX = parseFloat(e.target.value);
                      if (!isNaN(newX)) {
                        onUpdateFrame(selectedFrame.id, {
                          lineStart: {
                            x: newX,
                            y: selectedFrame.lineStart?.y || selectedFrame.position.y,
                          }
                        });
                      }
                    }}
                    step="0.5"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">始点 Y</label>
                  <input
                    type="number"
                    value={selectedFrame.lineStart?.y || selectedFrame.position.y}
                    onChange={(e) => {
                      const newY = parseFloat(e.target.value);
                      if (!isNaN(newY)) {
                        onUpdateFrame(selectedFrame.id, {
                          lineStart: {
                            x: selectedFrame.lineStart?.x || selectedFrame.position.x,
                            y: newY,
                          }
                        });
                      }
                    }}
                    step="0.5"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">終点 X</label>
                  <input
                    type="number"
                    value={selectedFrame.lineEnd?.x || (selectedFrame.position.x + selectedFrame.size.width)}
                    onChange={(e) => {
                      const newX = parseFloat(e.target.value);
                      if (!isNaN(newX)) {
                        onUpdateFrame(selectedFrame.id, {
                          lineEnd: {
                            x: newX,
                            y: selectedFrame.lineEnd?.y || selectedFrame.position.y,
                          }
                        });
                      }
                    }}
                    step="0.5"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">終点 Y</label>
                  <input
                    type="number"
                    value={selectedFrame.lineEnd?.y || selectedFrame.position.y}
                    onChange={(e) => {
                      const newY = parseFloat(e.target.value);
                      if (!isNaN(newY)) {
                        onUpdateFrame(selectedFrame.id, {
                          lineEnd: {
                            x: selectedFrame.lineEnd?.x || (selectedFrame.position.x + selectedFrame.size.width),
                            y: newY,
                          }
                        });
                      }
                    }}
                    step="0.5"
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* スタイル設定 */}
        <div>
          <h4 className="text-sm font-medium mb-2">スタイル</h4>
          <div className="space-y-3">
            {/* 塗りつぶし色（図形のみ） */}
            {(selectedFrame.type === 'rectangle' || 
              selectedFrame.type === 'circle' || 
              selectedFrame.type === 'roundedRectangle') && (
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">塗りつぶし色</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedFrame.style.fillColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                  <select
                    value={selectedFrame.style.fillColor === 'transparent' ? 'transparent' : 'color'}
                    onChange={(e) => handleStyleChange('fillColor', e.target.value === 'transparent' ? 'transparent' : '#ffffff')}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="color">色を選択</option>
                    <option value="transparent">透明</option>
                  </select>
                </div>
              </div>
            )}

            {/* 枠線色 */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                {selectedFrame.type === 'line' ? '線の色' : '枠線色'}
              </label>
              <input
                type="color"
                value={selectedFrame.style.strokeColor || '#000000'}
                onChange={(e) => handleStyleChange('strokeColor', e.target.value)}
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>

            {/* 線の太さ */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                {selectedFrame.type === 'line' ? '線の太さ' : '枠線の太さ'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  value={selectedFrame.style.strokeWidth || 1}
                  onChange={(e) => handleStyleChange('strokeWidth', parseFloat(e.target.value))}
                  min="0.5"
                  max="20"
                  step="0.5"
                  className="flex-1"
                />
                <input
                  type="number"
                  value={selectedFrame.style.strokeWidth || 1}
                  onChange={(e) => handleStyleChange('strokeWidth', parseFloat(e.target.value))}
                  min="0.5"
                  max="20"
                  step="0.5"
                  className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-xs text-gray-500 w-8">mm</span>
              </div>
            </div>

            {/* 線のスタイル */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">線のスタイル</label>
              <select
                value={selectedFrame.style.lineStyle || 'solid'}
                onChange={(e) => handleStyleChange('lineStyle', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="solid">実線</option>
                <option value="dashed">破線</option>
                <option value="dotted">点線</option>
              </select>
            </div>

            {/* 角丸半径（角丸四角形のみ） */}
            {selectedFrame.type === 'roundedRectangle' && (
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">角丸半径</label>
                <input
                  type="number"
                  value={selectedFrame.style.borderRadius || 5}
                  onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
                  min="0"
                  max="50"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {/* 透明度 */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">透明度</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  value={(selectedFrame.style.opacity || 1) * 100}
                  onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value) / 100)}
                  min="0"
                  max="100"
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">
                  {Math.round((selectedFrame.style.opacity || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* テキスト設定（テキストのみ） */}
        {selectedFrame.type === 'text' && (
          <div>
            <h4 className="text-sm font-medium mb-2">テキスト設定</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">テキスト</label>
                <input
                  type="text"
                  value={selectedFrame.text || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">フォントサイズ</label>
                <input
                  type="number"
                  value={selectedFrame.style.fontSize || 12}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                  min="8"
                  max="72"
                  className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">文字色</label>
                <input
                  type="color"
                  value={selectedFrame.style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-8 border rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 重なり順序 */}
        <div>
          <h4 className="text-sm font-medium mb-2">重なり順序</h4>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Z-Index</label>
            <input
              type="number"
              value={selectedFrame.zIndex || 1}
              onChange={(e) => onUpdateFrame(selectedFrame.id, { zIndex: parseInt(e.target.value) })}
              min="1"
              max="100"
              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}