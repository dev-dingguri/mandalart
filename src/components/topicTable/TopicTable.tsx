import { useEffect, useRef } from 'react';
import Table from '../table/Table';
import TopicInput from '../topicInput/TopicInput';
import { TopicNode } from '../../type/TopicNode';
import styles from './TopicTable.module.css';

export type TopicTableViewType = 'normal' | 'focus' | 'blur';

type TopicTableProps = {
  rowSize: number;
  colSize: number;
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
  rowSize,
  colSize,
  viewType = 'normal',
  getTopicNode,
  onClick,
}: TopicTableProps) => {
  const topicTableRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (viewType === 'focus' && topicTableRef.current) {
      topicTableRef.current.scrollIntoView({
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
        rowSize={rowSize}
        colSize={colSize}
        itemGenerator={(idx) => (
          <TopicInput
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
