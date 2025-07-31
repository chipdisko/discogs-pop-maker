import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

interface PopListHeaderProps {
  popCount: number;
  selectedCount: number;
  isLoading: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onGeneratePrint: () => void;
}

export default function PopListHeader({
  popCount,
  selectedCount,
  isLoading,
  onSelectAll,
  onDeselectAll,
  onGeneratePrint,
}: PopListHeaderProps) {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-4'>
        <CardTitle>作成済みポップ ({popCount}個)</CardTitle>
        <div className='flex gap-2'>
          <Button
            onClick={onSelectAll}
            disabled={isLoading}
            variant='outline'
            size='sm'
          >
            全て選択
          </Button>
          {selectedCount > 0 && (
            <Button
              onClick={onDeselectAll}
              disabled={isLoading}
              variant='outline'
              size='sm'
            >
              選択解除
            </Button>
          )}
        </div>
      </div>
      {selectedCount > 0 && (
        <Button
          onClick={onGeneratePrint}
          disabled={isLoading}
          variant='secondary'
        >
          選択したポップを印刷 ({selectedCount}個)
        </Button>
      )}
    </div>
  );
}
