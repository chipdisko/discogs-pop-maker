import React, { useState } from "react";
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

interface CreatePopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePopFormData) => void;
  isLoading: boolean;
}

export interface CreatePopFormData {
  discogsUrl: string;
  comment: string;
  badges: BadgeType[];
  condition: ConditionType;
  price: number;
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
}: CreatePopModalProps) {
  const [formData, setFormData] = useState<CreatePopFormData>({
    discogsUrl: "",
    comment: "",
    badges: [],
    condition: "New",
    price: 0,
  });

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

  const resetForm = () => {
    setFormData({
      discogsUrl: "",
      comment: "",
      badges: [],
      condition: "New",
      price: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>新しいポップを作成</DialogTitle>
          <DialogDescription>
            Discogs URLを入力して、レコードのポップを作成します。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Discogs URL */}
          <div className='space-y-2'>
            <Label htmlFor='discogsUrl'>Discogs URL *</Label>
            <Input
              id='discogsUrl'
              type='url'
              value={formData.discogsUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, discogsUrl: e.target.value }))
              }
              placeholder='https://www.discogs.com/release/...'
              required
              disabled={isLoading}
            />
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
            <Input
              id='price'
              type='number'
              value={formData.price || ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder='価格を入力（例: 1500）'
              min='0'
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              0円の場合は「FREE」と表示されます
            </p>
          </div>

          {/* バッジ */}
          <div className='space-y-3'>
            <Label>バッジ（複数選択可）</Label>
            <div className='grid grid-cols-2 gap-3'>
              {availableBadges.map((badge) => (
                <div key={badge.value} className='flex items-center space-x-2'>
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
              disabled={isLoading || !formData.discogsUrl.trim()}
            >
              {isLoading ? "作成中..." : "ポップを作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
