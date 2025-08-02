"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { PopResponse } from "@/src/application";
import type { VisualTemplate, TemplateElement, EditorState } from "./types";
import { POP_DIMENSIONS, DEFAULT_TEMPLATE_SETTINGS } from "./types";
import EditorCanvas from "./EditorCanvas";
import ElementPalette from "./ElementPalette";
import PropertyPanel from "./PropertyPanel";
import Toolbar from "./Toolbar";
import { createDefaultTemplate } from "./utils/templateUtils";
import {
  autoSaveCurrentTemplate,
  getAutoSavedTemplate,
  clearAutoSave,
  saveTemplate,
  getSavedTemplates,
} from "./utils/storageUtils";

interface VisualEditorProps {
  pop: PopResponse;
  onTemplateChange?: (template: VisualTemplate) => void;
  initialTemplate?: VisualTemplate;
}

export default function VisualEditor({
  pop,
  onTemplateChange,
  initialTemplate,
}: VisualEditorProps) {
  const [template, setTemplate] = useState<VisualTemplate>(() => {
    // 初期化時に自動保存されたテンプレートを確認
    const autoSaved = getAutoSavedTemplate();
    return initialTemplate || autoSaved || createDefaultTemplate();
  });

  const [showAutoSaveNotification, setShowAutoSaveNotification] =
    useState(false);

  const [editorState, setEditorState] = useState<EditorState>({
    selectedElementId: null,
    isDragging: false,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    showBackSidePreview: false,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // 要素の追加
  const handleAddElement = useCallback(
    (element: TemplateElement) => {
      const newTemplate = {
        ...template,
        elements: [...template.elements, element],
      };
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
      setEditorState((prev) => ({ ...prev, selectedElementId: element.id }));
    },
    [template, onTemplateChange]
  );

  // 要素の更新
  const handleUpdateElement = useCallback(
    (elementId: string, updates: Partial<TemplateElement>) => {
      const newTemplate = {
        ...template,
        elements: template.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      };
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
    },
    [template, onTemplateChange]
  );

  // 要素の削除
  const handleDeleteElement = useCallback(
    (elementId: string) => {
      const newTemplate = {
        ...template,
        elements: template.elements.filter((el) => el.id !== elementId),
      };
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
      setEditorState((prev) => ({
        ...prev,
        selectedElementId:
          prev.selectedElementId === elementId ? null : prev.selectedElementId,
      }));
    },
    [template, onTemplateChange]
  );

  // 要素の選択
  const handleSelectElement = useCallback((elementId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedElementId: elementId }));
  }, []);

  // ズーム変更
  const handleZoomChange = useCallback((zoom: number) => {
    setEditorState((prev) => ({ ...prev, zoom }));
  }, []);

  // プレビューモード切り替え
  const handleTogglePreview = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      showBackSidePreview: !prev.showBackSidePreview,
    }));
  }, []);

  // テンプレート保存
  const handleSaveTemplate = useCallback(() => {
    const templateName = prompt(
      "テンプレート名を入力してください:",
      template.name
    );
    if (templateName) {
      const templateToSave = { ...template, name: templateName };
      saveTemplate(templateToSave);
      setTemplate(templateToSave);
      alert("テンプレートを保存しました");
    }
  }, [template]);

  // テンプレートリセット
  const handleResetTemplate = useCallback(() => {
    if (confirm("現在の編集内容をリセットしますか？")) {
      const newTemplate = createDefaultTemplate();
      setTemplate(newTemplate);
      clearAutoSave();
      onTemplateChange?.(newTemplate);
    }
  }, [onTemplateChange]);

  // デザインボタンのハンドラー
  const handleDesign = useCallback(() => {
    alert(
      "デザイン機能は開発中です。プリセットテンプレートや高度なスタイル設定が予定されています。"
    );
  }, []);

  const selectedElement = template.elements.find(
    (el) => el.id === editorState.selectedElementId
  );

  // 自動保存
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      autoSaveCurrentTemplate(template);
      setShowAutoSaveNotification(true);
      const hideTimeout = setTimeout(() => {
        setShowAutoSaveNotification(false);
      }, 2000);
      return () => clearTimeout(hideTimeout);
    }, 1000); // 1秒後に自動保存

    return () => clearTimeout(saveTimeout);
  }, [template]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && editorState.selectedElementId) {
        handleDeleteElement(editorState.selectedElementId);
      }
      if (e.key === "Escape") {
        handleSelectElement(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editorState.selectedElementId, handleDeleteElement, handleSelectElement]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex bg-gray-50 dark:bg-gray-900 h-full'>
        {/* 左サイドバー: 要素パレット */}
        <div className='w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <ElementPalette onAddElement={handleAddElement} />
        </div>

        {/* メインエリア */}
        <div className='flex-1 flex flex-col'>
          {/* ツールバー */}
          <Toolbar
            zoom={editorState.zoom}
            onZoomChange={handleZoomChange}
            showBackSidePreview={editorState.showBackSidePreview}
            onTogglePreview={handleTogglePreview}
            onSave={handleSaveTemplate}
            onReset={handleResetTemplate}
            onDesign={handleDesign}
          />

          {/* キャンバスエリア */}
          <div
            ref={canvasRef}
            className='flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8'
          >
            <EditorCanvas
              pop={pop}
              template={template}
              editorState={editorState}
              onAddElement={handleAddElement}
              onUpdateElement={handleUpdateElement}
              onSelectElement={handleSelectElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>
        </div>

        {/* 右サイドバー: プロパティパネル */}
        <div className='w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <PropertyPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />
        </div>

        {/* 自動保存通知 */}
        {showAutoSaveNotification && (
          <div className='fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'>
            <div className='flex items-center gap-2'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              自動保存しました
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
