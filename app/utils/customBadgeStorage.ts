/**
 * カスタムバッジのLocalStorage管理ユーティリティ
 */

import type { 
  CustomBadge, 
  CustomBadgeStorage, 
  CustomBadgeInput 
} from '@/app/types/customBadge';
import { 
  CUSTOM_BADGE_STORAGE_KEY, 
  CUSTOM_BADGE_STORAGE_VERSION,
  CUSTOM_BADGE_LIMITS,
  DEFAULT_CUSTOM_BADGE_VALUES
} from '@/app/types/customBadge';

export class CustomBadgeStorageManager {
  /**
   * LocalStorageからカスタムバッジデータを読み込み
   */
  static load(): CustomBadgeStorage {
    try {
      if (typeof window === 'undefined') {
        return { badges: [], version: CUSTOM_BADGE_STORAGE_VERSION };
      }

      const stored = localStorage.getItem(CUSTOM_BADGE_STORAGE_KEY);
      if (!stored) {
        return { badges: [], version: CUSTOM_BADGE_STORAGE_VERSION };
      }

      const data: CustomBadgeStorage = JSON.parse(stored);
      
      // バージョンチェック（将来のマイグレーション用）
      if (data.version !== CUSTOM_BADGE_STORAGE_VERSION) {
        console.warn('カスタムバッジデータのバージョンが異なります。データをリセットします。');
        return { badges: [], version: CUSTOM_BADGE_STORAGE_VERSION };
      }

      return data;
    } catch (error) {
      console.error('カスタムバッジデータの読み込みに失敗:', error);
      return { badges: [], version: CUSTOM_BADGE_STORAGE_VERSION };
    }
  }

  /**
   * LocalStorageにカスタムバッジデータを保存
   */
  static save(data: CustomBadgeStorage): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(CUSTOM_BADGE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('カスタムバッジデータの保存に失敗:', error);
      throw new Error('カスタムバッジデータの保存に失敗しました');
    }
  }

  /**
   * 全てのカスタムバッジを取得
   */
  static getAllBadges(): CustomBadge[] {
    return this.load().badges;
  }

  /**
   * IDでカスタムバッジを取得
   */
  static getBadgeById(id: string): CustomBadge | null {
    const badges = this.getAllBadges();
    return badges.find(badge => badge.id === id) || null;
  }

  /**
   * 新しいカスタムバッジを作成
   */
  static createBadge(input: CustomBadgeInput): CustomBadge {
    const storage = this.load();
    
    // 最大数チェック
    if (storage.badges.length >= CUSTOM_BADGE_LIMITS.MAX_COUNT) {
      throw new Error(`カスタムバッジは最大${CUSTOM_BADGE_LIMITS.MAX_COUNT}個まで作成できます`);
    }

    // 名前重複チェック
    if (storage.badges.some(badge => badge.name === input.name)) {
      throw new Error('同じ名前のバッジが既に存在します');
    }

    const now = Date.now();
    const newBadge: CustomBadge = {
      id: `badge-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      type: input.type,
      
      // 形状・サイズ設定
      shape: input.shape || DEFAULT_CUSTOM_BADGE_VALUES.shape,
      width: input.width || DEFAULT_CUSTOM_BADGE_VALUES.width,
      height: input.height || DEFAULT_CUSTOM_BADGE_VALUES.height,
      borderRadius: input.borderRadius || DEFAULT_CUSTOM_BADGE_VALUES.borderRadius,
      
      // テキスト設定
      text: input.text || DEFAULT_CUSTOM_BADGE_VALUES.text,
      backgroundColor: input.backgroundColor || DEFAULT_CUSTOM_BADGE_VALUES.backgroundColor,
      textColor: input.textColor || DEFAULT_CUSTOM_BADGE_VALUES.textColor,
      fontSize: input.fontSize || DEFAULT_CUSTOM_BADGE_VALUES.fontSize,
      
      // 枠線設定
      borderEnabled: input.borderEnabled ?? DEFAULT_CUSTOM_BADGE_VALUES.borderEnabled,
      borderColor: input.borderColor || DEFAULT_CUSTOM_BADGE_VALUES.borderColor,
      borderWidth: input.borderWidth || DEFAULT_CUSTOM_BADGE_VALUES.borderWidth,
      
      // バッジ配置設定
      badgeAlign: input.badgeAlign || DEFAULT_CUSTOM_BADGE_VALUES.badgeAlign,
      badgeVerticalAlign: input.badgeVerticalAlign || DEFAULT_CUSTOM_BADGE_VALUES.badgeVerticalAlign,
      
      imageSettings: input.imageSettings,
      createdAt: now,
      updatedAt: now,
    };

    storage.badges.push(newBadge);
    this.save(storage);

    return newBadge;
  }

  /**
   * カスタムバッジを更新
   */
  static updateBadge(id: string, input: CustomBadgeInput): CustomBadge {
    const storage = this.load();
    const index = storage.badges.findIndex(badge => badge.id === id);
    
    if (index === -1) {
      throw new Error('指定されたバッジが見つかりません');
    }

    // 名前重複チェック（自分以外）
    if (storage.badges.some(badge => badge.id !== id && badge.name === input.name)) {
      throw new Error('同じ名前のバッジが既に存在します');
    }

    const updatedBadge: CustomBadge = {
      ...storage.badges[index],
      name: input.name,
      type: input.type,
      
      // 形状・サイズ設定
      shape: input.shape || DEFAULT_CUSTOM_BADGE_VALUES.shape,
      width: input.width || DEFAULT_CUSTOM_BADGE_VALUES.width,
      height: input.height || DEFAULT_CUSTOM_BADGE_VALUES.height,
      borderRadius: input.borderRadius || DEFAULT_CUSTOM_BADGE_VALUES.borderRadius,
      
      // テキスト設定
      text: input.text || DEFAULT_CUSTOM_BADGE_VALUES.text,
      backgroundColor: input.backgroundColor || DEFAULT_CUSTOM_BADGE_VALUES.backgroundColor,
      textColor: input.textColor || DEFAULT_CUSTOM_BADGE_VALUES.textColor,
      fontSize: input.fontSize || DEFAULT_CUSTOM_BADGE_VALUES.fontSize,
      
      // 枠線設定
      borderEnabled: input.borderEnabled ?? DEFAULT_CUSTOM_BADGE_VALUES.borderEnabled,
      borderColor: input.borderColor || DEFAULT_CUSTOM_BADGE_VALUES.borderColor,
      borderWidth: input.borderWidth || DEFAULT_CUSTOM_BADGE_VALUES.borderWidth,
      
      // バッジ配置設定
      badgeAlign: input.badgeAlign || DEFAULT_CUSTOM_BADGE_VALUES.badgeAlign,
      badgeVerticalAlign: input.badgeVerticalAlign || DEFAULT_CUSTOM_BADGE_VALUES.badgeVerticalAlign,
      
      imageSettings: input.imageSettings,
      updatedAt: Date.now(),
    };

    storage.badges[index] = updatedBadge;
    this.save(storage);

    return updatedBadge;
  }

  /**
   * カスタムバッジを削除
   */
  static deleteBadge(id: string): void {
    const storage = this.load();
    const filteredBadges = storage.badges.filter(badge => badge.id !== id);
    
    if (filteredBadges.length === storage.badges.length) {
      throw new Error('指定されたバッジが見つかりません');
    }

    storage.badges = filteredBadges;
    this.save(storage);
  }

  /**
   * 全てのカスタムバッジを削除（リセット）
   */
  static clearAll(): void {
    const storage: CustomBadgeStorage = {
      badges: [],
      version: CUSTOM_BADGE_STORAGE_VERSION,
    };
    this.save(storage);
  }

  /**
   * バッジ名のバリデーション
   */
  static validateBadgeName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return 'バッジ名を入力してください';
    }
    
    if (name.length > CUSTOM_BADGE_LIMITS.MAX_NAME_LENGTH) {
      return `バッジ名は${CUSTOM_BADGE_LIMITS.MAX_NAME_LENGTH}文字以下で入力してください`;
    }

    return null;
  }

  /**
   * バッジテキストのバリデーション
   */
  static validateBadgeText(text: string): string | null {
    if (text && text.length > CUSTOM_BADGE_LIMITS.MAX_TEXT_LENGTH) {
      return `テキストは${CUSTOM_BADGE_LIMITS.MAX_TEXT_LENGTH}文字以下で入力してください`;
    }

    return null;
  }
}