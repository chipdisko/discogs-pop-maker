// シンプルなUUID生成関数
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
import type { 
  Command, 
  AddElementCommand, 
  UpdateElementCommand, 
  DeleteElementCommand,
  AddBackgroundFrameCommand,
  UpdateBackgroundFrameCommand,
  DeleteBackgroundFrameCommand,
  CompositeCommand,
  CommandFactory
} from './types';
import type { VisualTemplate, TemplateElement, BackgroundFrame } from '../types';

// ユーティリティ関数
function deepMerge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

// 要素追加コマンド実装
export class AddElementCommandImpl implements AddElementCommand {
  readonly type = 'ADD_ELEMENT' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(public element: TemplateElement) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `要素追加: ${element.type} (${element.dataBinding})`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: [...template.elements, this.element],
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: template.elements.filter(el => el.id !== this.element.id),
    };
  }
}

// 要素更新コマンド実装
export class UpdateElementCommandImpl implements UpdateElementCommand {
  readonly type = 'UPDATE_ELEMENT' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(
    public elementId: string,
    public oldData: Partial<TemplateElement>,
    public newData: Partial<TemplateElement>
  ) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `要素更新: ${elementId}`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: template.elements.map(el => 
        el.id === this.elementId ? deepMerge(el, this.newData) : el
      ),
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: template.elements.map(el => 
        el.id === this.elementId ? deepMerge(el, this.oldData) : el
      ),
    };
  }

  // 位置移動などの連続操作をマージ可能
  canMerge(other: Command): boolean {
    return other.type === 'UPDATE_ELEMENT' && 
           (other as UpdateElementCommand).elementId === this.elementId &&
           (other.timestamp - this.timestamp) < 1000; // 1秒以内
  }

  merge(other: Command): UpdateElementCommand {
    if (!this.canMerge(other)) {
      throw new Error('Cannot merge commands');
    }
    const otherCmd = other as UpdateElementCommand;
    return new UpdateElementCommandImpl(
      this.elementId,
      this.oldData, // 最初の古いデータを保持
      otherCmd.newData // 最新の新しいデータを使用
    );
  }
}

// 要素削除コマンド実装
export class DeleteElementCommandImpl implements DeleteElementCommand {
  readonly type = 'DELETE_ELEMENT' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(public elementId: string, public element: TemplateElement) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `要素削除: ${element.type} (${element.dataBinding})`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: template.elements.filter(el => el.id !== this.elementId),
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      elements: [...template.elements, this.element],
    };
  }
}

// 背景フレーム追加コマンド実装
export class AddBackgroundFrameCommandImpl implements AddBackgroundFrameCommand {
  readonly type = 'ADD_BACKGROUND_FRAME' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(public frame: BackgroundFrame) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `背景フレーム追加: ${frame.id}`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: [...(template.backgroundFrames || []), this.frame],
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: (template.backgroundFrames || []).filter(f => f.id !== this.frame.id),
    };
  }
}

// 背景フレーム更新コマンド実装
export class UpdateBackgroundFrameCommandImpl implements UpdateBackgroundFrameCommand {
  readonly type = 'UPDATE_BACKGROUND_FRAME' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(
    public frameId: string,
    public oldData: Partial<BackgroundFrame>,
    public newData: Partial<BackgroundFrame>
  ) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `背景フレーム更新: ${frameId}`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: (template.backgroundFrames || []).map(f => 
        f.id === this.frameId ? deepMerge(f, this.newData) : f
      ),
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: (template.backgroundFrames || []).map(f => 
        f.id === this.frameId ? deepMerge(f, this.oldData) : f
      ),
    };
  }

  canMerge(other: Command): boolean {
    return other.type === 'UPDATE_BACKGROUND_FRAME' && 
           (other as UpdateBackgroundFrameCommand).frameId === this.frameId &&
           (other.timestamp - this.timestamp) < 1000;
  }

  merge(other: Command): UpdateBackgroundFrameCommand {
    if (!this.canMerge(other)) {
      throw new Error('Cannot merge commands');
    }
    const otherCmd = other as UpdateBackgroundFrameCommand;
    return new UpdateBackgroundFrameCommandImpl(
      this.frameId,
      this.oldData,
      otherCmd.newData
    );
  }
}

// 背景フレーム削除コマンド実装
export class DeleteBackgroundFrameCommandImpl implements DeleteBackgroundFrameCommand {
  readonly type = 'DELETE_BACKGROUND_FRAME' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(public frameId: string, public frame: BackgroundFrame) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `背景フレーム削除: ${frameId}`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: (template.backgroundFrames || []).filter(f => f.id !== this.frameId),
    };
  }

  undo(template: VisualTemplate): VisualTemplate {
    return {
      ...template,
      backgroundFrames: [...(template.backgroundFrames || []), this.frame],
    };
  }
}

// 複合コマンド実装
export class CompositeCommandImpl implements CompositeCommand {
  readonly type = 'COMPOSITE' as const;
  readonly id: string;
  readonly timestamp: number;
  readonly description: string;

  constructor(public commands: Command[]) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.description = `複合操作 (${commands.length}個の操作)`;
  }

  execute(template: VisualTemplate): VisualTemplate {
    return this.commands.reduce((currentTemplate, command) => {
      return command.execute(currentTemplate);
    }, template);
  }

  undo(template: VisualTemplate): VisualTemplate {
    // 逆順でundoを実行
    return [...this.commands].reverse().reduce((currentTemplate, command) => {
      return command.undo(currentTemplate);
    }, template);
  }
}

// コマンドファクトリー実装
export class CommandFactoryImpl implements CommandFactory {
  addElement(element: TemplateElement): AddElementCommand {
    return new AddElementCommandImpl(element);
  }

  updateElement(elementId: string, oldData: Partial<TemplateElement>, newData: Partial<TemplateElement>): UpdateElementCommand {
    return new UpdateElementCommandImpl(elementId, oldData, newData);
  }

  deleteElement(elementId: string, element: TemplateElement): DeleteElementCommand {
    return new DeleteElementCommandImpl(elementId, element);
  }

  addBackgroundFrame(frame: BackgroundFrame): AddBackgroundFrameCommand {
    return new AddBackgroundFrameCommandImpl(frame);
  }

  updateBackgroundFrame(frameId: string, oldData: Partial<BackgroundFrame>, newData: Partial<BackgroundFrame>): UpdateBackgroundFrameCommand {
    return new UpdateBackgroundFrameCommandImpl(frameId, oldData, newData);
  }

  deleteBackgroundFrame(frameId: string, frame: BackgroundFrame): DeleteBackgroundFrameCommand {
    return new DeleteBackgroundFrameCommandImpl(frameId, frame);
  }

  composite(commands: Command[]): CompositeCommand {
    return new CompositeCommandImpl(commands);
  }
}

// デフォルトのファクトリーインスタンス
export const commandFactory = new CommandFactoryImpl();