import type { PopResponse } from "@/src/application";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PopListHeader from "./PopListHeader";
import PopGrid from "./PopGrid";

interface PopListSectionProps {
  pops: PopResponse[];
  selectedPopIds: string[];
  newlyCreatedPopIds: string[];
  isLoading: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelection: (popId: string) => void;
  onStartEdit: (pop: PopResponse) => void;
  onDelete: (popId: string) => void;
  onOpenPrintPreview: () => void;
}

export default function PopListSection({
  pops,
  selectedPopIds,
  newlyCreatedPopIds,
  isLoading,
  onSelectAll,
  onDeselectAll,
  onToggleSelection,
  onStartEdit,
  onDelete,
  onOpenPrintPreview,
}: PopListSectionProps) {
  if (pops.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <PopListHeader
          popCount={pops.length}
          selectedCount={selectedPopIds.length}
          isLoading={isLoading}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onOpenPrintPreview={onOpenPrintPreview}
        />
      </CardHeader>
      <CardContent>
        <PopGrid
          pops={pops}
          selectedPopIds={selectedPopIds}
          newlyCreatedPopIds={newlyCreatedPopIds}
          isLoading={isLoading}
          onToggleSelection={onToggleSelection}
          onStartEdit={onStartEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}
