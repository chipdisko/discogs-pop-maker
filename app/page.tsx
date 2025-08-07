"use client";

import CreatePopModal from "./components/modal/CreatePopModal";
import VisualEditorModal from "./components/modal/VisualEditorModal";
import PrintPreviewModal from "./components/modal/PrintPreviewModal";
import BadgeManagerModal from "./components/modal/CustomBadgeManagerModal";
import Header from "./components/layout/Header";
import ErrorDisplay from "./components/layout/ErrorDisplay";
import CreatePopSection from "./components/pop/CreatePopSection";
import PopListSection from "./components/pop/PopListSection";
import { usePopMaker } from "./hooks/usePopMaker";
import { useState } from "react";
import type { PopResponse } from "@/src/application";

export default function Home() {
  const {
    // State
    pops,
    selectedPopIds,
    newlyCreatedPopIds,
    isLoading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    editingPop,

    // Actions
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setEditingPop,
    handleCreatePopFromModal,
    handleDeletePop,
    togglePopSelection,
    selectAllPops,
    deselectAllPops,
    handleStartEdit,
    handleUpdatePopFromModal,
  } = usePopMaker();

  // ビジュアルエディタ用の状態
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [visualEditorPop, setVisualEditorPop] = useState<PopResponse | null>(
    null
  );

  // 印刷プレビュー用の状態
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // カスタムバッジマネージャー用の状態
  const [isBadgeManagerOpen, setIsBadgeManagerOpen] = useState(false);


  // 印刷プレビューを開く
  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  return (
    <div className='min-h-screen bg-background p-6'>
      <div id='main' className='max-w-6xl mx-auto space-y-8'>
        {/* ヘッダー */}
        <Header />

        {/* エラー表示 */}
        <ErrorDisplay error={error} />

        {/* ポップ作成ボタン */}
        <CreatePopSection 
          onCreateClick={() => setIsCreateModalOpen(true)}
          onTemplateDesignClick={() => setIsVisualEditorOpen(true)}
          onBadgeManagerClick={() => setIsBadgeManagerOpen(true)}
        />

        {/* ポップ一覧・印刷機能 */}
        <PopListSection
          pops={pops}
          selectedPopIds={selectedPopIds}
          newlyCreatedPopIds={newlyCreatedPopIds}
          isLoading={isLoading}
          onSelectAll={selectAllPops}
          onDeselectAll={deselectAllPops}
          onToggleSelection={togglePopSelection}
          onStartEdit={handleStartEdit}
          onDelete={handleDeletePop}
          onOpenPrintPreview={handleOpenPrintPreview}
        />
      </div>

      {/* ポップ作成モーダル */}
      <CreatePopModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePopFromModal}
        isLoading={isLoading}
      />

      {/* ポップ編集モーダル */}
      <CreatePopModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPop(null);
        }}
        onSubmit={handleUpdatePopFromModal}
        isLoading={isLoading}
        isEditMode={true}
        initialData={
          editingPop
            ? {
                discogsUrl: "",
                title: editingPop.release.title,
                artistName: editingPop.release.artistName,
                label: editingPop.release.label,
                country: editingPop.release.country,
                releaseDate: editingPop.release.releaseDate,
                genres: editingPop.release.genres,
                styles: editingPop.release.styles,
                comment: editingPop.comment,
                badgeId: editingPop.badgeId,
                condition: editingPop.condition,
                price: editingPop.price,
                priceSuggestions: undefined, // 編集時は価格提案を再取得
                discogsReleaseId: editingPop.release.discogsId,
                discogsType: editingPop.release.discogsType,
              }
            : undefined
        }
      />

      {/* ビジュアルエディタモーダル */}
      <VisualEditorModal
        isOpen={isVisualEditorOpen}
        onClose={() => {
          setIsVisualEditorOpen(false);
          setVisualEditorPop(null);
        }}
        pop={visualEditorPop}
      />

      {/* 印刷プレビューモーダル */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        pops={pops}
      />

      {/* カスタムバッジマネージャーモーダル */}
      <BadgeManagerModal
        isOpen={isBadgeManagerOpen}
        onClose={() => setIsBadgeManagerOpen(false)}
      />
    </div>
  );
}
