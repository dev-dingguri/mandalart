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
  onClick: (idx: number) => void;
};

const getClassName = (viewType: TopicTableViewType) => {
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

const TopicTable = ({
  viewType = 'normal',
  getTopicNode,
  onClick,
}: TopicTableProps) => {
  const topicTableRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (viewType === 'focus' && topicTableRef.current) {
      scrollIntoView(topicTableRef.current, {
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
      className={`${styles.topicTable} ${getClassName(viewType)}`}
    >
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        itemGenerator={(idx) => (
          <TopicItem
            key={idx}
            topic={getTopicNode(idx).text}
            onClick={() => onClick(idx)}
          />
        )}
      ></Table>
    </div>
  );
};

export default TopicTable;
