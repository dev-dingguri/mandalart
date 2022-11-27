import React from 'react';
import { Snippet } from 'types/Snippet';
import styles from './MandalartList.module.css';
import MandalartListItem from 'components/mandalartListItem/MandalartListItem';

type MandalartListProps = {
  snippetMap: Map<string, Snippet>;
  selectedId: string | null;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

const MandalartList = ({
  snippetMap,
  selectedId,
  onSelect,
  onDelete,
  onRename,
}: MandalartListProps) => {
  const items = Array.from(snippetMap)
    .reverse()
    .map(([mandalartId, snippet]) => (
      <MandalartListItem
        key={mandalartId}
        snippet={snippet}
        isSelected={selectedId === mandalartId}
        onSelect={() => onSelect(mandalartId)}
        onDelete={() => onDelete(mandalartId)}
        onRename={(name) => onRename(mandalartId, name)}
      />
    ));

  return (
    <div className={styles.scrollArea}>
      <ul className={styles.list}>{items}</ul>
    </div>
  );
};

export default MandalartList;
