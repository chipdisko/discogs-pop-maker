import type { VisualTemplate } from '../types';

const STORAGE_KEYS = {
  TEMPLATES: 'visual-editor-templates',
  CURRENT_TEMPLATE: 'visual-editor-current-template',
  AUTO_SAVE: 'visual-editor-auto-save',
} as const;

export interface StoredTemplate extends VisualTemplate {
  createdAt: string;
  updatedAt: string;
}

// テンプレートの保存
export function saveTemplate(template: VisualTemplate): void {
  try {
    const templates = getSavedTemplates();
    const now = new Date().toISOString();
    
    const storedTemplate: StoredTemplate = {
      ...template,
      createdAt: templates.find(t => t.id === template.id)?.createdAt || now,
      updatedAt: now,
    };

    const updatedTemplates = templates.filter(t => t.id !== template.id);
    updatedTemplates.push(storedTemplate);

    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Failed to save template:', error);
  }
}

// 保存されたテンプレート一覧の取得
export function getSavedTemplates(): StoredTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return [];
  }
}

// 特定のテンプレートの取得
export function getTemplate(id: string): StoredTemplate | null {
  try {
    const templates = getSavedTemplates();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Failed to load template:', error);
    return null;
  }
}

// テンプレートの削除
export function deleteTemplate(id: string): void {
  try {
    const templates = getSavedTemplates();
    const updatedTemplates = templates.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Failed to delete template:', error);
  }
}

// 現在編集中のテンプレートの自動保存
export function autoSaveCurrentTemplate(template: VisualTemplate): void {
  try {
    const autoSaveData = {
      template,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(autoSaveData));
  } catch (error) {
    console.error('Failed to auto-save template:', error);
  }
}

// 自動保存されたテンプレートの取得
export function getAutoSavedTemplate(): VisualTemplate | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
    if (!stored) return null;

    const autoSaveData = JSON.parse(stored);
    const saveTime = new Date(autoSaveData.timestamp);
    const now = new Date();
    
    // 24時間以内の自動保存のみ有効
    const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE);
      return null;
    }

    return autoSaveData.template;
  } catch (error) {
    console.error('Failed to load auto-saved template:', error);
    return null;
  }
}

// 自動保存の削除
export function clearAutoSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE);
  } catch (error) {
    console.error('Failed to clear auto-save:', error);
  }
}

// テンプレートのエクスポート（JSON形式）
export function exportTemplate(template: VisualTemplate): string {
  return JSON.stringify(template, null, 2);
}

// テンプレートのインポート（JSON形式）
export function importTemplate(jsonString: string): VisualTemplate | null {
  try {
    const template = JSON.parse(jsonString);
    
    // 基本的なバリデーション
    if (!template.id || !template.name || !template.elements || !template.settings) {
      throw new Error('Invalid template format');
    }

    // IDを新しく生成して重複を避ける
    template.id = `imported-${Date.now()}`;
    template.name += ' (インポート)';

    return template;
  } catch (error) {
    console.error('Failed to import template:', error);
    return null;
  }
}

// ローカルストレージに保存されたテンプレートが存在するかチェック
export function hasSavedTemplates(): boolean {
  try {
    const templates = getSavedTemplates();
    return templates.length > 0;
  } catch (error) {
    console.error('Failed to check saved templates:', error);
    return false;
  }
}

// テンプレートをJSONファイルとしてダウンロード
export function downloadTemplateAsJSON(template: VisualTemplate): void {
  try {
    const jsonString = exportTemplate(template);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'template'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download template:', error);
  }
}

// ファイルからテンプレートをインポート
export function importTemplateFromFile(): Promise<VisualTemplate | null> {
  return new Promise((resolve) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        try {
          const text = await file.text();
          const template = importTemplate(text);
          resolve(template);
        } catch (error) {
          console.error('Failed to read file:', error);
          resolve(null);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Failed to create file input:', error);
      resolve(null);
    }
  });
}

// ストレージ使用量の取得
export function getStorageUsage(): { used: number; available: number } {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (key.startsWith('visual-editor-')) {
        used += localStorage[key].length;
      }
    }
    
    // おおよその利用可能容量（ブラウザによって異なる）
    const available = 5 * 1024 * 1024; // 5MB
    
    return { used, available };
  } catch {
    return { used: 0, available: 0 };
  }
}