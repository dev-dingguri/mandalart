import { useEffect, useRef } from 'react';
import Table from '../table/Table';
import TopicInput from '../topicInput/TopicInput';
import styles from './TopicTable.module.css';

export type TopicTableViewType = 'normal' | 'focus' | 'blur';

type TopicTableProps = {
  topics: string[];
  rowSize: number;
  colSize: number;
  viewType: TopicTableViewType;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
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
  topics,
  rowSize,
  colSize,
  viewType,
  onChange,
  onClick,
}: TopicTableProps) => {
  const topicTableRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (viewType === 'focus' && topicTableRef.current) {
      topicTableRef.current.scrollIntoView({
        behavior: loaded.current ? 'smooth' : 'auto',
        block: 'center',
        inline: 'center',
      });
    }
    loaded.current = true;
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
            topic={topics[idx]}
            onChange={(ev) => onChange(ev, idx)}
            onClick={() => onClick(idx)}
          />
        )}
      ></Table>
    </div>
  );
};

TopicTable.defaultProps = {
  viewType: 'normal',
};

export default TopicTable;
