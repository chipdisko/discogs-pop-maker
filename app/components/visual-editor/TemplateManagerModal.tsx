"use client";

import React, { useState, useEffect } from "react";
import { Save, FileText, Trash2, Download, Upload, X } from "lucide-react";
import type { VisualTemplate } from "./types";
import {
  getSavedTemplates,
  deleteTemplate,
  downloadTemplateAsJSON,
  importTemplateFromFile,
  type StoredTemplate,
} from "./utils/storageUtils";

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: VisualTemplate;
  onSave: () => void;
  onLoad: (template: VisualTemplate) => void;
}

export default function TemplateManagerModal({
  isOpen,
  onClose,
  currentTemplate,
  onSave,
  onLoad,
}: TemplateManagerModalProps) {
  const [savedTemplates, setSavedTemplates] = useState<StoredTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage");

  // モーダル開閉時にテンプレート一覧を更新
  useEffect(() => {
    if (isOpen) {
      setSavedTemplates(getSavedTemplates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // テンプレート削除
  const handleDelete = (templateId: string) => {
    if (confirm("このテンプレートを削除しますか？")) {
      deleteTemplate(templateId);
      setSavedTemplates(getSavedTemplates());
    }
  };

  // テンプレート読み込み
  const handleLoad = (template: StoredTemplate) => {
    onLoad(template);
    onClose();
  };

  // エクスポート機能
  const handleExport = (template: StoredTemplate) => {
    downloadTemplateAsJSON(template);
  };

  // インポート機能
  const handleImport = async () => {
    try {
      const importedTemplate = await importTemplateFromFile();
      if (importedTemplate) {
        onLoad(importedTemplate);
        setSavedTemplates(getSavedTemplates());
        alert("テンプレートをインポートしました");
      }
    } catch {
      alert("インポートに失敗しました");
    }
  };

  // 現在のテンプレート保存
  const handleSave = () => {
    onSave();
    setSavedTemplates(getSavedTemplates());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            テンプレート管理
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "manage"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            保存済みテンプレート
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "import"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            インポート/エクスポート
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "manage" && (
            <div className="space-y-4">
              {/* 現在のテンプレート保存 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      現在のテンプレート
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {currentTemplate.name}
                    </p>
                  </div>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存</span>
                  </button>
                </div>
              </div>

              {/* 保存済みテンプレート一覧 */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  保存済みテンプレート ({savedTemplates.length}件)
                </h4>
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    保存されたテンプレートはありません
                  </div>
                ) : (
                  savedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            作成: {new Date(template.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            更新: {new Date(template.updatedAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            要素数: {template.elements.length}個
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleLoad(template)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="読み込み"
                          >
                            <FileText className="w-4 h-4" />
                            <span>読み込み</span>
                          </button>
                          <button
                            onClick={() => handleExport(template)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="エクスポート"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-6">
              {/* インポート */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  テンプレートをインポート
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  JSONファイルからテンプレートをインポートできます
                </p>
                <button
                  onClick={handleImport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>ファイルを選択してインポート</span>
                </button>
              </div>

              {/* エクスポート */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  現在のテンプレートをエクスポート
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  現在編集中のテンプレートをJSONファイルとしてダウンロードできます
                </p>
                <button
                  onClick={() => downloadTemplateAsJSON(currentTemplate)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>エクスポート</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}