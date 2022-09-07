import { useEffect, useRef } from 'react';
import Table from '../table/Table';
import TopicItem from '../topicItem/TopicItem';
import { TopicNode } from '../../type/TopicNode';
import styles from './TopicTable.module.css';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from '../../common/const';

export type TopicTableViewType = 'normal' | 'focus' | 'blur';

type TopicTableProps = {
  viewType?: TopicTableViewType;
  getTopicNode: (idx: number) => TopicNode;
  onTopicClick: (idx: number) => void;
};

const TopicTable = ({
  viewType = 'normal',
  getTopicNode,
  onTopicClick,
}: TopicTableProps) => {
  const topicTableRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const getClassName = () => {
    switch (viewType) {
      case 'normal':
        return styles.normal;
      case 'focus':
        return styles.focus;
      case 'blur':
        return styles.blur;
      default:
        throw new Error(`not support viewType: ${viewType}`);
    }
  };

  useEffect(() => {
    const topicTable = topicTableRef.current!;
    if (viewType === 'focus') {
      scrollIntoView(topicTable, {
        behavior: loadedRef.current ? 'smooth' : 'auto',
        block: 'center',
        inline: 'center',
      });
    }
    loadedRef.current = true;
  }, [viewType]);

  return (
    <div
      ref={topicTableRef}
      className={`${styles.topicTable} ${getClassName()}`}
    >
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        itemGenerator={(idx) => (
          <TopicItem
            key={idx}
            topic={getTopicNode(idx).text}
            onClick={() => onTopicClick(idx)}
          />
        )}
      ></Table>
    </div>
  );
};

export default TopicTable;
