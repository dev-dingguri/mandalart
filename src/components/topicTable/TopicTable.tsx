import Table from '../table/Table';
import TopicInput from '../topicInput/TopicInput';

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
  );
};

export default TopicTable;
