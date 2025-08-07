import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandManager, CommandManagerOptions } from '../components/visual-editor/commands/CommandManager';
import { commandFactory } from '../components/visual-editor/commands/implementations';
import type { Command } from '../components/visual-editor/commands/types';
import type { VisualTemplate, TemplateElement, BackgroundFrame } from '../components/visual-editor/types';

export interface UseCommandManagerReturn {
  // テンプレート状態
  template: VisualTemplate;
  
  // 基本的な操作
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  
  // 履歴情報
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
  
  // 便利なヘルパー関数（コマンドファクトリーのラッパー）
  addElement: (element: TemplateElement) => void;
  updateElement: (elementId: string, oldData: Partial<TemplateElement>, newData: Partial<TemplateElement>) => void;
  deleteElement: (elementId: string) => void;
  addBackgroundFrame: (frame: BackgroundFrame) => void;
  updateBackgroundFrame: (frameId: string, oldData: Partial<BackgroundFrame>, newData: Partial<BackgroundFrame>) => void;
  deleteBackgroundFrame: (frameId: string) => void;
  
  // テンプレートの直接更新（履歴に残さない）
  setTemplateDirectly: (newTemplate: VisualTemplate) => void;
  
  // ユーティリティ
  clearHistory: () => void;
  debugHistory: () => void;
}

export function useCommandManager(
  initialTemplate: VisualTemplate,
  options: CommandManagerOptions = {}
): UseCommandManagerReturn {
  
  const [template, setTemplate] = useState<VisualTemplate>(initialTemplate);
  const [historyInfo, setHistoryInfo] = useState({
    canUndo: false,
    canRedo: false,
    historySize: 0,
  });
  
  // CommandManagerインスタンスをrefで管理
  const commandManagerRef = useRef<CommandManager>(new CommandManager(options));
  
  // 履歴情報を更新する関数
  const updateHistoryInfo = useCallback(() => {
    const info = commandManagerRef.current.getHistoryInfo();
    setHistoryInfo({
      canUndo: info.canUndo,
      canRedo: info.canRedo,
      historySize: info.total,
    });
  }, []);

  // コマンド実行
  const executeCommand = useCallback((command: Command) => {
    const newTemplate = commandManagerRef.current.execute(command, template);
    setTemplate(newTemplate);
    updateHistoryInfo();
  }, [template, updateHistoryInfo]);

  // Undo
  const undo = useCallback(() => {
    const newTemplate = commandManagerRef.current.undo(template);
    setTemplate(newTemplate);
    updateHistoryInfo();
  }, [template, updateHistoryInfo]);

  // Redo
  const redo = useCallback(() => {
    const newTemplate = commandManagerRef.current.redo(template);
    setTemplate(newTemplate);
    updateHistoryInfo();
  }, [template, updateHistoryInfo]);

  // 便利なヘルパー関数たち
  const addElement = useCallback((element: TemplateElement) => {
    const command = commandFactory.addElement(element);
    executeCommand(command);
  }, [executeCommand]);

  const updateElement = useCallback((
    elementId: string, 
    oldData: Partial<TemplateElement>, 
    newData: Partial<TemplateElement>
  ) => {
    const command = commandFactory.updateElement(elementId, oldData, newData);
    executeCommand(command);
  }, [executeCommand]);

  const deleteElement = useCallback((elementId: string) => {
    const element = template.elements.find(el => el.id === elementId);
    if (!element) {
      console.warn('削除対象の要素が見つかりません:', elementId);
      return;
    }
    const command = commandFactory.deleteElement(elementId, element);
    executeCommand(command);
  }, [template.elements, executeCommand]);

  const addBackgroundFrame = useCallback((frame: BackgroundFrame) => {
    const command = commandFactory.addBackgroundFrame(frame);
    executeCommand(command);
  }, [executeCommand]);

  const updateBackgroundFrame = useCallback((
    frameId: string, 
    oldData: Partial<BackgroundFrame>, 
    newData: Partial<BackgroundFrame>
  ) => {
    const command = commandFactory.updateBackgroundFrame(frameId, oldData, newData);
    executeCommand(command);
  }, [executeCommand]);

  const deleteBackgroundFrame = useCallback((frameId: string) => {
    const frame = template.backgroundFrames?.find(f => f.id === frameId);
    if (!frame) {
      console.warn('削除対象の背景フレームが見つかりません:', frameId);
      return;
    }
    const command = commandFactory.deleteBackgroundFrame(frameId, frame);
    executeCommand(command);
  }, [template.backgroundFrames, executeCommand]);

  // テンプレートの直接更新（履歴に残さない）
  const setTemplateDirectly = useCallback((newTemplate: VisualTemplate) => {
    setTemplate(newTemplate);
    // 履歴情報は変更しない
  }, []);

  // 履歴クリア
  const clearHistory = useCallback(() => {
    commandManagerRef.current.clear();
    updateHistoryInfo();
  }, [updateHistoryInfo]);

  // デバッグ用
  const debugHistory = useCallback(() => {
    commandManagerRef.current.debugPrintHistory();
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.contentEditable === 'true') {
        return;
      }

      // Ctrl+Z (Windows/Linux) または Cmd+Z (Mac) でUndo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y (Windows/Linux) または Cmd+Shift+Z (Mac) でRedo
      else if ((e.ctrlKey && e.key === 'y') || 
               ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    template,
    executeCommand,
    undo,
    redo,
    canUndo: historyInfo.canUndo,
    canRedo: historyInfo.canRedo,
    historySize: historyInfo.historySize,
    addElement,
    updateElement,
    deleteElement,
    addBackgroundFrame,
    updateBackgroundFrame,
    deleteBackgroundFrame,
    setTemplateDirectly,
    clearHistory,
    debugHistory,
  };
}