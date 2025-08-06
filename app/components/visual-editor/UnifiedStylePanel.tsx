"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Baseline,
} from "lucide-react";
import type { VisualTemplate } from "./types";

interface UnifiedStylePanelProps {
  template: VisualTemplate;
  onUpdateTemplate: (updates: Partial<VisualTemplate>) => void;
}

// 利用可能なフォント
const AVAILABLE_FONTS = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: '"Times New Roman", serif', label: "Times New Roman" },
  { value: '"Courier New", monospace', label: "Courier New" },
];

export default function UnifiedStylePanel({
  template,
  onUpdateTemplate,
}: UnifiedStylePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"dataLabel" | "content">(
    "dataLabel"
  );

  const handleColorChange = (
    type: "dataLabel" | "content" | "background",
    color: string
  ) => {
    if (type === "background") {
      onUpdateTemplate({
        settings: {
          ...template.settings,
          unifiedColors: {
            ...template.settings.unifiedColors,
            backgroundColor: color,
          },
        },
      });
    } else {
      const colorKey = type === "dataLabel" ? "dataLabelColor" : "contentColor";
      onUpdateTemplate({
        settings: {
          ...template.settings,
          unifiedColors: {
            ...template.settings.unifiedColors,
            [colorKey]: color,
          },
        },
      });
    }
  };

  const handleFontChange = (
    target: "dataLabel" | "content",
    property: string,
    value: string | "normal" | "bold" | "italic" | number
  ) => {
    const currentFonts = template.settings.unifiedFonts || {
      dataLabel: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      content: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
    };

    onUpdateTemplate({
      settings: {
        ...template.settings,
        unifiedFonts: {
          ...currentFonts,
          [target]: {
            ...currentFonts[target],
            [property]: value,
          },
        },
      },
    });
  };

  const handleTextDecorationChange = (
    target: "dataLabel" | "content",
    property: string,
    value: string | number | string[] | undefined
  ) => {
    const currentFonts = template.settings.unifiedFonts || {
      dataLabel: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      content: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
    };

    const currentDecoration = currentFonts[target].textDecoration || {};

    onUpdateTemplate({
      settings: {
        ...template.settings,
        unifiedFonts: {
          ...currentFonts,
          [target]: {
            ...currentFonts[target],
            textDecoration: {
              ...currentDecoration,
              [property]: value,
            },
          },
        },
      },
    });
  };

  const toggleDecorationLine = (
    target: "dataLabel" | "content",
    line: "underline" | "overline" | "line-through"
  ) => {
    const currentFonts = template.settings.unifiedFonts || {
      dataLabel: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      content: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      },
    };

    const currentLines = currentFonts[target].textDecoration?.line || [];
    const newLines = currentLines.includes(line)
      ? currentLines.filter((l) => l !== line)
      : [...currentLines, line];

    handleTextDecorationChange(
      target,
      "line",
      newLines.length > 0 ? newLines : undefined
    );
  };

  const getCurrentFontSettings = (target: "dataLabel" | "content") => {
    return (
      template.settings.unifiedFonts?.[target] || {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontStyle: "normal",
      }
    );
  };

  return (
    <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
      {/* アコーディオンヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
      >
        <div className='flex items-center space-x-2'>
          <div className='w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'></div>
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
            統一スタイル設定
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className='w-4 h-4 text-gray-500' />
        ) : (
          <ChevronDown className='w-4 h-4 text-gray-500' />
        )}
      </button>

      {/* アコーディオンコンテンツ */}
      {isExpanded && (
        <div className='px-4 pb-4 space-y-4'>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            すべてのデータ要素（カスタムテキスト以外）に適用されるスタイル設定
          </div>

          {/* タブ切り替え */}
          <div className='flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
            <button
              onClick={() => setActiveTab("dataLabel")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "dataLabel"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              データラベル
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "content"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              コンテンツ
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className='space-y-4'>
            <div className='flex gap-4 items-center'>
              {/* カラー設定 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {activeTab === "dataLabel"
                    ? "データラベルの色"
                    : "コンテンツの色"}
                </label>
                <div className='flex items-center space-x-3'>
                  <input
                    type='color'
                    value={
                      activeTab === "dataLabel"
                        ? template.settings.unifiedColors?.dataLabelColor ||
                          "#666666"
                        : template.settings.unifiedColors?.contentColor ||
                          "#1e293b"
                    }
                    onChange={(e) =>
                      handleColorChange(activeTab, e.target.value)
                    }
                    className='w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer'
                  />
                  <input
                    type='text'
                    value={
                      activeTab === "dataLabel"
                        ? template.settings.unifiedColors?.dataLabelColor ||
                          "#666666"
                        : template.settings.unifiedColors?.contentColor ||
                          "#1e293b"
                    }
                    onChange={(e) =>
                      handleColorChange(activeTab, e.target.value)
                    }
                    className='flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
                  />
                </div>
              </div>

              {/* フォント設定 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  フォント
                </label>
                <select
                  value={getCurrentFontSettings(activeTab).fontFamily}
                  onChange={(e) =>
                    handleFontChange(activeTab, "fontFamily", e.target.value)
                  }
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* フォントスタイル */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  スタイル
                </label>
                <div className='flex space-x-2'>
                  <button
                    onClick={() =>
                      handleFontChange(
                        activeTab,
                        "fontWeight",
                        getCurrentFontSettings(activeTab).fontWeight === "bold"
                          ? "normal"
                          : "bold"
                      )
                    }
                    className={`p-2 rounded border ${
                      getCurrentFontSettings(activeTab).fontWeight === "bold"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title='太字'
                  >
                    <Bold className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() =>
                      handleFontChange(
                        activeTab,
                        "fontStyle",
                        getCurrentFontSettings(activeTab).fontStyle === "italic"
                          ? "normal"
                          : "italic"
                      )
                    }
                    className={`p-2 rounded border ${
                      getCurrentFontSettings(activeTab).fontStyle === "italic"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title='斜体'
                  >
                    <Italic className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>

            <div className='flex gap-4'>
              {/* テキスト装飾 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  テキスト装飾
                </label>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => toggleDecorationLine(activeTab, "underline")}
                    className={`p-2 rounded border ${
                      getCurrentFontSettings(
                        activeTab
                      ).textDecoration?.line?.includes("underline")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title='下線'
                  >
                    <Underline className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => toggleDecorationLine(activeTab, "overline")}
                    className={`p-2 rounded border ${
                      getCurrentFontSettings(
                        activeTab
                      ).textDecoration?.line?.includes("overline")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title='上線'
                  >
                    <Baseline className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() =>
                      toggleDecorationLine(activeTab, "line-through")
                    }
                    className={`p-2 rounded border ${
                      getCurrentFontSettings(
                        activeTab
                      ).textDecoration?.line?.includes("line-through")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title='取り消し線'
                  >
                    <Strikethrough className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {/* 文字間隔 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  文字間隔 (em)
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    value={getCurrentFontSettings(activeTab).letterSpacing || 0}
                    onChange={(e) =>
                      handleFontChange(
                        activeTab,
                        "letterSpacing",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step='0.025'
                    min='-0.5'
                    max='2'
                    className='w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
                    placeholder='0'
                  />
                </div>
              </div>
            </div>

            {/* 装飾詳細設定 */}
            {(getCurrentFontSettings(activeTab).textDecoration?.line?.length ||
              0) > 0 && (
              <div className='space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                  装飾詳細設定
                </div>

                {/* 装飾線の色 */}
                <div className='space-y-1'>
                  <label className='text-xs text-gray-600 dark:text-gray-400'>
                    線の色
                  </label>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='color'
                      value={
                        getCurrentFontSettings(activeTab).textDecoration
                          ?.color ||
                        (activeTab === "dataLabel"
                          ? template.settings.unifiedColors?.dataLabelColor
                          : template.settings.unifiedColors?.contentColor) ||
                        "#000000"
                      }
                      onChange={(e) =>
                        handleTextDecorationChange(
                          activeTab,
                          "color",
                          e.target.value
                        )
                      }
                      className='w-6 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer'
                    />
                    <input
                      type='text'
                      value={
                        getCurrentFontSettings(activeTab).textDecoration
                          ?.color ||
                        (activeTab === "dataLabel"
                          ? template.settings.unifiedColors?.dataLabelColor
                          : template.settings.unifiedColors?.contentColor) ||
                        "#000000"
                      }
                      onChange={(e) =>
                        handleTextDecorationChange(
                          activeTab,
                          "color",
                          e.target.value
                        )
                      }
                      className='flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600'
                    />
                  </div>
                </div>

                {/* 装飾線のスタイル */}
                <div className='space-y-1'>
                  <label className='text-xs text-gray-600 dark:text-gray-400'>
                    線のスタイル
                  </label>
                  <select
                    value={
                      getCurrentFontSettings(activeTab).textDecoration?.style ||
                      "solid"
                    }
                    onChange={(e) =>
                      handleTextDecorationChange(
                        activeTab,
                        "style",
                        e.target.value
                      )
                    }
                    className='w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600'
                  >
                    <option value='solid'>実線</option>
                    <option value='double'>二重線</option>
                    <option value='dotted'>点線</option>
                    <option value='dashed'>破線</option>
                    <option value='wavy'>波線</option>
                  </select>
                </div>

                {/* 線の太さ */}
                <div className='space-y-1'>
                  <label className='text-xs text-gray-600 dark:text-gray-400'>
                    線の太さ (px)
                  </label>
                  <input
                    type='number'
                    value={
                      getCurrentFontSettings(activeTab).textDecoration
                        ?.thickness || 1
                    }
                    onChange={(e) =>
                      handleTextDecorationChange(
                        activeTab,
                        "thickness",
                        parseInt(e.target.value)
                      )
                    }
                    min='1'
                    max='5'
                    className='w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600'
                  />
                </div>

                {/* 下線オフセット（下線の場合のみ） */}
                {getCurrentFontSettings(
                  activeTab
                ).textDecoration?.line?.includes("underline") && (
                  <div className='space-y-1'>
                    <label className='text-xs text-gray-600 dark:text-gray-400'>
                      下線オフセット (px)
                    </label>
                    <input
                      type='number'
                      value={
                        getCurrentFontSettings(activeTab).textDecoration
                          ?.underlineOffset || 2
                      }
                      onChange={(e) =>
                        handleTextDecorationChange(
                          activeTab,
                          "underlineOffset",
                          parseInt(e.target.value)
                        )
                      }
                      min='0'
                      max='10'
                      className='w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600'
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 全体背景色 */}
          <div className='space-y-2 pt-4 border-t border-gray-200 dark:border-gray-600'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              全体背景色
            </label>
            <div className='flex items-center space-x-3'>
              <input
                type='color'
                value={
                  template.settings.unifiedColors?.backgroundColor || "#ffffff"
                }
                onChange={(e) =>
                  handleColorChange("background", e.target.value)
                }
                className='w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer'
              />
              <input
                type='text'
                value={
                  template.settings.unifiedColors?.backgroundColor || "#ffffff"
                }
                onChange={(e) =>
                  handleColorChange("background", e.target.value)
                }
                className='flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
