/**
 * バッジのLocalStorage管理ユーティリティ
 */

import type { 
  Badge, 
  BadgeStorage, 
  BadgeInput 
} from '@/app/types/badge';
import { 
  BADGE_STORAGE_KEY, 
  BADGE_STORAGE_VERSION,
  BADGE_LIMITS,
  DEFAULT_BADGE_VALUES
} from '@/app/types/badge';

export class BadgeStorageManager {
  /**
   * LocalStorageからバッジデータを読み込み
   */
  static load(): BadgeStorage {
    try {
      if (typeof window === 'undefined') {
        return { badges: [], version: BADGE_STORAGE_VERSION };
      }

      const stored = localStorage.getItem(BADGE_STORAGE_KEY);
      if (!stored) {
        return { badges: [], version: BADGE_STORAGE_VERSION };
      }

      const data: BadgeStorage = JSON.parse(stored);
      
      // バージョンチェック（将来のマイグレーション用）
      if (data.version !== BADGE_STORAGE_VERSION) {
        console.warn('バッジデータのバージョンが異なります。データをリセットします。');
        return { badges: [], version: BADGE_STORAGE_VERSION };
      }

      return data;
    } catch (error) {
      console.error('バッジデータの読み込みに失敗:', error);
      return { badges: [], version: BADGE_STORAGE_VERSION };
    }
  }

  /**
   * LocalStorageにバッジデータを保存
   */
  static save(data: BadgeStorage): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('バッジデータの保存に失敗:', error);
      throw new Error('バッジデータの保存に失敗しました');
    }
  }

  /**
   * 全てのバッジを取得
   */
  static getAllBadges(): Badge[] {
    return this.load().badges;
  }

  /**
   * IDでバッジを取得
   */
  static getBadgeById(id: string): Badge | null {
    const badges = this.getAllBadges();
    return badges.find(badge => badge.id === id) || null;
  }

  /**
   * 新しいバッジを作成
   */
  static createBadge(input: BadgeInput): Badge {
    const storage = this.load();
    
    // 最大数チェック
    if (storage.badges.length >= BADGE_LIMITS.MAX_COUNT) {
      throw new Error(`バッジは最大${BADGE_LIMITS.MAX_COUNT}個まで作成できます`);
    }

    // 名前重複チェック
    if (storage.badges.some(badge => badge.name === input.name)) {
      throw new Error('同じ名前のバッジが既に存在します');
    }

    const now = Date.now();
    const newBadge: Badge = {
      id: `badge-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      type: input.type,
      
      // 形状・サイズ設定
      shape: input.shape || DEFAULT_BADGE_VALUES.shape,
      width: input.width || DEFAULT_BADGE_VALUES.width,
      height: input.height || DEFAULT_BADGE_VALUES.height,
      borderRadius: input.borderRadius || DEFAULT_BADGE_VALUES.borderRadius,
      
      // テキスト設定
      text: input.text || DEFAULT_BADGE_VALUES.text,
      backgroundColor: input.backgroundColor || DEFAULT_BADGE_VALUES.backgroundColor,
      textColor: input.textColor || DEFAULT_BADGE_VALUES.textColor,
      fontSize: input.fontSize || DEFAULT_BADGE_VALUES.fontSize,
      
      // フォント設定
      fontFamily: input.fontFamily || DEFAULT_BADGE_VALUES.fontFamily,
      fontWeight: input.fontWeight || DEFAULT_BADGE_VALUES.fontWeight,
      fontStyle: input.fontStyle || DEFAULT_BADGE_VALUES.fontStyle,
      letterSpacing: input.letterSpacing ?? DEFAULT_BADGE_VALUES.letterSpacing,
      scaleX: input.scaleX ?? DEFAULT_BADGE_VALUES.scaleX,
      
      // 枠線設定
      borderEnabled: input.borderEnabled ?? DEFAULT_BADGE_VALUES.borderEnabled,
      borderColor: input.borderColor || DEFAULT_BADGE_VALUES.borderColor,
      borderWidth: input.borderWidth || DEFAULT_BADGE_VALUES.borderWidth,
      
      // バッジ配置設定
      badgeAlign: input.badgeAlign || DEFAULT_BADGE_VALUES.badgeAlign,
      badgeVerticalAlign: input.badgeVerticalAlign || DEFAULT_BADGE_VALUES.badgeVerticalAlign,
      
      imageSettings: input.imageSettings,
      createdAt: now,
      updatedAt: now,
    };

    storage.badges.push(newBadge);
    this.save(storage);

    return newBadge;
  }

  /**
   * バッジを更新
   */
  static updateBadge(id: string, input: BadgeInput): Badge {
    const storage = this.load();
    const index = storage.badges.findIndex(badge => badge.id === id);
    
    if (index === -1) {
      throw new Error('指定されたバッジが見つかりません');
    }

    // 名前重複チェック（自分以外）
    if (storage.badges.some(badge => badge.id !== id && badge.name === input.name)) {
      throw new Error('同じ名前のバッジが既に存在します');
    }

    const updatedBadge: Badge = {
      ...storage.badges[index],
      name: input.name,
      type: input.type,
      
      // 形状・サイズ設定
      shape: input.shape || DEFAULT_BADGE_VALUES.shape,
      width: input.width || DEFAULT_BADGE_VALUES.width,
      height: input.height || DEFAULT_BADGE_VALUES.height,
      borderRadius: input.borderRadius || DEFAULT_BADGE_VALUES.borderRadius,
      
      // テキスト設定
      text: input.text || DEFAULT_BADGE_VALUES.text,
      backgroundColor: input.backgroundColor || DEFAULT_BADGE_VALUES.backgroundColor,
      textColor: input.textColor || DEFAULT_BADGE_VALUES.textColor,
      fontSize: input.fontSize || DEFAULT_BADGE_VALUES.fontSize,
      
      // フォント設定
      fontFamily: input.fontFamily || DEFAULT_BADGE_VALUES.fontFamily,
      fontWeight: input.fontWeight || DEFAULT_BADGE_VALUES.fontWeight,
      fontStyle: input.fontStyle || DEFAULT_BADGE_VALUES.fontStyle,
      letterSpacing: input.letterSpacing ?? DEFAULT_BADGE_VALUES.letterSpacing,
      scaleX: input.scaleX ?? DEFAULT_BADGE_VALUES.scaleX,
      
      // 枠線設定
      borderEnabled: input.borderEnabled ?? DEFAULT_BADGE_VALUES.borderEnabled,
      borderColor: input.borderColor || DEFAULT_BADGE_VALUES.borderColor,
      borderWidth: input.borderWidth || DEFAULT_BADGE_VALUES.borderWidth,
      
      // バッジ配置設定
      badgeAlign: input.badgeAlign || DEFAULT_BADGE_VALUES.badgeAlign,
      badgeVerticalAlign: input.badgeVerticalAlign || DEFAULT_BADGE_VALUES.badgeVerticalAlign,
      
      imageSettings: input.imageSettings,
      updatedAt: Date.now(),
    };

    storage.badges[index] = updatedBadge;
    this.save(storage);

    return updatedBadge;
  }

  /**
   * バッジを削除
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
   * 全てのバッジを削除（リセット）
   */
  static clearAll(): void {
    const storage: BadgeStorage = {
      badges: [],
      version: BADGE_STORAGE_VERSION,
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
    
    if (name.length > BADGE_LIMITS.MAX_NAME_LENGTH) {
      return `バッジ名は${BADGE_LIMITS.MAX_NAME_LENGTH}文字以下で入力してください`;
    }

    return null;
  }

  /**
   * バッジテキストのバリデーション
   */
  static validateBadgeText(text: string): string | null {
    if (text && text.length > BADGE_LIMITS.MAX_TEXT_LENGTH) {
      return `テキストは${BADGE_LIMITS.MAX_TEXT_LENGTH}文字以下で入力してください`;
    }

    return null;
  }
}