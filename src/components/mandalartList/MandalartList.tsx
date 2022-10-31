import React from 'react';
import { MandalartMetadata } from 'types/MandalartMetadata';
import styles from './MandalartList.module.css';
import MandalartListItem from 'components/mandalartListItem/MandalartListItem';

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
  const items = Array.from(metadataMap)
    .reverse()
    .map(([mandalartId, metadata]) => (
      <MandalartListItem
        key={mandalartId}
        metadata={metadata}
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
