import type { VisualTemplate, TemplateElement, BackgroundFrame } from '../types';

// コマンドの基底インターフェース
export interface Command {
  id: string;
  type: string; // コマンドタイプ
  timestamp: number;
  execute(template: VisualTemplate): VisualTemplate;
  undo(template: VisualTemplate): VisualTemplate;
  canMerge?(other: Command): boolean; // 連続操作をマージ可能か
  merge?(other: Command): Command; // 他のコマンドとマージ
  description: string; // デバッグ用の説明
}

// 要素追加コマンド
export interface AddElementCommand extends Command {
  type: 'ADD_ELEMENT';
  element: TemplateElement;
}

// 要素更新コマンド
export interface UpdateElementCommand extends Command {
  type: 'UPDATE_ELEMENT';
  elementId: string;
  oldData: Partial<TemplateElement>;
  newData: Partial<TemplateElement>;
}

// 要素削除コマンド
export interface DeleteElementCommand extends Command {
  type: 'DELETE_ELEMENT';
  elementId: string;
  element: TemplateElement; // 復元用の完全なデータ
}

// 背景フレーム追加コマンド
export interface AddBackgroundFrameCommand extends Command {
  type: 'ADD_BACKGROUND_FRAME';
  frame: BackgroundFrame;
}

// 背景フレーム更新コマンド
export interface UpdateBackgroundFrameCommand extends Command {
  type: 'UPDATE_BACKGROUND_FRAME';
  frameId: string;
  oldData: Partial<BackgroundFrame>;
  newData: Partial<BackgroundFrame>;
}

// 背景フレーム削除コマンド
export interface DeleteBackgroundFrameCommand extends Command {
  type: 'DELETE_BACKGROUND_FRAME';
  frameId: string;
  frame: BackgroundFrame; // 復元用の完全なデータ
}

// 複合コマンド（複数の操作をまとめる）
export interface CompositeCommand extends Command {
  type: 'COMPOSITE';
  commands: Command[];
}

// すべてのコマンドタイプのユニオン
export type AnyCommand = 
  | AddElementCommand 
  | UpdateElementCommand 
  | DeleteElementCommand
  | AddBackgroundFrameCommand
  | UpdateBackgroundFrameCommand
  | DeleteBackgroundFrameCommand
  | CompositeCommand;

// コマンドファクトリー関数の型
export interface CommandFactory {
  addElement(element: TemplateElement): AddElementCommand;
  updateElement(elementId: string, oldData: Partial<TemplateElement>, newData: Partial<TemplateElement>): UpdateElementCommand;
  deleteElement(elementId: string, element: TemplateElement): DeleteElementCommand;
  addBackgroundFrame(frame: BackgroundFrame): AddBackgroundFrameCommand;
  updateBackgroundFrame(frameId: string, oldData: Partial<BackgroundFrame>, newData: Partial<BackgroundFrame>): UpdateBackgroundFrameCommand;
  deleteBackgroundFrame(frameId: string, frame: BackgroundFrame): DeleteBackgroundFrameCommand;
  composite(commands: Command[]): CompositeCommand;
}