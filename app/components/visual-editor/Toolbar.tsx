"use client";

import React, { useState, useEffect } from "react";
import type { VisualTemplate } from "./types";
import {
  hasSavedTemplates,
  getSavedTemplates,
  downloadTemplateAsJSON,
  importTemplateFromFile,
} from "./utils/storageUtils";

interface ToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSave: () => void;
  onReset: () => void;
  currentSample: 1 | 2 | 3;
  onSampleChange: (sample: 1 | 2 | 3) => void;
  template: VisualTemplate;
  onLoad: (template: VisualTemplate) => void;
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
}: ToolbarProps) {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [hasTemplatesInStorage, setHasTemplatesInStorage] = useState(false);

  // ローカルストレージの状態をチェック
  useEffect(() => {
    setHasTemplatesInStorage(hasSavedTemplates());
  }, []);

  // エクスポート機能
  const handleExport = () => {
    downloadTemplateAsJSON(template);
  };

  // インポート機能
  const handleImport = async () => {
    try {
      const importedTemplate = await importTemplateFromFile();
      if (importedTemplate) {
        onLoad(importedTemplate);
        alert("テンプレートをインポートしました");
      }
    } catch {
      alert("インポートに失敗しました");
    }
  };

  // 読み込み機能
  const handleLoadTemplate = (savedTemplate: VisualTemplate) => {
    onLoad(savedTemplate);
    setShowLoadModal(false);
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
          onClick={onSave}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          保存
        </button>

        <button
          onClick={() => setShowLoadModal(true)}
          disabled={!hasTemplatesInStorage}
          className={`px-4 py-2 border rounded transition-colors ${
            hasTemplatesInStorage
              ? "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
        >
          読み込み
        </button>

        <button
          onClick={handleExport}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          エクスポート
        </button>

        <button
          onClick={handleImport}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          インポート
        </button>

        <button
          onClick={onReset}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          リセット
        </button>
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

      {/* 読み込みモーダル */}
      {showLoadModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>保存されたテンプレート</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                ✕
              </button>
            </div>
            <div className='space-y-2'>
              {getSavedTemplates().map((savedTemplate) => (
                <div
                  key={savedTemplate.id}
                  className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                  onClick={() => handleLoadTemplate(savedTemplate)}
                >
                  <div className='font-medium'>{savedTemplate.name}</div>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    更新: {new Date(savedTemplate.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
