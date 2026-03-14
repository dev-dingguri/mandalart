import { Snippet } from 'types/Snippet';
import MandalartListItem from 'components/MandalartListItem';

type MandalartListProps = {
  snippetMap: Map<string, Snippet>;
  selectedId: string | null;
  onItemSelect: (mandalartId: string) => void;
  onItemDelete: (mandalartId: string) => void;
  onItemReset: (mandalartId: string) => void;
  onItemRename: (mandalartId: string, name: string) => void;
  className?: string;
};

const MandalartList = ({
  snippetMap,
  selectedId,
  onItemSelect,
  onItemDelete,
  onItemReset,
  onItemRename,
  className,
}: MandalartListProps) => {
  return (
    <div className={className}>
      {Array.from(snippetMap)
        .reverse()
        .map(([mandalartId, snippet]) => (
          <MandalartListItem
            key={mandalartId}
            mandalartId={mandalartId}
            snippet={snippet}
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
