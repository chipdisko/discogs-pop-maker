"use client";

import PrintPreviewModal from "../components/modal/PrintPreviewModal";
import CreatePopModal from "../components/modal/CreatePopModal";
import VisualEditorModal from "../components/modal/VisualEditorModal";
import Header from "../components/layout/Header";
import ErrorDisplay from "../components/layout/ErrorDisplay";
import CreatePopSection from "../components/pop/CreatePopSection";
import PopListSection from "../components/pop/PopListSection";
import { usePopMaker } from "../hooks/usePopMaker";
import { useState } from "react";
import type { PopResponse } from "@/src/application";

// 一時的なクリアボタン（テスト用）
const clearLocalStorage = () => {
  localStorage.clear();
  window.location.reload();
};

export default function PopMakerPage() {
  const {
    // State
    pops,
    selectedPopIds,
    newlyCreatedPopIds,
    isLoading,
    error,
    isPreviewOpen,
    printData,
    isCreateModalOpen,
    isEditModalOpen,
    editingPop,

    // Actions
    setIsPreviewOpen,
    setPrintData,
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
    handleGeneratePrint,
  } = usePopMaker();

  // ビジュアルエディタ用の状態
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [visualEditorPop, setVisualEditorPop] = useState<PopResponse | null>(null);

  const handleOpenVisualEditor = (pop: PopResponse) => {
    setVisualEditorPop(pop);
    setIsVisualEditorOpen(true);
  };

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* ヘッダー */}
        <Header onClearStorage={clearLocalStorage} />

        {/* エラー表示 */}
        <ErrorDisplay error={error} />

        {/* ポップ作成ボタン */}
        <CreatePopSection onCreateClick={() => setIsCreateModalOpen(true)} />

        {/* ポップ一覧・印刷機能 */}
        <PopListSection
          pops={pops}
          selectedPopIds={selectedPopIds}
          newlyCreatedPopIds={newlyCreatedPopIds}
          isLoading={isLoading}
          onSelectAll={selectAllPops}
          onDeselectAll={deselectAllPops}
          onGeneratePrint={handleGeneratePrint}
          onToggleSelection={togglePopSelection}
          onStartEdit={handleStartEdit}
          onDelete={handleDeletePop}
          onOpenVisualEditor={handleOpenVisualEditor}
        />
      </div>

      {/* 印刷プレビューモーダル */}
      {printData && (
        <PrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPrintData(null);
          }}
          printData={printData}
        />
      )}

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
                badges: editingPop.badges.map((badge) => badge.type),
                condition: editingPop.condition,
                price: editingPop.price,
                priceSuggestions: undefined, // 編集時は価格提案を再取得
                discogsReleaseId: editingPop.release.discogsId,
              }
            : undefined
        }
      />

      {/* ビジュアルエディタモーダル */}
      {visualEditorPop && (
        <VisualEditorModal
          isOpen={isVisualEditorOpen}
          onClose={() => {
            setIsVisualEditorOpen(false);
            setVisualEditorPop(null);
          }}
          pop={visualEditorPop}
        />
      )}
    </div>
  );
}
