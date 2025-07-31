import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BadgeType, ConditionType } from "@/src/domain";
import type { ReleaseResponse } from "@/src/application";
import type {
  DiscogsReleaseData,
  PriceSuggestion,
  DiscogsPriceSuggestionsData,
} from "@/src/infrastructure/external/DiscogsApiTypes";

interface CreatePopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePopFormData) => void;
  isLoading: boolean;
  isEditMode?: boolean;
  initialData?: CreatePopFormData;
}

export interface CreatePopFormData {
  discogsUrl?: string;
  title: string;
  artistName: string;
  label: string;
  country: string;
  releaseDate: string;
  genres: string[];
  styles: string[];
  comment: string;
  badges: BadgeType[];
  condition: ConditionType;
  price: number;
  priceSuggestions?: DiscogsPriceSuggestionsData;
  discogsReleaseId?: string;
}

// 定数定義
const DEFAULT_FORM_DATA: CreatePopFormData = {
  discogsUrl: "",
  title: "",
  artistName: "",
  label: "",
  country: "",
  releaseDate: "",
  genres: [],
  styles: [],
  comment: "",
  badges: [],
  condition: "New",
  price: 0,
  priceSuggestions: undefined,
  discogsReleaseId: undefined,
};

const availableBadges: {
  value: BadgeType;
  label: string;
  description: string;
}[] = [
  { value: "RECOMMEND", label: "RECOMMEND", description: "おすすめ" },
  { value: "MUST", label: "MUST", description: "必聴" },
  { value: "RAVE", label: "RAVE", description: "レイブ" },
  { value: "ACID", label: "ACID", description: "アシッド" },
];

const conditions: {
  value: ConditionType;
  label: string;
  description: string;
}[] = [
  { value: "New", label: "New", description: "新品" },
  { value: "M", label: "M", description: "新品同様" },
  { value: "M-", label: "M-", description: "中古美品" },
  { value: "M--", label: "M--", description: "微小の傷あり、ノイズなし" },
  {
    value: "EX++",
    label: "EX++",
    description: "小さな傷あり、微小のノイズあり",
  },
  { value: "EX", label: "EX", description: "目立つ傷あり、多少のノイズあり" },
  { value: "VG+", label: "VG+", description: "深い傷あり、ノイズあり" },
  { value: "VG", label: "VG", description: "かなりの傷・ノイズあり" },
  {
    value: "Good",
    label: "Good",
    description: "深刻な傷・ノイズあり 盤面の劣化あり",
  },
  {
    value: "Poor",
    label: "Poor",
    description: "深刻な傷・ノイズ・劣化あり 再生できない可能性も",
  },
];

export default function CreatePopModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isEditMode = false,
  initialData,
}: CreatePopModalProps) {
  // 状態管理
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] =
    useState<CreatePopFormData>(DEFAULT_FORM_DATA);
  const [discogsData, setDiscogsData] = useState<ReleaseResponse | null>(null);
  const [isFetchingDiscogs, setIsFetchingDiscogs] = useState(false);
  const [isFetchingPriceSuggestions, setIsFetchingPriceSuggestions] =
    useState(false);

  // 一時的な入力状態
  const [tempGenres, setTempGenres] = useState<string>("");
  const [tempStyles, setTempStyles] = useState<string>("");
  const [isGenresFocused, setIsGenresFocused] = useState(false);
  const [isStylesFocused, setIsStylesFocused] = useState(false);

  // フォームを完全にリセットする関数
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(1);
    setDiscogsData(null);
    setIsFetchingDiscogs(false);
    setIsFetchingPriceSuggestions(false);
    setTempGenres("");
    setTempStyles("");
    setIsGenresFocused(false);
    setIsStylesFocused(false);
  }, []);

  // 編集モード用の初期化
  const initializeEditMode = useCallback((data: CreatePopFormData) => {
    setFormData(data);
    setCurrentStep(2);
    setTempGenres(data.genres.join(", "));
    setTempStyles(data.styles.join(", "));
  }, []);

  // モーダルの開閉状態に応じてフォームを初期化
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        initializeEditMode(initialData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, isEditMode, initialData, resetForm, initializeEditMode]);

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // バッジ選択処理
  const handleBadgeChange = (badge: BadgeType, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      badges: checked
        ? [...prev.badges, badge]
        : prev.badges.filter((b) => b !== badge),
    }));
  };

  // 価格変更処理
  const handlePriceChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, price: numValue }));
  };

  // 価格提案取得
  const fetchPriceSuggestions = async (releaseId: string) => {
    setIsFetchingPriceSuggestions(true);
    try {
      const response = await fetch("/api/discogs/price-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId }),
      });

      if (!response.ok) {
        console.warn("価格提案取得エラー");
        return;
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        console.warn("無効な価格提案レスポンス形式");
        return;
      }

      const priceSuggestions: DiscogsPriceSuggestionsData = {};
      result.data.forEach((suggestion: PriceSuggestion) => {
        priceSuggestions[suggestion.condition] = {
          price: suggestion.price,
          currency: suggestion.currency,
        };
      });

      setFormData((prev) => ({ ...prev, priceSuggestions }));
    } catch (error) {
      console.error("価格提案取得エラー:", error);
    } finally {
      setIsFetchingPriceSuggestions(false);
    }
  };

  // Discogsデータ取得
  const fetchDiscogsData = async (url: string) => {
    setIsFetchingDiscogs(true);
    try {
      const response = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Discogs API エラー");
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("無効なレスポンス形式");
      }

      const releaseData = result.data;
      const discogsId = releaseData.id?.toString();
      if (!discogsId || discogsId.trim() === "") {
        throw new Error("有効なDiscogs IDが取得できませんでした");
      }

      const discogsResponse: ReleaseResponse = {
        discogsId,
        title: releaseData.title || "",
        artistName: extractArtistName(releaseData),
        label: extractLabel(releaseData),
        country: releaseData.country || "",
        releaseDate: extractReleaseDate(releaseData),
        genres: releaseData.genres || [],
        styles: releaseData.styles || [],
        fullTitle: `${extractArtistName(releaseData)} - ${
          releaseData.title || ""
        }`,
        releaseYear: extractReleaseYear(releaseData),
        genreStyleString: [
          ...(releaseData.genres || []),
          ...(releaseData.styles || []),
        ].join(", "),
      };

      setDiscogsData(discogsResponse);
      setFormData((prev) => ({
        ...prev,
        title: discogsResponse.title,
        artistName: discogsResponse.artistName,
        label: discogsResponse.label,
        country: discogsResponse.country,
        releaseDate: discogsResponse.releaseDate,
        genres: discogsResponse.genres,
        styles: discogsResponse.styles,
        discogsReleaseId: discogsResponse.discogsId,
      }));

      setTempGenres(discogsResponse.genres.join(", "));
      setTempStyles(discogsResponse.styles.join(", "));

      if (discogsResponse.discogsId) {
        await fetchPriceSuggestions(discogsResponse.discogsId);
      }

      setCurrentStep(2);
    } catch (error) {
      console.error("Discogsデータ取得エラー:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Discogsデータの取得に失敗しました"
      );
    } finally {
      setIsFetchingDiscogs(false);
    }
  };

  // ユーティリティ関数
  const extractArtistName = (data: DiscogsReleaseData): string => {
    if (
      data.artists &&
      Array.isArray(data.artists) &&
      data.artists.length > 0
    ) {
      return data.artists.map((artist) => artist.name).join(", ");
    }
    return "Unknown Artist";
  };

  const extractLabel = (data: DiscogsReleaseData): string => {
    if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
      return data.labels.map((label) => label.name).join(", ");
    }
    return "";
  };

  const extractReleaseDate = (data: DiscogsReleaseData): string => {
    if (data.released) return data.released;
    if (data.year) return data.year.toString();
    return "";
  };

  const extractReleaseYear = (data: DiscogsReleaseData): string => {
    if (data.year) return data.year.toString();
    if (data.released) return data.released.split("-")[0];
    return "";
  };

  // モーダルを閉じる処理
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ジャンル入力処理
  const handleGenresChange = (value: string) => {
    setTempGenres(value);
    setFormData((prev) => ({
      ...prev,
      genres: value.split(",").map((g) => g.trim()),
    }));
  };

  const handleGenresFocus = () => {
    setIsGenresFocused(true);
    setTempGenres(formData.genres.join(", "));
  };

  const handleGenresBlur = () => {
    setIsGenresFocused(false);
    const cleanedGenres = tempGenres
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    setFormData((prev) => ({ ...prev, genres: cleanedGenres }));
    setTempGenres(cleanedGenres.join(", "));
  };

  // スタイル入力処理
  const handleStylesChange = (value: string) => {
    setTempStyles(value);
    setFormData((prev) => ({
      ...prev,
      styles: value.split(",").map((s) => s.trim()),
    }));
  };

  const handleStylesFocus = () => {
    setIsStylesFocused(true);
    setTempStyles(formData.styles.join(", "));
  };

  const handleStylesBlur = () => {
    setIsStylesFocused(false);
    const cleanedStyles = tempStyles
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setFormData((prev) => ({ ...prev, styles: cleanedStyles }));
    setTempStyles(cleanedStyles.join(", "));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "ポップを編集" : "新しいポップを作成"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "ポップの情報を編集してください。"
              : currentStep === 1
              ? "Discogs URLを入力するか、手動でデータを入力してください。"
              : "リリース情報を確認・編集して、ポップの詳細を設定してください。"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && !isEditMode ? (
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='discogsUrl'>Discogs URL</Label>
                <Input
                  id='discogsUrl'
                  type='url'
                  value={formData.discogsUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discogsUrl: e.target.value,
                    }))
                  }
                  placeholder='https://www.discogs.com/release/...'
                  disabled={isFetchingDiscogs}
                  autoComplete='off'
                />
                <p className='text-xs text-muted-foreground'>
                  Discogs URLを入力すると、自動的にリリース情報を取得します
                </p>
              </div>

              <div className='flex gap-2'>
                <Button
                  type='button'
                  onClick={() => fetchDiscogsData(formData.discogsUrl || "")}
                  disabled={!formData.discogsUrl?.trim() || isFetchingDiscogs}
                  className='flex-1'
                >
                  {isFetchingDiscogs ? "取得中..." : "データを取得"}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCurrentStep(2)}
                  disabled={isFetchingDiscogs}
                  className='flex-1'
                >
                  URLをスキップ
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='artistName'>アーティスト名 *</Label>
                <Input
                  id='artistName'
                  value={formData.artistName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      artistName: e.target.value,
                    }))
                  }
                  placeholder='アーティスト名'
                  required
                  disabled={isLoading}
                  autoComplete='off'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='title'>タイトル *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder='アルバムタイトル'
                  required
                  disabled={isLoading}
                  autoComplete='off'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='label'>レーベル</Label>
                  <Input
                    id='label'
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder='レーベル名'
                    disabled={isLoading}
                    autoComplete='off'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='country'>国</Label>
                  <Input
                    id='country'
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder='リリース国'
                    disabled={isLoading}
                    autoComplete='country-name'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='releaseDate'>リリース日</Label>
                  <Input
                    id='releaseDate'
                    value={formData.releaseDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        releaseDate: e.target.value,
                      }))
                    }
                    placeholder='2024'
                    disabled={isLoading}
                    autoComplete='off'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='genres'>ジャンル</Label>
                  <Input
                    id='genres'
                    value={
                      isGenresFocused ? tempGenres : formData.genres.join(", ")
                    }
                    onChange={(e) => handleGenresChange(e.target.value)}
                    onFocus={handleGenresFocus}
                    onBlur={handleGenresBlur}
                    placeholder='Rock, Pop, Electronic'
                    disabled={isLoading}
                    autoComplete='off'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='styles'>スタイル</Label>
                <Input
                  id='styles'
                  value={
                    isStylesFocused ? tempStyles : formData.styles.join(", ")
                  }
                  onChange={(e) => handleStylesChange(e.target.value)}
                  onFocus={handleStylesFocus}
                  onBlur={handleStylesBlur}
                  placeholder='Alternative, Indie, Synth-pop'
                  disabled={isLoading}
                  autoComplete='off'
                />
              </div>
            </div>

            <div className='space-y-3'>
              <Label>レコードコンディション</Label>
              <RadioGroup
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    condition: value as ConditionType,
                  }))
                }
                disabled={isLoading}
              >
                <div className='grid grid-cols-2 gap-3'>
                  {conditions.map((condition) => (
                    <div
                      key={condition.value}
                      className='flex items-center space-x-2'
                    >
                      <RadioGroupItem
                        value={condition.value}
                        id={condition.value}
                      />
                      <Label htmlFor={condition.value} className='text-sm'>
                        <div className='font-medium'>{condition.label}</div>
                        <div className='text-xs text-muted-foreground'>
                          {condition.description}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>価格</Label>
              <div className='flex gap-2'>
                <Input
                  id='price'
                  type='number'
                  value={formData.price || ""}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder='価格を入力（例: 1500）'
                  min='0'
                  disabled={isLoading}
                  className='flex-1'
                  autoComplete='off'
                />
                {formData.discogsReleaseId && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      fetchPriceSuggestions(formData.discogsReleaseId!)
                    }
                    disabled={isLoading || isFetchingPriceSuggestions}
                    className='whitespace-nowrap'
                    title='Discogsの市場価格を取得します（売り手プロフィール設定が必要）'
                  >
                    {isFetchingPriceSuggestions ? "取得中..." : "価格提案"}
                  </Button>
                )}
              </div>

              {formData.priceSuggestions &&
                Object.keys(formData.priceSuggestions).length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      Discogs価格提案:
                    </p>
                    <div className='grid grid-cols-2 gap-2'>
                      {Object.entries(formData.priceSuggestions).map(
                        ([condition, data]) => (
                          <div
                            key={condition}
                            className={`text-xs p-2 rounded border cursor-pointer transition-colors ${
                              formData.condition === condition
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted border-border hover:bg-muted/80"
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                price: Math.floor(data.price),
                              }));
                            }}
                          >
                            <div className='font-medium'>{condition}</div>
                            <div className='text-muted-foreground'>
                              ¥{Math.floor(data.price).toLocaleString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      価格提案をクリックすると価格が自動入力されます
                    </p>
                  </div>
                )}

              <p className='text-xs text-muted-foreground'>
                0円の場合は「FREE」と表示されます
              </p>
            </div>

            <div className='space-y-3'>
              <Label>バッジ（複数選択可）</Label>
              <div className='grid grid-cols-2 gap-3'>
                {availableBadges.map((badge) => (
                  <div
                    key={badge.value}
                    className='flex items-center space-x-2'
                  >
                    <Checkbox
                      id={badge.value}
                      checked={formData.badges.includes(badge.value)}
                      onCheckedChange={(checked) =>
                        handleBadgeChange(badge.value, checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor={badge.value} className='text-sm'>
                      <div className='font-medium'>{badge.label}</div>
                      <div className='text-xs text-muted-foreground'>
                        {badge.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='comment'>コメント</Label>
              <Textarea
                id='comment'
                value={formData.comment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder='このレコードについてのコメント...（改行可能）'
                rows={3}
                maxLength={200}
                disabled={isLoading}
                autoComplete='off'
              />
              <p className='text-xs text-muted-foreground'>
                {formData.comment.length}/200文字
              </p>
            </div>

            <DialogFooter>
              {!isEditMode && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  戻る
                </Button>
              )}
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button
                type='submit'
                disabled={
                  isLoading ||
                  !formData.title.trim() ||
                  !formData.artistName.trim()
                }
              >
                {isLoading ? "更新中..." : isEditMode ? "更新" : "ポップを作成"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
