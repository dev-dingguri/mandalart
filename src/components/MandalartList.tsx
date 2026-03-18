import { MandalartMeta } from '@/types';
import MandalartListItem from '@/components/MandalartListItem';

type MandalartListProps = {
  metaMap: Map<string, MandalartMeta>;
  selectedId: string | null;
  onItemSelect: (mandalartId: string) => void;
  onItemDelete: (mandalartId: string) => void;
  onItemReset: (mandalartId: string) => void;
  onItemRename: (mandalartId: string, name: string) => void;
  className?: string;
};

const MandalartList = ({
  metaMap,
  selectedId,
  onItemSelect,
  onItemDelete,
  onItemReset,
  onItemRename,
  className,
}: MandalartListProps) => {
  return (
    <div className={className}>
      {Array.from(metaMap)
        .reverse()
        .map(([mandalartId, meta]) => (
          <MandalartListItem
            key={mandalartId}
            mandalartId={mandalartId}
            meta={meta}
            isSelected={selectedId === mandalartId}
            onSelect={onItemSelect}
            onDelete={onItemDelete}
            onReset={onItemReset}
            onRename={onItemRename}
          />
        ))}
    </div>
  );
};

export default MandalartList;
