import React from 'react';
import Table from '../table/Table';
import TopicTable from '../topicTable/TopicTable';

type TopicTablesProps = {
  rowSize: number;
  colSize: number;
  getTopics: (tableIdx: number) => string[];
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    tableIdx: number,
    tableItemIdx: number
  ) => void;
};

const TopicTables = ({
  rowSize,
  colSize,
  getTopics,
  onChange,
}: TopicTablesProps) => {
  return (
    <Table
      rowSize={rowSize}
      colSize={colSize}
      itemGenerator={(tableIdx) => {
        return (
          <TopicTable
            key={tableIdx}
            topics={getTopics(tableIdx)}
            rowSize={rowSize}
            colSize={colSize}
            onChange={(ev, tableItemIdx) =>
              onChange(ev, tableIdx, tableItemIdx)
            }
          />
        );
      }}
    ></Table>
  );
};

export default TopicTables;
