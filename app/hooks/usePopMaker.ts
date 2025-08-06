import { useState, useEffect, useCallback } from "react";
import { usePopService } from "@/src/infrastructure";
import type {
  PopResponse,
  CreatePopRequest,
} from "@/src/application";
import type { CreatePopFormData } from "../components/modal/CreatePopModal";

export function usePopMaker() {
  // Services
  const popService = usePopService();

  // State
  const [pops, setPops] = useState<PopResponse[]>([]);
  const [selectedPopIds, setSelectedPopIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // 編集関連
  const [newlyCreatedPopIds, setNewlyCreatedPopIds] = useState<string[]>([]);

  // モーダル状態
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPop, setEditingPop] = useState<PopResponse | null>(null);

  // 初期化時に既存のポップを読み込み
  useEffect(() => {
    loadAllPops();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setError(result.message);
      } else {
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
        discogsUrl: formData.discogsUrl?.trim() || undefined,
        discogsType: formData.discogsType,
        title: formData.title.trim() || undefined,
        artistName: formData.artistName.trim() || undefined,
        label: formData.label.trim() || undefined,
        country: formData.country.trim() || undefined,
        releaseDate: formData.releaseDate.trim() || undefined,
        genres: formData.genres.length > 0 ? formData.genres : undefined,
        styles: formData.styles.length > 0 ? formData.styles : undefined,
        comment: formData.comment.trim() || undefined,
        badges: formData.badges.length > 0 ? formData.badges : undefined,
        condition: formData.condition,
        price: formData.price > 0 ? formData.price : undefined,
      };

      const result = request.discogsUrl
        ? await popService.createPopFromDiscogsUrl(request)
        : await popService.createPopFromManualData(request);

      if ("message" in result) {
        setError(result.message);
      } else {
        setPops((prev) => [result, ...prev]);
        setSelectedPopIds((prev) => [result.id, ...prev]);
        setNewlyCreatedPopIds((prev) => [result.id, ...prev]);
        setIsCreateModalOpen(false);
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
   * 全てのポップを選択
   */
  const selectAllPops = () => {
    setSelectedPopIds(pops.map((pop) => pop.id));
  };

  /**
   * 全てのポップの選択を解除
   */
  const deselectAllPops = () => {
    setSelectedPopIds([]);
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
        title: formData.title.trim(),
        artistName: formData.artistName.trim(),
        label: formData.label.trim(),
        country: formData.country.trim(),
        releaseDate: formData.releaseDate.trim(),
        genres: formData.genres,
        styles: formData.styles,
        comment: formData.comment.trim(),
        badges: formData.badges,
        condition: formData.condition,
        price: formData.price,
      });

      if ("message" in result) {
        setError(result.message);
      } else {
        setPops((prev) =>
          prev.map((pop) => (pop.id === editingPop.id ? result : pop))
        );
        setIsEditModalOpen(false);
        setEditingPop(null);
        console.log("ポップが正常に更新されました:", result.release.fullTitle);
      }
    } catch {
      setError("ポップの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    setError,
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
  };
}
