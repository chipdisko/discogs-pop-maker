"use client";

import React, { useState } from "react";
import { Settings, Undo2, Redo2, Bug } from "lucide-react";
import type { VisualTemplate } from "./types";
import TemplateManagerModal from "./TemplateManagerModal";

interface ToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSave: () => void;
  onReset: () => void;
  currentSample: 1 | 2 | 3;
  onSampleChange: (sample: 1 | 2 | 3) => void;
  template: VisualTemplate;
  onLoad: (template: VisualTemplate) => void;
  onDeselectAll?: () => void; // 選択状態を解除する関数
  // Undo/Redo関連
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  historySize?: number;
  onDebugHistory?: () => void; // デバッグ用
}

export default function Toolbar({
  zoom,
  onZoomChange,
  onSave,
  onReset,
  currentSample,
  onSampleChange,
  template,
  onLoad,
  onDeselectAll,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  historySize = 0,
  onDebugHistory,
}: ToolbarProps) {
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // テンプレート管理モーダルを開く
  const handleOpenTemplateManager = () => {
    // 要素の選択状態を解除
    onDeselectAll?.();
    setShowTemplateManager(true);
  };

  // テンプレート管理モーダルから呼び出される保存処理
  const handleSaveFromModal = () => {
    onSave();
  };

  // テンプレート管理モーダルから呼び出される読み込み処理
  const handleLoadFromModal = (loadedTemplate: VisualTemplate) => {
    onLoad(loadedTemplate);
  };
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
          onClick={handleOpenTemplateManager}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          <Settings className='w-4 h-4' />
          <span>テンプレート管理</span>
        </button>

        <button
          onClick={onReset}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          リセット
        </button>

        {/* Undo/Redoボタン */}
        <div className='flex items-center space-x-2 border-l pl-4 border-gray-300 dark:border-gray-600'>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded transition-colors ${
              canUndo
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            title='元に戻す (Ctrl+Z)'
          >
            <Undo2 className='w-5 h-5' />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded transition-colors ${
              canRedo
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            title='やり直す (Ctrl+Y / Ctrl+Shift+Z)'
          >
            <Redo2 className='w-5 h-5' />
          </button>
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            履歴: {historySize}
          </span>
          {onDebugHistory && (
            <button
              onClick={onDebugHistory}
              className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              title='履歴デバッグ (コンソール出力)'
            >
              <Bug className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      {/* 中央: 空のスペース */}
      <div className='flex-1'></div>

      {/* 右側: サンプル選択とズーム */}
      <div className='flex items-center space-x-4'>
        {/* サンプル選択 */}
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            サンプル:
          </span>
          <div className='flex space-x-1'>
            {[1, 2, 3].map((sample) => (
              <button
                key={sample}
                onClick={() => onSampleChange(sample as 1 | 2 | 3)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  currentSample === sample
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* ズーム */}
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

      {/* テンプレート管理モーダル */}
      <TemplateManagerModal
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        currentTemplate={template}
        onSave={handleSaveFromModal}
        onLoad={handleLoadFromModal}
      />
    </div>
  );
}
