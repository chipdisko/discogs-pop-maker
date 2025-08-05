"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { PopResponse } from "@/src/application";
import type {
  VisualTemplate,
  TemplateElement,
  EditorState,
  BackgroundFrame,
} from "./types";
import { POP_DIMENSIONS, DEFAULT_TEMPLATE_SETTINGS } from "./types";
import EditorCanvas from "./EditorCanvas";
import ElementPalette from "./ElementPalette";
import BackgroundFramePalette from "./BackgroundFramePalette";
import PropertyPanel from "./PropertyPanel";
import BackgroundFramePropertyPanel from "./BackgroundFramePropertyPanel";
import Toolbar from "./Toolbar";
import {
  createDefaultTemplate,
  createBackgroundFrame,
} from "./utils/templateUtils";
import {
  autoSaveCurrentTemplate,
  getAutoSavedTemplate,
  clearAutoSave,
  saveTemplate,
  getSavedTemplates,
} from "./utils/storageUtils";
import { setSampleData } from "./utils/sampleData";

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
    const baseTemplate =
      initialTemplate || autoSaved || createDefaultTemplate();

    // 既存のテンプレートにbackgroundFramesがない場合は追加
    if (!baseTemplate.backgroundFrames) {
      baseTemplate.backgroundFrames = [];
    }

    return baseTemplate;
  });

  const [showAutoSaveNotification, setShowAutoSaveNotification] =
    useState(false);

  const [editorState, setEditorState] = useState<EditorState>({
    selectedElementId: null,
    selectedBackgroundFrameId: null,
    isDragging: false,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    showBackSidePreview: true,
    editMode: "elements", // デフォルトは表示エリア編集モード
  });

  const [currentSample, setCurrentSample] = useState<1 | 2 | 3>(1);

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

  // プレビューモード切り替え（削除 - 常にON）

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

  // テンプレート読み込み
  const handleLoadTemplate = useCallback((loadedTemplate: VisualTemplate) => {
    setTemplate(loadedTemplate);
    onTemplateChange?.(loadedTemplate);
    clearAutoSave();
  }, [onTemplateChange]);

  // テンプレートリセット
  const handleResetTemplate = useCallback(() => {
    if (confirm("現在の編集内容をリセットしますか？")) {
      const newTemplate = createDefaultTemplate();
      setTemplate(newTemplate);
      clearAutoSave();
      onTemplateChange?.(newTemplate);
    }
  }, [onTemplateChange]);

  // サンプル変更のハンドラー
  const handleSampleChange = useCallback((sample: 1 | 2 | 3) => {
    setSampleData(sample);
    setCurrentSample(sample);
    // テンプレートを強制的に再レンダリングするために、stateを更新
    setTemplate((prev) => ({ ...prev }));
  }, []);

  // 編集モード切り替えのハンドラー
  const handleEditModeChange = useCallback(
    (mode: "background" | "elements") => {
      setEditorState((prev) => ({
        ...prev,
        editMode: mode,
        selectedElementId: null,
        selectedBackgroundFrameId: null,
      }));
    },
    []
  );

  // 背景枠の追加
  const handleAddBackgroundFrame = useCallback(
    (frame: BackgroundFrame) => {
      const newTemplate = {
        ...template,
        backgroundFrames: [...(template.backgroundFrames || []), frame],
      };
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
      setEditorState((prev) => ({
        ...prev,
        selectedBackgroundFrameId: frame.id,
      }));
    },
    [template, onTemplateChange]
  );

  // 背景枠の更新
  const handleUpdateBackgroundFrame = useCallback(
    (frameId: string, updates: Partial<BackgroundFrame>) => {
      const newTemplate = {
        ...template,
        backgroundFrames: (template.backgroundFrames || []).map((frame) =>
          frame.id === frameId ? { ...frame, ...updates } : frame
        ),
      };
      
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
    },
    [template, onTemplateChange]
  );

  // 背景枠の削除
  const handleDeleteBackgroundFrame = useCallback(
    (frameId: string) => {
      const newTemplate = {
        ...template,
        backgroundFrames: (template.backgroundFrames || []).filter(
          (frame) => frame.id !== frameId
        ),
      };
      setTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
      setEditorState((prev) => ({
        ...prev,
        selectedBackgroundFrameId:
          prev.selectedBackgroundFrameId === frameId
            ? null
            : prev.selectedBackgroundFrameId,
      }));
    },
    [template, onTemplateChange]
  );

  // 背景枠の選択
  const handleSelectBackgroundFrame = useCallback((frameId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedBackgroundFrameId: frameId }));
  }, []);

  const selectedElement = template.elements.find(
    (el) => el.id === editorState.selectedElementId
  );

  const selectedBackgroundFrame = template.backgroundFrames?.find(
    (frame) => frame.id === editorState.selectedBackgroundFrameId
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
      // 入力フィールドにフォーカスがある場合はキーボードショートカットを無効化
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Delete") {
        if (
          editorState.editMode === "elements" &&
          editorState.selectedElementId
        ) {
          handleDeleteElement(editorState.selectedElementId);
        } else if (
          editorState.editMode === "background" &&
          editorState.selectedBackgroundFrameId
        ) {
          handleDeleteBackgroundFrame(editorState.selectedBackgroundFrameId);
        }
      }
      if (e.key === "Escape") {
        if (editorState.editMode === "elements") {
          handleSelectElement(null);
        } else if (editorState.editMode === "background") {
          handleSelectBackgroundFrame(null);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    editorState.selectedElementId,
    editorState.selectedBackgroundFrameId,
    editorState.editMode,
    handleDeleteElement,
    handleDeleteBackgroundFrame,
    handleSelectElement,
    handleSelectBackgroundFrame,
  ]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex bg-gray-50 dark:bg-gray-900 h-full'>
        {/* 左サイドバー: 要素パレット/背景枠パレット */}
        <div className='w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            {/* 編集モード切り替え */}
            <div className='flex gap-2'>
              <button
                onClick={() => handleEditModeChange("background")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  editorState.editMode === "background"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                背景枠
              </button>
              <button
                onClick={() => handleEditModeChange("elements")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  editorState.editMode === "elements"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                表示エリア
              </button>
            </div>
          </div>
          {editorState.editMode === "elements" ? (
            <ElementPalette onAddElement={handleAddElement} />
          ) : (
            <BackgroundFramePalette onAddFrame={handleAddBackgroundFrame} />
          )}
        </div>

        {/* メインエリア */}
        <div className='flex-1 flex flex-col'>
          {/* ツールバー */}
          <Toolbar
            zoom={editorState.zoom}
            onZoomChange={handleZoomChange}
            onSave={handleSaveTemplate}
            onReset={handleResetTemplate}
            currentSample={currentSample}
            onSampleChange={handleSampleChange}
            template={template}
            onLoad={handleLoadTemplate}
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
              onAddBackgroundFrame={handleAddBackgroundFrame}
              onUpdateBackgroundFrame={handleUpdateBackgroundFrame}
              onSelectBackgroundFrame={handleSelectBackgroundFrame}
              onDeleteBackgroundFrame={handleDeleteBackgroundFrame}
              sampleKey={`sample-${currentSample}`}
            />
          </div>
        </div>

        {/* 右サイドバー: プロパティパネル */}
        <div className='w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          {editorState.editMode === "elements" ? (
            <PropertyPanel
              selectedElement={selectedElement}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
            />
          ) : (
            <BackgroundFramePropertyPanel
              selectedFrame={selectedBackgroundFrame}
              onUpdateFrame={handleUpdateBackgroundFrame}
              onDeleteFrame={handleDeleteBackgroundFrame}
            />
          )}
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
