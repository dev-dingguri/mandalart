import { useEffect, useRef } from 'react';
import Table from 'components/table/Table';
import TopicItem from 'components/topicItem/TopicItem';
import { TopicNode } from 'types/TopicNode';
import styles from './TopicTable.module.css';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import {
  TABLE_ROW_SIZE,
  TABLE_COL_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';

type TopicTableProps = {
  tableIdx: number;
  isFocused?: boolean;
  getTopicNode: (idx: number) => TopicNode;
  onShowTopicEditor: (idx: number) => void;
};

const TopicTable = ({
  tableIdx,
  isFocused = false,
  getTopicNode,
  onShowTopicEditor: onTopicClick,
}: TopicTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  const isAccent = (tableItemIdx: number) => {
    if (tableIdx === TABLE_CENTER_IDX) {
      return tableItemIdx !== TABLE_CENTER_IDX;
    } else {
      return tableItemIdx === TABLE_CENTER_IDX;
    }
  };

  useEffect(() => {
    const scrollCenterIfFocus = (behavior: ScrollBehavior) => {
      if (isFocused) {
        const topicTable = tableRef.current!;
        scrollIntoView(topicTable, {
          behavior: behavior,
          block: 'center',
          inline: 'center',
        });
      }
    };
    const handleResize = () => scrollCenterIfFocus('auto');

    scrollCenterIfFocus(isLoadedRef.current ? 'smooth' : 'auto');
    isLoadedRef.current = true;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFocused]);

  return (
    <div ref={tableRef} className={styles.topicTable}>
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        itemGenerator={(idx) => (
          <TopicItem
            key={idx}
            topic={getTopicNode(idx).text}
            isAccented={isAccent(idx)}
            onShowTopicEditor={() => onTopicClick(idx)}
          />
        )}
        space="2px"
      ></Table>
    </div>
  );
};

export default TopicTable;
