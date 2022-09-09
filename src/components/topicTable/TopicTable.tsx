import { useEffect, useRef } from 'react';
import Table from '../table/Table';
import TopicItem from '../topicItem/TopicItem';
import { TopicNode } from '../../type/TopicNode';
import styles from './TopicTable.module.css';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import {
  TABLE_ROW_SIZE,
  TABLE_COL_SIZE,
  TABLE_CENTER_IDX,
} from '../../common/const';

type TopicTableProps = {
  tableIdx: number;
  isFocused?: boolean;
  getTopicNode: (idx: number) => TopicNode;
  onTopicClick: (idx: number) => void;
};

const TopicTable = ({
  tableIdx,
  isFocused = false,
  getTopicNode,
  onTopicClick,
}: TopicTableProps) => {
  const topicTableRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

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
        const topicTable = topicTableRef.current!;
        scrollIntoView(topicTable, {
          behavior: behavior,
          block: 'center',
          inline: 'center',
        });
      }
    };
    const handleResize = () => scrollCenterIfFocus('auto');

    scrollCenterIfFocus(loadedRef.current ? 'smooth' : 'auto');
    loadedRef.current = true;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFocused]);

  return (
    <div ref={topicTableRef} className={styles.topicTable}>
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        itemGenerator={(idx) => (
          <TopicItem
            key={idx}
            topic={getTopicNode(idx).text}
            isAccent={isAccent(idx)}
            onClick={() => onTopicClick(idx)}
          />
        )}
        space="2px"
      ></Table>
    </div>
  );
};

export default TopicTable;
