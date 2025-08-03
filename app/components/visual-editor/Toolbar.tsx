"use client";

import React from "react";

interface ToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showBackSidePreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onReset: () => void;
}

export default function Toolbar({
  zoom,
  onZoomChange,
  showBackSidePreview,
  onTogglePreview,
  onSave,
  onReset,
}: ToolbarProps) {
  const zoomOptions = [
    { value: 0.5, label: "50%" },
    { value: 0.75, label: "75%" },
    { value: 1, label: "100%" },
    { value: 1.5, label: "150%" },
    { value: 2, label: "200%" },
  ];

  return (
    <div className='h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 flex items-center justify-between'>
      {/* 左側: 基本ツール */}
      <div className='flex items-center space-x-4'>
        <button
          onClick={onSave}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          保存
        </button>

        <button
          onClick={onReset}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          リセット
        </button>
      </div>

      {/* 中央: プレビューオプション */}
      <div className='flex items-center space-x-4'>
        <button
          onClick={onTogglePreview}
          className={`px-4 py-2 rounded transition-colors ${
            showBackSidePreview
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {showBackSidePreview
            ? "🔄 裏面プレビュー ON"
            : "🔄 裏面プレビュー OFF"}
        </button>
      </div>

      {/* 右側: ズーム */}
      <div className='flex items-center space-x-2'>
        <span className='text-sm text-gray-600 dark:text-gray-400'>
          ズーム:
        </span>
        <select
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className='px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700'
        >
          {zoomOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
