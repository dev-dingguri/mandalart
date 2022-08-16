import React from 'react';
import Table from '../table/Table';
import TopicTable, { TopicTableViewType } from '../topicTable/TopicTable';
import { TopicNode } from '../../type/TopicNode';

export type TopicTablesProps = {
  rowSize: number;
  colSize: number;
  focusedTableIdx?: number;
  getTopicNode: (tableIdx: number, tableItemIdx: number) => TopicNode;
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    tableIdx: number,
    tableItemIdx: number
  ) => void;
  onClick: (tableIdx: number, tableItemIdx: number) => void;
};

const TopicTables = ({
  rowSize,
  colSize,
  focusedTableIdx,
  getTopicNode,
  onChange,
  onClick,
}: TopicTablesProps) => {
  const getViewType = (tableIdx: number): TopicTableViewType => {
    if (focusedTableIdx === undefined) {
      return 'normal';
    }
    return focusedTableIdx === tableIdx ? 'focus' : 'blur';
  };

  return (
    <Table
      rowSize={rowSize}
      colSize={colSize}
      itemGenerator={(tableIdx) => (
        <TopicTable
          key={tableIdx}
          getTopicNode={(tableItemIdx) => getTopicNode(tableIdx, tableItemIdx)}
          rowSize={rowSize}
          colSize={colSize}
          viewType={getViewType(tableIdx)}
          onChange={(ev, tableItemIdx) => onChange(ev, tableIdx, tableItemIdx)}
          onClick={(tableItemIdx) => onClick(tableIdx, tableItemIdx)}
        />
      )}
    ></Table>
  );
};

export default TopicTables;
