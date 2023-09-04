import React from 'react';
import List, { ListProps } from '@mui/material/List';
import { Snippet } from 'types/Snippet';
import MandalartListItem from 'components/MandalartListItem/MandalartListItem';

type MandalartListProps = {
  snippetMap: Map<string, Snippet>;
  selectedId: string | null;
  onItemSelect: (mandalartId: string) => void;
  onItemDelete: (mandalartId: string) => void;
  onItemReset: (mandalartId: string) => void;
  onItemRename: (mandalartId: string, name: string) => void;
} & Omit<ListProps, 'onSelect' | 'onReset'>;

const MandalartList = ({
  snippetMap,
  selectedId,
  onItemSelect,
  onItemDelete,
  onItemReset,
  onItemRename,
  ...listProps
}: MandalartListProps) => {
  return (
    <List {...listProps} disablePadding>
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
    </List>
  );
};

export default MandalartList;
