import Table from 'components/table/Table';
import TopicTable from 'components/topicTable/TopicTable';
import { TopicNode } from 'types/TopicNode';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from 'constants/constants';

export type TopicTablesProps = {
  focusedIdx?: number;
  getTopicNode: (tableIdx: number, tableItemIdx: number) => TopicNode;
  onTopicClick: (tableIdx: number, tableItemIdx: number) => void;
};

const TopicTables = ({
  focusedIdx,
  getTopicNode,
  onTopicClick,
}: TopicTablesProps) => {
  const isFocused = (tableIdx: number): boolean => {
    return focusedIdx === tableIdx;
  };

  return (
    <Table
      rowSize={TABLE_ROW_SIZE}
      colSize={TABLE_COL_SIZE}
      itemGenerator={(tableIdx) => (
        <TopicTable
          key={tableIdx}
          tableIdx={tableIdx}
          isFocused={isFocused(tableIdx)}
          getTopicNode={(tableItemIdx) => getTopicNode(tableIdx, tableItemIdx)}
          onTopicClick={(tableItemIdx) => onTopicClick(tableIdx, tableItemIdx)}
        />
      )}
      space="4px"
    ></Table>
  );
};

export default TopicTables;
