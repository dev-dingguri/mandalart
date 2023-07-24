import React from 'react';
import List from '@mui/material/List';
import { Snippet } from 'types/Snippet';
import styles from './MandalartList.module.css';

import MandalartListItem from 'components/MandalartListItem/MandalartListItem';

type MandalartListProps = {
  snippetMap: Map<string, Snippet>;
  selectedId: string | null;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onReset: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

const MandalartList = ({
  snippetMap,
  selectedId,
  onSelect,
  onDelete,
  onReset,
  onRename,
}: MandalartListProps) => {
  return (
    <List className={styles.list}>
      {Array.from(snippetMap)
        .reverse()
        .map(([mandalartId, snippet]) => (
          <MandalartListItem
            key={mandalartId}
            mandalartId={mandalartId}
            snippet={snippet}
            isSelected={selectedId === mandalartId}
            onSelect={onSelect}
            onDelete={onDelete}
            onReset={onReset}
            onRename={onRename}
          />
        ))}
    </List>
  );
};

export default MandalartList;
