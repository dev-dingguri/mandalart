import Table from '../table/Table';
import TopicInput from '../topicInput/TopicInput';
import styles from './TopicTable.module.css';

type TopicTableProps = {
  topics: string[];
  rowSize: number;
  colSize: number;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
};

const TopicTable = ({
  topics,
  rowSize,
  colSize,
  onChange,
}: TopicTableProps) => {
  return (
    <div className={styles.topicTable}>
      {
        <Table
          rowSize={rowSize}
          colSize={colSize}
          itemGenerator={(idx) => {
            return (
              <TopicInput
                key={idx}
                topic={topics[idx]}
                onChange={(ev) => onChange(ev, idx)}
              />
            );
          }}
        ></Table>
      }
    </div>
  );
};

export default TopicTable;
