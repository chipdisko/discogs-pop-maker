import React from "react";
import type { PopResponse } from "../../src/application";
import type { ConditionType } from "../../src/domain";

interface PopCardProps {
  pop: PopResponse;
  isSelected: boolean;
  isEditing: boolean;
  isNewlyCreated?: boolean; // 新しく作成されたポップかどうか
  onToggleSelection: (popId: string) => void;
  onStartEdit: (pop: PopResponse) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (popId: string) => void;
  // 編集用の状態
  editComment: string;
  editBadges: string[];
  editCondition: ConditionType;
  editPrice: string;
  onEditCommentChange: (comment: string) => void;
  onEditBadgesChange: (badges: string[]) => void;
  onEditConditionChange: (condition: ConditionType) => void;
  onEditPriceChange: (price: string) => void;
  // 共通
  isLoading: boolean;
  availableBadges: string[];
}

export default function PopCard({
  pop,
  isSelected,
  isEditing,
  isNewlyCreated = false,
  onToggleSelection,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  editComment,
  editBadges,
  editCondition,
  editPrice,
  onEditCommentChange,
  onEditBadgesChange,
  onEditConditionChange,
  onEditPriceChange,
  isLoading,
  availableBadges,
}: PopCardProps) {
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
              disabled={isEditing}
              id={`select-${pop.id}`}
            />
            選択
          </label>
        </div>
        {/* アクションボタン */}
        <div className='flex space-x-2 ml-4'>
          {isEditing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveEdit();
                }}
                disabled={isLoading}
                className='px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 disabled:opacity-50'
              >
                保存
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEdit();
                }}
                disabled={isLoading}
                className='px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 disabled:opacity-50'
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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

      {/* コンディション表示・編集 */}
      {isEditing ? (
        <div className='mb-2'>
          <label className='block text-xs font-medium mb-1'>
            コンディション
          </label>
          <div className='grid grid-cols-2 gap-1'>
            {[
              "New",
              "M",
              "M-",
              "M--",
              "EX++",
              "EX",
              "VG+",
              "VG",
              "Good",
              "Poor",
            ].map((condition) => (
              <label
                key={condition}
                className='flex items-center space-x-1 cursor-pointer'
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type='radio'
                  name={`condition-${pop.id}`}
                  value={condition}
                  checked={editCondition === condition}
                  onChange={(e) =>
                    onEditConditionChange(e.target.value as ConditionType)
                  }
                  className='text-xs'
                />
                <span className='text-xs'>{condition}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className='text-xs  mb-1'>
          <span className='text-gray-400'>Condition:</span> {pop.condition}
        </div>
      )}

      {/* 価格表示・編集 */}
      {isEditing ? (
        <div className='mb-2'>
          <label className='block text-xs font-medium mb-1'>価格</label>
          <input
            type='number'
            value={editPrice}
            onChange={(e) => onEditPriceChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder='価格を入力'
            min='0'
            className='w-full px-2 py-1 border border-border rounded text-xs'
          />
        </div>
      ) : (
        <div className='text-xs mb-1'>
          <span className='text-gray-400'>Price:</span>{" "}
          {pop.price === 0 ? "FREE" : `¥${pop.price.toLocaleString()}`}
        </div>
      )}

      {/* コメント表示・編集 */}
      {isEditing ? (
        <div className='mb-2'>
          <label className='block text-xs font-medium mb-1'>コメント</label>
          <textarea
            value={editComment}
            onChange={(e) => onEditCommentChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder='このレコードについてのコメント...
（改行可能）'
            rows={2}
            maxLength={200}
            className='w-full px-2 py-1 border border-border rounded text-xs'
          />
          <p className='text-xs text-gray-500 mt-1'>
            {editComment.length}/200文字
          </p>
        </div>
      ) : (
        pop.comment && (
          <div className='text-xs bg-muted p-2 rounded mb-2'>
            {pop.comment.split("\n").map((line, index) => (
              <div key={index}>
                {line}
                {index < pop.comment.split("\n").length - 1 && <br />}
              </div>
            ))}
          </div>
        )
      )}

      {/* バッジ表示・編集 */}
      {isEditing ? (
        <div className='mb-2'>
          <label className='block text-xs font-medium mb-1'>バッジ</label>
          <div className='flex flex-wrap gap-1'>
            {availableBadges.map((badge) => (
              <label
                key={badge}
                className='flex items-center space-x-1 cursor-pointer'
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type='checkbox'
                  checked={editBadges.includes(badge)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onEditBadgesChange([...editBadges, badge]);
                    } else {
                      onEditBadgesChange(editBadges.filter((b) => b !== badge));
                    }
                  }}
                  className='text-xs'
                />
                <span className='px-2 py-1 bg-primary/10 text-primary rounded text-xs'>
                  {badge}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        pop.badges.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {pop.badges.map((badge) => (
              <span
                key={badge.type}
                className='px-2 py-1 bg-primary/20 text-primary text-xs rounded'
              >
                {badge.displayName}
              </span>
            ))}
          </div>
        )
      )}
    </div>
  );
}
