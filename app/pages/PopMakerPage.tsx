"use client";

import { useState, useEffect, useCallback } from "react";
import { usePopService, usePrintService } from "../../src/infrastructure";
import type {
  PopResponse,
  CreatePopRequest,
  PrintDataResponse,
} from "../../src/application";
import type { BadgeType } from "../../src/domain";
import PrintPreviewModal from "../components/PrintPreviewModal";

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

  // Form state
  const [discogsUrl, setDiscogsUrl] = useState("");
  const [comment, setComment] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // 初期化時に既存のポップを読み込み
  useEffect(() => {
    loadAllPops();
  }, []);

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
   * Discogs URLからポップ作成
   */
  const handleCreatePop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discogsUrl.trim()) {
      setError("Discogs URLを入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: CreatePopRequest = {
        discogsUrl: discogsUrl.trim(),
        comment: comment.trim() || undefined,
        badges:
          selectedBadges.length > 0
            ? (selectedBadges as BadgeType[])
            : undefined,
      };

      const result = await popService.createPopFromDiscogsUrl(request);

      if ("message" in result) {
        // エラーレスポンス
        setError(result.message);
      } else {
        // 成功レスポンス
        setPops((prev) => [result, ...prev]);

        // フォームリセット
        setDiscogsUrl("");
        setComment("");
        setSelectedBadges([]);

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
  };

  /**
   * 編集をキャンセル
   */
  const handleCancelEdit = () => {
    setEditingPopId(null);
    setEditComment("");
    setEditBadges([]);
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
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Discogs Pop Maker
          </h1>
          <p className='text-gray-700'>レコード屋さんのポップを簡単作成✨</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded'>
            {error}
          </div>
        )}

        {/* ポップ作成フォーム */}
        <div className='bg-card border border-border rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>新しいポップを作成</h2>

          <form onSubmit={handleCreatePop} className='space-y-4'>
            <div>
              <label
                htmlFor='discogsUrl'
                className='block text-sm font-medium mb-2'
              >
                Discogs URL
              </label>
              <input
                id='discogsUrl'
                type='url'
                value={discogsUrl}
                onChange={(e) => setDiscogsUrl(e.target.value)}
                placeholder='https://www.discogs.com/release/...'
                className='w-full px-3 py-2 border border-border rounded-md'
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor='comment'
                className='block text-sm font-medium mb-2'
              >
                コメント（任意）
              </label>
              <textarea
                id='comment'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='このレコードについてのコメント...
（改行可能）'
                rows={3}
                maxLength={200}
                className='w-full px-3 py-2 border border-border rounded-md'
                disabled={isLoading}
              />
              <p className='text-xs text-gray-600 mt-1'>
                {comment.length}/200文字
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                バッジ（複数選択可）
              </label>
              <div className='flex flex-wrap gap-2'>
                {availableBadges.map((badge) => (
                  <label
                    key={badge}
                    className='flex items-center space-x-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedBadges.includes(badge)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBadges((prev) => [...prev, badge]);
                        } else {
                          setSelectedBadges((prev) =>
                            prev.filter((b) => b !== badge)
                          );
                        }
                      }}
                      disabled={isLoading}
                    />
                    <span className='px-3 py-1 bg-primary/10 text-primary rounded text-sm'>
                      {badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50'
            >
              {isLoading ? "作成中..." : "ポップを作成"}
            </button>
          </form>
        </div>

        {/* ポップ一覧・印刷機能 */}
        {pops.length > 0 && (
          <div className='bg-card border border-border rounded-lg p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-semibold'>
                作成済みポップ ({pops.length}個)
              </h2>

              {selectedPopIds.length > 0 && (
                <button
                  onClick={handleGeneratePrint}
                  disabled={isLoading}
                  className='bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90'
                >
                  選択したポップを印刷 ({selectedPopIds.length}個)
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {pops.map((pop) => (
                <div key={pop.id} className='border rounded-lg p-4'>
                  <div className='flex items-start justify-between mb-2'>
                    <input
                      type='checkbox'
                      checked={selectedPopIds.includes(pop.id)}
                      onChange={() => togglePopSelection(pop.id)}
                      className='mt-1'
                      disabled={editingPopId === pop.id}
                    />
                    <div className='flex space-x-2'>
                      {editingPopId === pop.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            className='text-green-600 hover:text-green-800 text-sm'
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className='text-gray-500 hover:text-gray-700 text-sm'
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(pop)}
                            disabled={editingPopId !== null}
                            className='text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50'
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeletePop(pop.id)}
                            disabled={editingPopId !== null}
                            className='text-destructive hover:text-destructive/80 text-sm disabled:opacity-50'
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className='font-semibold text-sm mb-1'>
                    {pop.release.fullTitle}
                  </h3>

                  <p className='text-xs text-gray-600 mb-2'>
                    {pop.release.label} • {pop.release.country} •{" "}
                    {pop.release.releaseYear}
                  </p>

                  {/* コメント表示・編集 */}
                  {editingPopId === pop.id ? (
                    <div className='mb-2'>
                      <label className='block text-xs font-medium mb-1'>
                        コメント
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
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
                            {index < pop.comment.split("\n").length - 1 && (
                              <br />
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* バッジ表示・編集 */}
                  {editingPopId === pop.id ? (
                    <div className='mb-2'>
                      <label className='block text-xs font-medium mb-1'>
                        バッジ
                      </label>
                      <div className='flex flex-wrap gap-1'>
                        {availableBadges.map((badge) => (
                          <label
                            key={badge}
                            className='flex items-center space-x-1 cursor-pointer'
                          >
                            <input
                              type='checkbox'
                              checked={editBadges.includes(badge)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditBadges((prev) => [...prev, badge]);
                                } else {
                                  setEditBadges((prev) =>
                                    prev.filter((b) => b !== badge)
                                  );
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
              ))}
            </div>
          </div>
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
    </div>
  );
}
