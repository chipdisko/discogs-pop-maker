import React, { useState, useEffect } from "react";
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
import type { BadgeType, ConditionType } from "../../src/domain";
import type { ReleaseResponse } from "../../src/application";
import type {
  DiscogsReleaseData,
  PriceSuggestion,
  DiscogsPriceSuggestionsData,
} from "../../src/infrastructure/external/DiscogsApiTypes";

interface CreatePopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePopFormData) => void;
  isLoading: boolean;
  // 編集モード用のプロパティ
  isEditMode?: boolean;
  initialData?: CreatePopFormData;
}

export interface CreatePopFormData {
  // Step 1: URL入力
  discogsUrl?: string;

  // Step 2: リリース情報（Discogsデータ + ユーザー編集）
  title: string;
  artistName: string;
  label: string;
  country: string;
  releaseDate: string;
  genres: string[];
  styles: string[];

  // Step 2: ユーザー入力
  comment: string;
  badges: BadgeType[];
  condition: ConditionType;
  price: number;

  // 価格提案データ
  priceSuggestions?: DiscogsPriceSuggestionsData;
  discogsReleaseId?: string;
}

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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [discogsData, setDiscogsData] = useState<ReleaseResponse | null>(null);
  const [isFetchingDiscogs, setIsFetchingDiscogs] = useState(false);
  const [isFetchingPriceSuggestions, setIsFetchingPriceSuggestions] =
    useState(false);

  const [formData, setFormData] = useState<CreatePopFormData>({
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
  });

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData(initialData);
      setCurrentStep(2); // 編集モードは直接Step 2から開始
    }
  }, [isEditMode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBadgeChange = (badge: BadgeType, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      badges: checked
        ? [...prev.badges, badge]
        : prev.badges.filter((b) => b !== badge),
    }));
  };

  const handlePriceChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, price: numValue }));
  };

  // 価格提案を取得
  const fetchPriceSuggestions = async (releaseId: string) => {
    setIsFetchingPriceSuggestions(true);
    try {
      const response = await fetch("/api/discogs/price-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ releaseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn("価格提案取得エラー:", errorData.error);

        // エラーの詳細をログに出力
        if (errorData.details) {
          console.warn("エラー詳細:", errorData.details);
        }

        // エラーは静かに処理（価格提案は必須ではない）
        return;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.warn("無効な価格提案レスポンス形式");
        return;
      }

      // 価格提案データを変換
      const priceSuggestions: DiscogsPriceSuggestionsData = {};
      result.data.forEach((suggestion: PriceSuggestion) => {
        priceSuggestions[suggestion.condition] = {
          price: suggestion.price,
          currency: suggestion.currency,
        };
      });

      // フォームデータに価格提案を設定
      setFormData((prev) => ({
        ...prev,
        priceSuggestions,
      }));

      console.log("価格提案を取得しました:", priceSuggestions);
    } catch (error) {
      console.error("価格提案取得エラー:", error);
      // エラーは静かに処理（価格提案は必須ではない）
    } finally {
      setIsFetchingPriceSuggestions(false);
    }
  };

  // Discogsデータを取得
  const fetchDiscogsData = async (url: string) => {
    setIsFetchingDiscogs(true);
    try {
      const response = await fetch("/api/discogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // DiscogsデータをReleaseResponse形式に変換
      const releaseData = result.data;
      const discogsResponse: ReleaseResponse = {
        discogsId: releaseData.id?.toString() || "",
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

      // フォームデータにDiscogsデータを設定
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

      // 価格提案も同時に取得
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

  // アーティスト名を抽出
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

  // レーベル情報を抽出
  const extractLabel = (data: DiscogsReleaseData): string => {
    if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
      return data.labels.map((label) => label.name).join(", ");
    }
    return "";
  };

  // リリース日を抽出
  const extractReleaseDate = (data: DiscogsReleaseData): string => {
    if (data.released) return data.released;
    if (data.year) return data.year.toString();
    return "";
  };

  // リリース年を抽出
  const extractReleaseYear = (data: DiscogsReleaseData): string => {
    if (data.year) return data.year.toString();
    if (data.released) return data.released.split("-")[0];
    return "";
  };

  const resetForm = () => {
    setFormData({
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
    });
    setCurrentStep(1);
    setDiscogsData(null);
    setIsFetchingDiscogs(false);
    setIsFetchingPriceSuggestions(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
            {/* Step 1: URL入力 */}
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
                  onClick={() => {
                    // 手動入力用に空のフォームデータを設定
                    setFormData((prev) => ({
                      ...prev,
                      title: "",
                      artistName: "",
                      label: "",
                      country: "",
                      releaseDate: "",
                      genres: [],
                      styles: [],
                    }));
                    setCurrentStep(2);
                  }}
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
            {/* Step 2: リリース情報編集 */}
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
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='genres'>ジャンル</Label>
                  <Input
                    id='genres'
                    value={formData.genres.join(", ")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        genres: e.target.value
                          .split(",")
                          .map((g) => g.trim())
                          .filter((g) => g),
                      }))
                    }
                    placeholder='Rock, Pop, Electronic'
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='styles'>スタイル</Label>
                <Input
                  id='styles'
                  value={formData.styles.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      styles: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    }))
                  }
                  placeholder='Alternative, Indie, Synth-pop'
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* コンディション */}
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

            {/* 価格 */}
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

              {/* 価格提案表示 */}
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
                                price: Math.floor(data.price), // 価格のみを更新（コンディションは変更しない）
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

            {/* バッジ */}
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

            {/* コメント */}
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
