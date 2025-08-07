"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Type } from "lucide-react";
import type { Badge, BadgeInput } from "@/app/types/badge";
import { BadgeStorageManager } from "@/app/utils/badgeStorage";
import { BADGE_LIMITS } from "@/app/types/badge";
import Image from "next/image";

interface BadgeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeManagerModal({
  isOpen,
  onClose,
}: BadgeManagerModalProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<BadgeInput>({
    name: "",
    type: "text",

    // 形状・サイズ設定
    shape: "circle",
    width: 20,
    height: 20,
    borderRadius: 4,

    // テキスト設定
    text: "バッジ",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    fontSize: 12,

    // フォント設定
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    scaleX: 1,

    // 枠線設定
    borderEnabled: true,
    borderColor: "#ffffff",
    borderWidth: 1,

    // バッジ配置設定
    badgeAlign: "center",
    badgeVerticalAlign: "middle",
  });

  // バッジ一覧を読み込み
  useEffect(() => {
    if (isOpen) {
      loadBadges();
    }
  }, [isOpen]);

  const loadBadges = () => {
    try {
      const loadedBadges = BadgeStorageManager.getAllBadges();
      setBadges(loadedBadges);
    } catch (error) {
      console.error("バッジの読み込みに失敗:", error);
      alert("バッジの読み込みに失敗しました");
    }
  };

  const handleCreateNew = () => {
    setIsEditMode(true);
    setEditingBadge(null);
    setFormData({
      name: "",
      type: "text",

      // 形状・サイズ設定
      shape: "circle",
      width: 20,
      height: 20,
      borderRadius: 4,

      // テキスト設定
      text: "バッジ",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      fontSize: 12,

      // フォント設定
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 0,
      scaleX: 1,

      // 枠線設定
      borderEnabled: true,
      borderColor: "#ffffff",
      borderWidth: 1,

      // バッジ配置設定
      badgeAlign: "center",
      badgeVerticalAlign: "middle",
    });
  };

  const handleEdit = (badge: Badge) => {
    setIsEditMode(true);
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      type: badge.type,

      // 形状・サイズ設定
      shape: badge.shape || "circle",
      width: badge.width || 20,
      height: badge.height || 20,
      borderRadius: badge.borderRadius || 4,

      // テキスト設定
      text: badge.text || "バッジ",
      backgroundColor: badge.backgroundColor || "#3b82f6",
      textColor: badge.textColor || "#ffffff",
      fontSize: badge.fontSize || 12,

      // フォント設定
      fontFamily: badge.fontFamily || "Arial, sans-serif",
      fontWeight: badge.fontWeight || "bold",
      fontStyle: badge.fontStyle || "normal",
      letterSpacing: badge.letterSpacing ?? 0,
      scaleX: badge.scaleX ?? 1,

      // 枠線設定
      borderEnabled: badge.borderEnabled ?? true,
      borderColor: badge.borderColor || "#ffffff",
      borderWidth: badge.borderWidth || 1,

      // バッジ配置設定
      badgeAlign: badge.badgeAlign || "center",
      badgeVerticalAlign: badge.badgeVerticalAlign || "middle",

      imageSettings: badge.imageSettings,
    });
  };

  const handleSave = () => {
    try {
      // バリデーション
      const nameError = BadgeStorageManager.validateBadgeName(formData.name);
      if (nameError) {
        alert(nameError);
        return;
      }

      const textError = BadgeStorageManager.validateBadgeText(
        formData.text || ""
      );
      if (textError) {
        alert(textError);
        return;
      }

      if (editingBadge) {
        // 更新
        BadgeStorageManager.updateBadge(editingBadge.id, formData);
      } else {
        // 新規作成
        BadgeStorageManager.createBadge(formData);
      }

      loadBadges();
      setIsEditMode(false);
      setEditingBadge(null);
    } catch (error) {
      console.error("バッジの保存に失敗:", error);
      alert(
        error instanceof Error ? error.message : "バッジの保存に失敗しました"
      );
    }
  };

  const handleDelete = (badge: Badge) => {
    if (!confirm(`「${badge.name}」を削除しますか？`)) {
      return;
    }

    try {
      BadgeStorageManager.deleteBadge(badge.id);
      loadBadges();
    } catch (error) {
      console.error("バッジの削除に失敗:", error);
      alert("バッジの削除に失敗しました");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditingBadge(null);
  };

  const renderBadgePreview = (badge: Badge | BadgeInput) => {
    // mm to px 変換（VisualEditorと同じ仕様）
    const mmToPx = (mm: number) => mm * 3.7795275591;
    const previewWidth = mmToPx(badge.width || 20);
    const previewHeight = mmToPx(badge.height || 20);

    const previewStyle: React.CSSProperties = {
      width: previewWidth,
      height: previewHeight,
      backgroundColor: badge.backgroundColor || "#3b82f6",
      color: badge.textColor || "#ffffff",
      fontSize: Math.max(badge.fontSize || 12, 8), // px単位そのまま使用
      fontWeight: badge.fontWeight || "bold",
      fontStyle: badge.fontStyle || "normal",
      letterSpacing: `${badge.letterSpacing || 0}em`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      overflow: "hidden",
      fontFamily: badge.fontFamily || "Arial, sans-serif",
    };

    // 形状に応じたスタイル
    if (badge.shape === "circle") {
      previewStyle.borderRadius = "50%";
    } else if (badge.shape === "rectangle") {
      const borderRadius = mmToPx(badge.borderRadius || 0);
      previewStyle.borderRadius = `${borderRadius}px`;
    }

    // 枠線設定
    if (badge.borderEnabled) {
      const borderWidth = mmToPx(badge.borderWidth || 1);
      previewStyle.border = `${borderWidth}px solid ${
        badge.borderColor || "#ffffff"
      }`;
    }

    if (badge.type === "image" && badge.imageSettings?.src) {
      return (
        <div style={previewStyle}>
          <Image
            src={badge.imageSettings.src}
            alt='バッジプレビュー'
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      );
    }

    // テキストバッジ
    return (
      <div style={previewStyle}>
        <span
          style={{
            transform:
              badge.scaleX !== undefined && badge.scaleX !== 1
                ? `scaleX(${badge.scaleX})`
                : undefined,
          }}
        >
          {badge.text || "バッジ"}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            カスタムバッジ管理
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            最大{BADGE_LIMITS.MAX_COUNT}個まで作成できます ({badges.length}/
            {BADGE_LIMITS.MAX_COUNT})
          </p>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {!isEditMode ? (
            // バッジ一覧表示
            <div>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  作成済みバッジ
                </h3>
                <button
                  onClick={handleCreateNew}
                  disabled={badges.length >= BADGE_LIMITS.MAX_COUNT}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                >
                  <Plus className='w-4 h-4' />
                  新規作成
                </button>
              </div>

              {badges.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  <div className='text-4xl mb-4'>🏷️</div>
                  <p>カスタムバッジがありません</p>
                  <p className='text-sm'>
                    「新規作成」ボタンから最初のバッジを作成しましょう
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          {renderBadgePreview(badge)}
                          <div>
                            <div className='font-semibold text-gray-900 dark:text-white'>
                              {badge.name}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2'>
                              {badge.type === "image" ? (
                                <>
                                  <ImageIcon className='w-3 h-3' />
                                  画像バッジ
                                </>
                              ) : (
                                <>
                                  <Type className='w-3 h-3' />
                                  テキスト: {badge.text}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEdit(badge)}
                            className='p-1 text-gray-400 hover:text-blue-500 transition-colors'
                            title='編集'
                          >
                            <Edit2 className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(badge)}
                            className='p-1 text-gray-400 hover:text-red-500 transition-colors'
                            title='削除'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // バッジ編集フォーム
            <div>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {editingBadge ? "バッジを編集" : "新しいバッジを作成"}
                </h3>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* フォーム部分 */}
                <div className='space-y-4'>
                  {/* バッジ名 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      バッジ名
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      placeholder='例: おすすめ'
                      maxLength={BADGE_LIMITS.MAX_NAME_LENGTH}
                    />
                  </div>

                  {/* バッジタイプ */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      バッジタイプ
                    </label>
                    <div className='flex gap-4'>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='text'
                          checked={formData.type === "text"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value as "text" | "image",
                            }))
                          }
                          className='mr-2'
                        />
                        <Type className='w-4 h-4 mr-1' />
                        テキスト
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='image'
                          checked={formData.type === "image"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value as "text" | "image",
                            }))
                          }
                          className='mr-2'
                        />
                        <ImageIcon className='w-4 h-4 mr-1' />
                        画像
                      </label>
                    </div>
                  </div>

                  {/* 形状選択 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      形状
                    </label>
                    <div className='flex gap-4'>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='circle'
                          checked={formData.shape === "circle"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              shape: e.target.value as "circle" | "rectangle",
                            }))
                          }
                          className='mr-2'
                        />
                        ⭕ 円形
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='rectangle'
                          checked={formData.shape === "rectangle"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              shape: e.target.value as "circle" | "rectangle",
                            }))
                          }
                          className='mr-2'
                        />
                        ⬜ 四角形
                      </label>
                    </div>
                  </div>

                  {/* サイズ設定 */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        幅: {formData.width}mm
                      </label>
                      <input
                        type='range'
                        min={BADGE_LIMITS.MIN_SIZE}
                        max={BADGE_LIMITS.MAX_SIZE}
                        value={formData.width || 20}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            width: parseInt(e.target.value),
                          }))
                        }
                        className='w-full'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        高さ: {formData.height}mm
                      </label>
                      <input
                        type='range'
                        min={BADGE_LIMITS.MIN_SIZE}
                        max={BADGE_LIMITS.MAX_SIZE}
                        value={formData.height || 20}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            height: parseInt(e.target.value),
                          }))
                        }
                        className='w-full'
                      />
                    </div>
                  </div>

                  {/* 角丸設定（四角形の場合のみ） */}
                  {formData.shape === "rectangle" && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        角丸: {formData.borderRadius}mm
                      </label>
                      <input
                        type='range'
                        min={BADGE_LIMITS.MIN_BORDER_RADIUS}
                        max={BADGE_LIMITS.MAX_BORDER_RADIUS}
                        value={formData.borderRadius || 4}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            borderRadius: parseInt(e.target.value),
                          }))
                        }
                        className='w-full'
                      />
                    </div>
                  )}

                  {/* テキストバッジ設定 */}
                  {formData.type === "text" && (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                          表示テキスト
                        </label>
                        <input
                          type='text'
                          value={formData.text || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              text: e.target.value,
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                          placeholder='例: MUST'
                          maxLength={BADGE_LIMITS.MAX_TEXT_LENGTH}
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            背景色
                          </label>
                          <input
                            type='color'
                            value={formData.backgroundColor || "#3b82f6"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                backgroundColor: e.target.value,
                              }))
                            }
                            className='w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg'
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            文字色
                          </label>
                          <input
                            type='color'
                            value={formData.textColor || "#ffffff"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                textColor: e.target.value,
                              }))
                            }
                            className='w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                          フォントサイズ: {formData.fontSize}px
                        </label>
                        <input
                          type='range'
                          min={BADGE_LIMITS.MIN_FONT_SIZE}
                          max={BADGE_LIMITS.MAX_FONT_SIZE}
                          value={formData.fontSize || 12}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              fontSize: parseInt(e.target.value),
                            }))
                          }
                          className='w-full'
                        />
                      </div>

                      {/* フォント設定 */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                          フォント設定
                        </label>
                        <div className='space-y-3'>
                          {/* フォントファミリー */}
                          <div>
                            <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                              フォントファミリー
                            </label>
                            <select
                              value={formData.fontFamily || "Arial, sans-serif"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  fontFamily: e.target.value,
                                }))
                              }
                              className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm'
                            >
                              <option value='Arial, sans-serif'>Arial</option>
                              <option value='Impact, sans-serif'>Impact</option>
                              <option value='Georgia, serif'>Georgia</option>
                              <option value='Helvetica, sans-serif'>
                                Helvetica
                              </option>
                              <option value='Verdana, sans-serif'>
                                Verdana
                              </option>
                              <option value='"Times New Roman", serif'>
                                Times New Roman
                              </option>
                              <option value='"Courier New", monospace'>
                                Courier New
                              </option>
                            </select>
                          </div>

                          <div className='grid grid-cols-2 gap-3'>
                            {/* 太字・斜体 */}
                            <div>
                              <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                スタイル
                              </label>
                              <div className='flex gap-1'>
                                <button
                                  type='button'
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      fontWeight:
                                        prev.fontWeight === "bold"
                                          ? "normal"
                                          : "bold",
                                    }))
                                  }
                                  className={`px-2 py-1 text-xs border rounded font-bold ${
                                    (formData.fontWeight || "bold") === "bold"
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                  }`}
                                  title='太字'
                                >
                                  B
                                </button>
                                <button
                                  type='button'
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      fontStyle:
                                        prev.fontStyle === "italic"
                                          ? "normal"
                                          : "italic",
                                    }))
                                  }
                                  className={`px-2 py-1 text-xs border rounded italic ${
                                    (formData.fontStyle || "normal") ===
                                    "italic"
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                  }`}
                                  title='斜体'
                                >
                                  I
                                </button>
                              </div>
                            </div>

                            {/* 長体化 */}
                            <div>
                              <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                長体化:{" "}
                                {((formData.scaleX || 1) * 100).toFixed(0)}%
                              </label>
                              <input
                                type='range'
                                min={BADGE_LIMITS.MIN_SCALE_X * 100}
                                max={BADGE_LIMITS.MAX_SCALE_X * 100}
                                step='5'
                                value={(formData.scaleX || 1) * 100}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scaleX: parseInt(e.target.value) / 100,
                                  }))
                                }
                                className='w-full h-2'
                              />
                            </div>
                          </div>

                          {/* 文字間隔 */}
                          <div>
                            <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                              文字間隔:{" "}
                              {((formData.letterSpacing || 0) * 100).toFixed(0)}
                              %
                            </label>
                            <input
                              type='range'
                              min={BADGE_LIMITS.MIN_LETTER_SPACING * 100}
                              max={BADGE_LIMITS.MAX_LETTER_SPACING * 100}
                              step='5'
                              value={(formData.letterSpacing || 0) * 100}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  letterSpacing: parseInt(e.target.value) / 100,
                                }))
                              }
                              className='w-full h-2'
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 枠線設定 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      枠線設定
                    </label>
                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={formData.borderEnabled ?? true}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              borderEnabled: e.target.checked,
                            }))
                          }
                          className='mr-2'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          枠線を表示する
                        </span>
                      </div>

                      {formData.borderEnabled && (
                        <div className='grid grid-cols-2 gap-4 pl-6'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                              枠線の色
                            </label>
                            <input
                              type='color'
                              value={formData.borderColor || "#ffffff"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  borderColor: e.target.value,
                                }))
                              }
                              className='w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                              太さ: {formData.borderWidth}mm
                            </label>
                            <input
                              type='range'
                              min={BADGE_LIMITS.MIN_BORDER_WIDTH}
                              max={BADGE_LIMITS.MAX_BORDER_WIDTH}
                              step='0.5'
                              value={formData.borderWidth || 1}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  borderWidth: parseFloat(e.target.value),
                                }))
                              }
                              className='w-full'
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 画像バッジ設定 */}
                  {formData.type === "image" && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        画像アップロード
                      </label>
                      <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center'>
                        <ImageIcon className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                        <p className='text-gray-500 dark:text-gray-400'>
                          画像機能は後ほど実装予定
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* プレビュー部分 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    プレビュー
                  </label>
                  <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700'>
                    <div className='flex justify-center'>
                      {renderBadgePreview(formData)}
                    </div>
                    <div className='text-center mt-4 text-sm text-gray-500 dark:text-gray-400'>
                      実際のサイズで表示
                    </div>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <button
                  onClick={handleCancel}
                  className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                >
                  {editingBadge ? "更新" : "作成"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 閉じるボタン */}
        {!isEditMode && (
          <div className='p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
