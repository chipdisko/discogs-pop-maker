import React, { useMemo } from "react";
import type { PopResponse } from "@/src/application";
import type { Badge } from "@/app/types/badge";
import { BadgeStorageManager } from "@/app/utils/badgeStorage";

interface PopCardProps {
  pop: PopResponse;
  isSelected: boolean;
  isNewlyCreated?: boolean; // 新しく作成されたポップかどうか
  onToggleSelection: (popId: string) => void;
  onStartEdit: (pop: PopResponse) => void;
  onDelete: (popId: string) => void;
  isLoading: boolean;
}

export default function PopCard({
  pop,
  isSelected,
  isNewlyCreated = false,
  onToggleSelection,
  onStartEdit,
  onDelete,
  isLoading,
}: PopCardProps) {
  // カスタムバッジデータを取得
  const badge = useMemo((): Badge | null => {
    if (!pop.badgeId) return null;
    try {
      return BadgeStorageManager.getBadgeById(pop.badgeId);
    } catch (error) {
      console.error('バッジデータの取得に失敗:', error);
      return null;
    }
  }, [pop.badgeId]);

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      } ${
        isNewlyCreated ? "animate-pulse border-green-500 bg-green-50/20" : ""
      }`}
    >
      {/* 選択チェックボックス */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <label
            htmlFor={`select-${pop.id}`}
            className='text-xs text-gray-200 flex items-center gap-2 cursor-pointer border border-gray-500 rounded-md p-1'
          >
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => onToggleSelection(pop.id)}
              className='mt-1'
              id={`select-${pop.id}`}
            />
            選択
          </label>
        </div>
        {/* アクションボタン */}
        <div className='flex space-x-2 ml-4'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(pop);
            }}
            disabled={isLoading}
            className='px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 disabled:opacity-50'
          >
            編集
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pop.id);
            }}
            disabled={isLoading}
            className='px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded hover:bg-destructive/90 disabled:opacity-50'
          >
            削除
          </button>
        </div>
      </div>

      {/* データエリア */}
      <div className='flex justify-between items-start mb-1'>
        <div className='flex-1'>
          <h3 className='font-semibold text-sm mb-1 text-gray-200'>
            {pop.release.artistName}
          </h3>
          <p className='text-sm text-gray-200 mb-1'>{pop.release.title}</p>
          <p className='text-xs text-gray-400 mb-2'>
            {pop.release.label} • {pop.release.country} •{" "}
            {pop.release.releaseYear}
          </p>
        </div>
      </div>

      {/* コンディション表示 */}
      <div className='text-xs mb-1'>
        <span className='text-gray-400'>Condition:</span> {pop.condition}
      </div>

      {/* 価格表示 */}
      <div className='text-xs mb-1'>
        <span className='text-gray-400'>Price:</span>{" "}
        {pop.price === 0 ? "FREE" : `¥${pop.price.toLocaleString()}`}
      </div>

      {/* コメント表示 */}
      {pop.comment && (
        <div className='text-xs bg-muted p-2 rounded mb-2'>
          {pop.comment.split("\n").map((line, index) => (
            <div key={index}>
              {line}
              {index < pop.comment.split("\n").length - 1 && <br />}
            </div>
          ))}
        </div>
      )}

      {/* バッジ表示 */}
      {/* カスタムバッジ表示 */}
      {badge && (
        <div className='flex items-center gap-2'>
          <div 
            style={{
              // mm to px 変換（VisualEditorと同じ仕様）+ カード用スケール 0.8
              width: badge.width * 3.7795275591 * 0.8,
              height: badge.height * 3.7795275591 * 0.8,
              backgroundColor: badge.backgroundColor || '#3b82f6',
              color: badge.textColor || '#ffffff',
              fontSize: Math.max((badge.fontSize || 12) * 0.8, 8), // カード用縮小
              fontWeight: badge.fontWeight || 'bold',
              fontStyle: badge.fontStyle || 'normal',
              fontFamily: badge.fontFamily || 'Arial, sans-serif',
              letterSpacing: `${badge.letterSpacing || 0}em`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              overflow: 'hidden',
              borderRadius: badge.shape === 'circle' ? '50%' : `${(badge.borderRadius || 0) * 3.7795275591 * 0.8}px`,
              border: badge.borderEnabled ? `${(badge.borderWidth || 1) * 3.7795275591 * 0.8}px solid ${badge.borderColor || '#ffffff'}` : 'none',
              flexShrink: 0
            }}
          >
            <span
              style={{
                transform: badge.scaleX !== undefined && badge.scaleX !== 1 ? `scaleX(${badge.scaleX})` : undefined,
              }}
            >
              {badge.type === 'text' ? badge.text || 'バッジ' : '📷'}
            </span>
          </div>
          <span className='text-xs text-gray-400'>
            {badge.name}
          </span>
        </div>
      )}
    </div>
  );
}
