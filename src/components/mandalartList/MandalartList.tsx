import React from 'react';
import { MandalartMetadata } from '../../type/MandalartMetadata';
import styles from './MandalartList.module.css';
import MandalartListItem from '../mandalartListItem/MandalartListItem';

type MandalartListProps = {
  metadataMap: Map<string, MandalartMetadata>;
  selectedId: string;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

const MandalartList = ({
  metadataMap,
  selectedId,
  onSelect,
  onDelete,
  onRename,
}: MandalartListProps) => {
  const items: JSX.Element[] = [];
  metadataMap.forEach((metadata, mandalartId) =>
    items.push(
      <MandalartListItem
        key={mandalartId}
        metadata={metadata}
        isSelected={selectedId === mandalartId}
        onSelect={() => onSelect(mandalartId)}
        onDelete={() => onDelete(mandalartId)}
        onRename={(name) => onRename(mandalartId, name)}
      />
    )
  );
  items.reverse();

  return <ul className={styles.list}>{items}</ul>;
};

export default MandalartList;
