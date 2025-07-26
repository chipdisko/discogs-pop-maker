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

  // 編集関連
  const [editingPopId, setEditingPopId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editBadges, setEditBadges] = useState<string[]>([]);
  const [editCondition, setEditCondition] = useState<ConditionType>("New");
  const [editPrice, setEditPrice] = useState<string>("");
  const [newlyCreatedPopIds, setNewlyCreatedPopIds] = useState<string[]>([]);

  // Form state (モーダルで管理するため削除)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        discogsUrl: formData.discogsUrl.trim(),
        comment: formData.comment.trim() || undefined,
        badges: formData.badges.length > 0 ? formData.badges : undefined,
        condition: formData.condition,
        price: formData.price > 0 ? formData.price : undefined,
      };

      const result = await popService.createPopFromDiscogsUrl(request);

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
    setEditingPopId(pop.id);
    setEditComment(pop.comment);
    setEditBadges(pop.badges.map((badge) => badge.type));
    setEditCondition(pop.condition);
    setEditPrice(pop.price.toString());
  };

  /**
   * 編集をキャンセル
   */
  const handleCancelEdit = () => {
    setEditingPopId(null);
    setEditComment("");
    setEditBadges([]);
    setEditCondition("New");
    setEditPrice("");
  };

  /**
   * 編集を保存
   */
  const handleSaveEdit = async () => {
    if (!editingPopId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await popService.updatePop({
        id: editingPopId,
        comment: editComment.trim() || undefined,
        badges: editBadges.length > 0 ? (editBadges as BadgeType[]) : undefined,
        condition: editCondition,
        price: editPrice ? parseInt(editPrice) : undefined,
      });

      if ("message" in result) {
        setError(result.message);
      } else {
        // ローカル状態を更新
        setPops((prev) =>
          prev.map((pop) => (pop.id === editingPopId ? result : pop))
        );

        // 編集状態をリセット
        handleCancelEdit();
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

  const availableBadges = ["RECOMMEND", "MUST", "RAVE", "ACID"];

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
          <ThemeToggle />
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
                    isEditing={editingPopId === pop.id}
                    isNewlyCreated={newlyCreatedPopIds.includes(pop.id)}
                    onToggleSelection={togglePopSelection}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onDelete={handleDeletePop}
                    editComment={editComment}
                    editBadges={editBadges}
                    editCondition={editCondition}
                    editPrice={editPrice}
                    onEditCommentChange={setEditComment}
                    onEditBadgesChange={setEditBadges}
                    onEditConditionChange={setEditCondition}
                    onEditPriceChange={setEditPrice}
                    isLoading={isLoading}
                    availableBadges={availableBadges}
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
    </div>
  );
}
