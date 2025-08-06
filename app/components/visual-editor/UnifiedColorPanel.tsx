"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { VisualTemplate } from "./types";

interface UnifiedColorPanelProps {
  template: VisualTemplate;
  onUpdateTemplate: (updates: Partial<VisualTemplate>) => void;
}

export default function UnifiedColorPanel({
  template,
  onUpdateTemplate,
}: UnifiedColorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDataLabelColorChange = (color: string) => {
    onUpdateTemplate({
      settings: {
        ...template.settings,
        unifiedColors: {
          ...template.settings.unifiedColors,
          dataLabelColor: color,
        },
      },
    });
  };

  const handleContentColorChange = (color: string) => {
    onUpdateTemplate({
      settings: {
        ...template.settings,
        unifiedColors: {
          ...template.settings.unifiedColors,
          contentColor: color,
        },
      },
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    onUpdateTemplate({
      settings: {
        ...template.settings,
        unifiedColors: {
          ...template.settings.unifiedColors,
          backgroundColor: color,
        },
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* アコーディオンヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            統一カラー設定
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* アコーディオンコンテンツ */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            すべてのデータ要素（カスタムテキスト以外）に適用される色設定
          </div>

          {/* データラベルの色 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              データラベルの色
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={template.settings.unifiedColors?.dataLabelColor || "#666666"}
                onChange={(e) => handleDataLabelColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={template.settings.unifiedColors?.dataLabelColor || "#666666"}
                onChange={(e) => handleDataLabelColorChange(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="#666666"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              例: アーティスト名、タイトルなどのラベル
            </div>
          </div>

          {/* コンテンツの色 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              コンテンツの色
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={template.settings.unifiedColors?.contentColor || "#1e293b"}
                onChange={(e) => handleContentColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={template.settings.unifiedColors?.contentColor || "#1e293b"}
                onChange={(e) => handleContentColorChange(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="#1e293b"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              例: 実際のデータ値（楽曲名、価格など）
            </div>
          </div>

          {/* 全体背景色 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              全体背景色
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={template.settings.unifiedColors?.backgroundColor || "#ffffff"}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={template.settings.unifiedColors?.backgroundColor || "#ffffff"}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="#ffffff"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              テンプレート全体の背景色
            </div>
          </div>

          {/* プリセットカラー */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              プリセット
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handleDataLabelColorChange("#666666");
                  handleContentColorChange("#1e293b");
                  handleBackgroundColorChange("#ffffff");
                }}
                className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                デフォルト
              </button>
              <button
                onClick={() => {
                  handleDataLabelColorChange("#7c2d12");
                  handleContentColorChange("#991b1b");
                  handleBackgroundColorChange("#fef2f2");
                }}
                className="px-3 py-2 text-xs bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors text-red-800 dark:text-red-200"
              >
                レッド系
              </button>
              <button
                onClick={() => {
                  handleDataLabelColorChange("#1e40af");
                  handleContentColorChange("#1e3a8a");
                  handleBackgroundColorChange("#eff6ff");
                }}
                className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors text-blue-800 dark:text-blue-200"
              >
                ブルー系
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}