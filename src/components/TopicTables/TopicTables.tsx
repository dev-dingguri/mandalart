import Table from 'components/Table/Table';
import TopicTable from 'components/TopicTable/TopicTable';
import { TopicNode } from 'types/TopicNode';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from 'constants/constants';

export type TopicTablesProps = {
  focusedIdx?: number;
  getTopicNode: (tableIdx: number, tableItemIdx: number) => TopicNode;
  onShowTopicEditor: (tableIdx: number, tableItemIdx: number) => void;
};

const TopicTables = ({
  focusedIdx,
  getTopicNode,
  onShowTopicEditor,
}: TopicTablesProps) => {
  const isFocused = (tableIdx: number): boolean => {
    return focusedIdx === tableIdx;
  };

  return (
    <Table
      rowSize={TABLE_ROW_SIZE}
      colSize={TABLE_COL_SIZE}
      cellGenerater={(tableIdx) => (
        <TopicTable
          tableIdx={tableIdx}
          isFocused={isFocused(tableIdx)}
          getTopicNode={(tableItemIdx) => getTopicNode(tableIdx, tableItemIdx)}
          onShowTopicEditor={(tableItemIdx) =>
            onShowTopicEditor(tableIdx, tableItemIdx)
          }
        />
      )}
      space="4px"
    ></Table>
  );
};

export default TopicTables;
