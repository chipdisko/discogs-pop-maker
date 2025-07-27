import React from "react";
import type { PopResponse } from "../../src/application";
import type { ConditionType } from "../../src/domain";

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
      {pop.badges.length > 0 && (
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
      )}
    </div>
  );
}
