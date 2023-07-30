import { useEffect, useRef } from 'react';
import ItemGrid from 'components/ItemGrid/ItemGrid';
import TopicItem from 'components/TopicItem/TopicItem';
import { TopicNode } from 'types/TopicNode';
import styles from './TopicGrid.module.css';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from 'constants/constants';

type TopicGridProps = {
  onIsAccented: (gridItemIdx: number) => boolean;
  onGetTopic: (gridItemIdx: number) => TopicNode;
  onUpdateTopic: (gridItemIdx: number, text: string) => void;
  onCanEdit?: () => boolean;
  onSyncFocuse?: (
    scrollInto: (options?: ScrollIntoViewOptions) => void
  ) => void;
  onUpdateFocuse?: () => void;
};

const TopicGrid = ({
  onIsAccented,
  onGetTopic,
  onUpdateTopic,
  onCanEdit = () => true,
  onSyncFocuse,
  onUpdateFocuse,
}: TopicGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSyncFocuse) return;

    return onSyncFocuse((options) => {
      const topicItemGrid = gridRef.current!;
      scrollIntoView(topicItemGrid, options);
    });
  }, [onSyncFocuse]);

  return (
    <div ref={gridRef} className={styles.topicItemGrid}>
      <ItemGrid
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        createItem={(gridItemIdx) => (
          <TopicItem
            key={gridItemIdx}
            topic={onGetTopic(gridItemIdx).text}
            isAccented={onIsAccented(gridItemIdx)}
            canEdit={onCanEdit()}
            onUpdateTopic={(text) => onUpdateTopic(gridItemIdx, text)}
            onUpdateFocuse={onUpdateFocuse}
          />
        )}
        spacing="2px"
      />
    </div>
  );
};

export default TopicGrid;
