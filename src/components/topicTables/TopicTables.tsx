import Table from '../table/Table';
import TopicTable, { TopicTableViewType } from '../topicTable/TopicTable';
import { TopicNode } from '../../type/TopicNode';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from '../../common/const';

export type TopicTablesProps = {
  focusedIdx?: number;
  getTopicNode: (tableIdx: number, tableItemIdx: number) => TopicNode;
  onClick: (tableIdx: number, tableItemIdx: number) => void;
};

const TopicTables = ({
  focusedIdx,
  getTopicNode,
  onClick,
}: TopicTablesProps) => {
  const getViewType = (tableIdx: number): TopicTableViewType => {
    if (focusedIdx === undefined) {
      return 'normal';
    }
    return focusedIdx === tableIdx ? 'focus' : 'blur';
  };

  return (
    <Table
      rowSize={TABLE_ROW_SIZE}
      colSize={TABLE_COL_SIZE}
      itemGenerator={(tableIdx) => (
        <TopicTable
          key={tableIdx}
          getTopicNode={(tableItemIdx) => getTopicNode(tableIdx, tableItemIdx)}
          viewType={getViewType(tableIdx)}
          onClick={(tableItemIdx) => onClick(tableIdx, tableItemIdx)}
        />
      )}
    ></Table>
  );
};

export default TopicTables;
