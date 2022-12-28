import { useEffect, useRef } from 'react';
import Table from 'components/Table/Table';
import TopicItem from 'components/TopicItem/TopicItem';
import { TopicNode } from 'types/TopicNode';
import styles from './TopicTable.module.css';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from 'constants/constants';

type TopicTableProps = {
  onIsAccented: (tableItemIdx: number) => boolean;
  onGetTopic: (tableItemIdx: number) => TopicNode;
  onUpdateTopic: (tableItemIdx: number, text: string) => void;
  onCanEdit?: () => boolean;
  onSyncFocuse?: (
    scrollInto: (options?: ScrollIntoViewOptions) => void
  ) => void;
  onUpdateFocuse?: () => void;
};

const TopicTable = ({
  onIsAccented,
  onGetTopic,
  onUpdateTopic,
  onCanEdit = () => true,
  onSyncFocuse,
  onUpdateFocuse,
}: TopicTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSyncFocuse) return;

    return onSyncFocuse((options) => {
      const topicTable = tableRef.current!;
      scrollIntoView(topicTable, options);
    });
  }, [onSyncFocuse]);

  return (
    <div ref={tableRef} className={styles.topicTable}>
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        cellGenerater={(tableItemIdx) => (
          <TopicItem
            key={tableItemIdx}
            topic={onGetTopic(tableItemIdx).text}
            isAccented={onIsAccented(tableItemIdx)}
            canEdit={onCanEdit()}
            onUpdateTopic={(text) => onUpdateTopic(tableItemIdx, text)}
            onUpdateFocuse={onUpdateFocuse}
          />
        )}
        space="2px"
      />
    </div>
  );
};

export default TopicTable;
