import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from '../../const';
import Table from '../table/Table';
import TopicInput from '../topicInput/TopicInput';
import styles from './TopicTable.module.css';

type TopicTableProps = {
  topics: string[];
  onChange: (ev: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
};

const TopicTable = ({ topics, onChange }: TopicTableProps) => {
  return (
    <div className={styles.topicTable}>
      {
        <Table
          rowSize={TABLE_ROW_SIZE}
          colSize={TABLE_COL_SIZE}
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
