import type { PopResponse } from "@/src/application";
import PopCard from "./PopCard";

interface PopGridProps {
  pops: PopResponse[];
  selectedPopIds: string[];
  newlyCreatedPopIds: string[];
  isLoading: boolean;
  onToggleSelection: (popId: string) => void;
  onStartEdit: (pop: PopResponse) => void;
  onDelete: (popId: string) => void;
}

export default function PopGrid({
  pops,
  selectedPopIds,
  newlyCreatedPopIds,
  isLoading,
  onToggleSelection,
  onStartEdit,
  onDelete,
}: PopGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {pops.map((pop) => (
        <PopCard
          key={pop.id}
          pop={pop}
          isSelected={selectedPopIds.includes(pop.id)}
          isNewlyCreated={newlyCreatedPopIds.includes(pop.id)}
          onToggleSelection={onToggleSelection}
          onStartEdit={onStartEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
