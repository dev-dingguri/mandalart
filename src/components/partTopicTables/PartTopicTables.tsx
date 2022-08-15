import React, { useState } from 'react';
import TopicTables, { TopicTablesProps } from '../topicTables/TopicTables';
import styles from './PartTopicTables.module.css';

type PartTopicTablesProps = Omit<TopicTablesProps, 'focusedTableIdx'> & {
  initialFocusedTableIdx: number;
};

const PartTopicTables = ({
  initialFocusedTableIdx,
  ...props
}: PartTopicTablesProps) => {
  const [focusedTableIdx, setFocusedTableIdx] = useState(
    initialFocusedTableIdx
  );

  const handleClick = (tableIdx: number, tableItemIdx: number) => {
    if (tableIdx !== focusedTableIdx) {
      setFocusedTableIdx(tableIdx);
    } else {
      props.onClick(tableIdx, tableItemIdx);
    }
  };

  return (
    <div className={styles.partTopicTables}>
      <TopicTables
        {...props}
        onClick={handleClick}
        focusedTableIdx={focusedTableIdx}
      />
    </div>
  );
};

export default PartTopicTables;
