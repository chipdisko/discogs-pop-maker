import type { Command } from './types';
import type { VisualTemplate } from '../types';

export interface CommandManagerOptions {
  maxHistorySize?: number;
  enableMerging?: boolean;
  mergeTimeWindow?: number; // マージ可能な時間窓（ms）
}

export class CommandManager {
  private history: Command[] = [];
  private currentIndex: number = -1; // -1は「履歴なし」状態
  private maxHistorySize: number;
  private enableMerging: boolean;
  private mergeTimeWindow: number;

  constructor(options: CommandManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.enableMerging = options.enableMerging !== false; // デフォルトtrue
    this.mergeTimeWindow = options.mergeTimeWindow || 1000; // デフォルト1秒
    console.log('🔧 CommandManager初期化:', options);
  }

  // コマンドを実行して履歴に追加
  execute(command: Command, template: VisualTemplate): VisualTemplate {
    try {
      // マージ処理
      if (this.enableMerging && this.canMergeWithLastCommand(command)) {
        const lastCommand = this.history[this.currentIndex];
        if (lastCommand && lastCommand.canMerge && lastCommand.merge) {
          const mergedCommand = lastCommand.merge(command);
          this.history[this.currentIndex] = mergedCommand;
          console.log('🔀 コマンドをマージ:', mergedCommand.description);
          return mergedCommand.execute(template);
        }
      }

      // 新しいコマンドとして追加
      const newTemplate = command.execute(template);

      // 現在位置より後ろの履歴を削除（新しい分岐を作成）
      this.history = this.history.slice(0, this.currentIndex + 1);
      
      // 新しいコマンドを追加
      this.history.push(command);
      this.currentIndex++;

      // 履歴サイズの制限
      if (this.history.length > this.maxHistorySize) {
        const removeCount = this.history.length - this.maxHistorySize;
        this.history = this.history.slice(removeCount);
        this.currentIndex -= removeCount;
      }

      console.log('✅ コマンド実行:', command.description, `(履歴: ${this.history.length})`);
      return newTemplate;

    } catch (error) {
      console.error('❌ コマンド実行エラー:', error);
      return template; // エラー時は元のテンプレートを返す
    }
  }

  // Undo操作
  undo(template: VisualTemplate): VisualTemplate {
    if (!this.canUndo()) {
      console.warn('⚠️ Undo不可: 履歴なし');
      return template;
    }

    try {
      const command = this.history[this.currentIndex];
      const newTemplate = command.undo(template);
      this.currentIndex--;
      
      console.log('🔙 Undo実行:', command.description, `(位置: ${this.currentIndex + 1})`);
      return newTemplate;

    } catch (error) {
      console.error('❌ Undoエラー:', error);
      return template;
    }
  }

  // Redo操作
  redo(template: VisualTemplate): VisualTemplate {
    if (!this.canRedo()) {
      console.warn('⚠️ Redo不可: 先の履歴なし');
      return template;
    }

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      const newTemplate = command.execute(template);
      
      console.log('🔜 Redo実行:', command.description, `(位置: ${this.currentIndex + 1})`);
      return newTemplate;

    } catch (error) {
      console.error('❌ Redoエラー:', error);
      this.currentIndex--; // エラー時は位置を戻す
      return template;
    }
  }

  // Undo可能かチェック
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  // Redo可能かチェック
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  // 履歴をクリア
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('🗑️ 履歴クリア');
  }

  // 履歴情報を取得
  getHistoryInfo() {
    return {
      total: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      commands: this.history.map((cmd, index) => ({
        description: cmd.description,
        timestamp: cmd.timestamp,
        isCurrent: index === this.currentIndex,
        type: cmd.type,
      })),
    };
  }

  // 最新のコマンドとマージ可能かチェック
  private canMergeWithLastCommand(command: Command): boolean {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return false;
    }

    const lastCommand = this.history[this.currentIndex];
    if (!lastCommand.canMerge) {
      return false;
    }

    // 時間窓チェック
    const timeDiff = command.timestamp - lastCommand.timestamp;
    if (timeDiff > this.mergeTimeWindow) {
      return false;
    }

    return lastCommand.canMerge(command);
  }

  // デバッグ用: 履歴を表示
  debugPrintHistory(): void {
    console.log('📝 コマンド履歴:');
    this.history.forEach((cmd, index) => {
      const isCurrent = index === this.currentIndex;
      const marker = isCurrent ? '👉' : '  ';
      console.log(`${marker} ${index}: ${cmd.description} (${cmd.type})`);
    });
    console.log(`現在位置: ${this.currentIndex}, 総数: ${this.history.length}`);
  }
}