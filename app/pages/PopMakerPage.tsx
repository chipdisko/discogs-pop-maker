"use client";

import { useState, useEffect, useCallback } from "react";
import { usePopService, usePrintService } from "../../src/infrastructure";
import type {
  PopResponse,
  CreatePopRequest,
  PrintDataResponse,
} from "../../src/application";
import type { BadgeType, ConditionType } from "../../src/domain";
import PrintPreviewModal from "../components/PrintPreviewModal";
import CreatePopModal, {
  type CreatePopFormData,
} from "../components/CreatePopModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PopCard from "../components/PopCard";
import { ThemeToggle } from "../components/ThemeToggle";

// 一時的なクリアボタン（テスト用）
const clearLocalStorage = () => {
  localStorage.clear();
  window.location.reload();
};

export default function PopMakerPage() {
  // Services
  const popService = usePopService();
  const printService = usePrintService();

  // State
  const [pops, setPops] = useState<PopResponse[]>([]);
  const [selectedPopIds, setSelectedPopIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 印刷プレビュー関連
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [printData, setPrintData] = useState<PrintDataResponse | null>(null);

  // 編集関連（インライン編集は削除、モーダル編集に変更）
  const [newlyCreatedPopIds, setNewlyCreatedPopIds] = useState<string[]>([]);

  // モーダル状態
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPop, setEditingPop] = useState<PopResponse | null>(null);

  // 初期化時に既存のポップを読み込み
  useEffect(() => {
    loadAllPops();
  }, []);

  // 新しく作成されたポップのアニメーションを3秒後に削除
  useEffect(() => {
    if (newlyCreatedPopIds.length > 0) {
      const timer = setTimeout(() => {
        setNewlyCreatedPopIds([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newlyCreatedPopIds]);

  /**
   * 全ポップを読み込み
   */
  const loadAllPops = useCallback(async () => {
    try {
      const result = await popService.getAllPops();
      if ("message" in result) {
        // エラーレスポンス
        setError(result.message);
      } else {
        // 成功レスポンス
        setPops(result.pops);
      }
    } catch {
      setError("ポップの読み込みに失敗しました");
    }
  }, [popService]);

  /**
   * モーダルからポップ作成
   */
  const handleCreatePopFromModal = async (formData: CreatePopFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: CreatePopRequest = {
        // Discogs URL（オプション）
        discogsUrl: formData.discogsUrl?.trim() || undefined,

        // リリース情報
        title: formData.title.trim() || undefined,
        artistName: formData.artistName.trim() || undefined,
        label: formData.label.trim() || undefined,
        country: formData.country.trim() || undefined,
        releaseDate: formData.releaseDate.trim() || undefined,
        genres: formData.genres.length > 0 ? formData.genres : undefined,
        styles: formData.styles.length > 0 ? formData.styles : undefined,

        // ユーザー入力
        comment: formData.comment.trim() || undefined,
        badges: formData.badges.length > 0 ? formData.badges : undefined,
        condition: formData.condition,
        price: formData.price > 0 ? formData.price : undefined,
      };

      // Discogs URLがある場合はDiscogsから取得、ない場合は手動データから作成
      const result = request.discogsUrl
        ? await popService.createPopFromDiscogsUrl(request)
        : await popService.createPopFromManualData(request);

      if ("message" in result) {
        // エラーレスポンス
        setError(result.message);
      } else {
        // 成功レスポンス
        setPops((prev) => [result, ...prev]);

        // 新しく作成されたポップを自動選択
        setSelectedPopIds((prev) => [result.id, ...prev]);

        // 新しく作成されたポップとしてマーク
        setNewlyCreatedPopIds((prev) => [result.id, ...prev]);

        // モーダルを閉じる
        setIsCreateModalOpen(false);

        // 成功メッセージ（オプション）
        console.log("ポップが正常に作成されました:", result.release.fullTitle);
      }
    } catch {
      setError("ポップの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ポップを削除
   */
  const handleDeletePop = async (popId: string) => {
    if (!confirm("このポップを削除しますか？")) {
      return;
    }

    try {
      const result = await popService.deletePop(popId);

      if (result && "message" in result) {
        setError(result.message);
      } else {
        setPops((prev) => prev.filter((pop) => pop.id !== popId));
        setSelectedPopIds((prev) => prev.filter((id) => id !== popId));
      }
    } catch {
      setError("ポップの削除に失敗しました");
    }
  };

  /**
   * ポップ選択状態を切り替え
   */
  const togglePopSelection = (popId: string) => {
    setSelectedPopIds((prev) =>
      prev.includes(popId)
        ? prev.filter((id) => id !== popId)
        : [...prev, popId]
    );
  };

  /**
   * ポップの編集を開始
   */
  const handleStartEdit = (pop: PopResponse) => {
    setEditingPop(pop);
    setIsEditModalOpen(true);
  };

  /**
   * 編集モーダルからポップ更新
   */
  const handleUpdatePopFromModal = async (formData: CreatePopFormData) => {
    if (!editingPop) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await popService.updatePop({
        id: editingPop.id,
        comment: formData.comment.trim() || undefined,
        badges: formData.badges.length > 0 ? formData.badges : undefined,
        condition: formData.condition,
        price: formData.price > 0 ? formData.price : undefined,
      });

      if ("message" in result) {
        setError(result.message);
      } else {
        // ローカル状態を更新
        setPops((prev) =>
          prev.map((pop) => (pop.id === editingPop.id ? result : pop))
        );

        // 編集モーダルを閉じる
        setIsEditModalOpen(false);
        setEditingPop(null);

        // 成功メッセージ（オプション）
        console.log("ポップが正常に更新されました:", result.release.fullTitle);
      }
    } catch {
      setError("ポップの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 印刷データ生成
   */
  const handleGeneratePrint = async () => {
    if (selectedPopIds.length === 0) {
      setError("印刷するポップを選択してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await printService.generatePrintData({
        popIds: selectedPopIds,
      });

      if ("message" in result) {
        setError(result.message);
      } else {
        console.log("印刷データが生成されました:", result);
        // 印刷プレビューモーダルを開く
        setPrintData(result);
        setIsPreviewOpen(true);
      }
    } catch {
      setError("印刷データの生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* ヘッダー */}
        <div className='flex justify-between items-center'>
          <div className='text-center flex-1'>
            <h1 className='text-4xl font-bold text-foreground mb-2'>
              Discogs Pop Maker
            </h1>
            <p className='text-muted-foreground'>
              レコード屋さんのポップを簡単作成✨
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={clearLocalStorage}
              className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
            >
              クリア（テスト用）
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded'>
            <div className='flex items-center space-x-2'>
              <span className='text-destructive'>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ポップ作成ボタン */}
        <Card>
          <CardHeader>
            <CardTitle>新しいポップを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className='w-full'
              size='lg'
            >
              ＋ 新しいポップを作成
            </Button>
          </CardContent>
        </Card>

        {/* ポップ一覧・印刷機能 */}
        {pops.length > 0 && (
          <Card>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>作成済みポップ ({pops.length}個)</CardTitle>
                {selectedPopIds.length > 0 && (
                  <Button
                    onClick={handleGeneratePrint}
                    disabled={isLoading}
                    variant='secondary'
                  >
                    選択したポップを印刷 ({selectedPopIds.length}個)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {pops.map((pop) => (
                  <PopCard
                    key={pop.id}
                    pop={pop}
                    isSelected={selectedPopIds.includes(pop.id)}
                    isNewlyCreated={newlyCreatedPopIds.includes(pop.id)}
                    onToggleSelection={togglePopSelection}
                    onStartEdit={handleStartEdit}
                    onDelete={handleDeletePop}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
    </div>
  );
}
