import React, { useRef, useState, TouchEvent } from 'react';
import TopicTables, { TopicTablesProps } from '../topicTables/TopicTables';
import styles from './PartTopicTables.module.css';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from '../../common/const';

type PartTopicTablesProps = Omit<TopicTablesProps, 'focusedTableIdx'>;

const PartTopicTables = ({ ...props }: PartTopicTablesProps) => {
  const [focusedTableIdx, setFocusedTableIdx] = useState(TABLE_CENTER_IDX);
  const partTopicTablesRef = useRef<HTMLDivElement>(null);

  let startY = 0;
  let startX = 0;
  let startTop = 0;
  let startLeft = 0;

  const handleClick = (tableIdx: number, tableItemIdx: number) => {
    if (tableIdx !== focusedTableIdx) {
      setFocusedTableIdx(tableIdx);
    } else {
      props.onClick(tableIdx, tableItemIdx);
    }
  };

  const handleTouchStart = (ev: TouchEvent) => {
    startY = ev.changedTouches[0].pageY;
    startX = ev.changedTouches[0].pageX;
    if (partTopicTablesRef.current) {
      startTop = partTopicTablesRef.current.scrollTop;
      startLeft = partTopicTablesRef.current.scrollLeft;
    }
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    const endY = ev.changedTouches[0].pageY;
    const endX = ev.changedTouches[0].pageX;

    let newFocusedTableIdx = focusedTableIdx;
    const baseline = 70;
    // 아래로 이동
    if (endY - startY < -baseline) {
      if (newFocusedTableIdx + TABLE_COL_SIZE < TABLE_SIZE) {
        newFocusedTableIdx += TABLE_COL_SIZE;
      }
    }
    // 위로 이동
    if (endY - startY > baseline) {
      if (newFocusedTableIdx - TABLE_COL_SIZE >= 0) {
        newFocusedTableIdx -= TABLE_COL_SIZE;
      }
    }
    // 오른쪽으로 이동
    if (endX - startX < -baseline) {
      if (newFocusedTableIdx % TABLE_COL_SIZE !== TABLE_COL_SIZE - 1) {
        newFocusedTableIdx += 1;
      }
    }
    // 왼쪽으로 이동
    if (endX - startX > baseline) {
      if (newFocusedTableIdx % TABLE_COL_SIZE !== 0) {
        newFocusedTableIdx -= 1;
      }
    }
    if (focusedTableIdx === newFocusedTableIdx) {
      partTopicTablesRef.current?.scroll({
        top: startTop,
        left: startLeft,
        behavior: 'smooth',
      });
    } else {
      setFocusedTableIdx(newFocusedTableIdx);
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    const moveY = -(ev.changedTouches[0].pageY - startY);
    const moveX = -(ev.changedTouches[0].pageX - startX);

    partTopicTablesRef.current?.scroll({
      top: startTop + moveY,
      left: startLeft + moveX,
      behavior: 'auto',
    });
  };

  return (
    <div
      ref={partTopicTablesRef}
      className={styles.partTopicTables}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className={styles.container}>
        <TopicTables
          {...props}
          focusedTableIdx={focusedTableIdx}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default PartTopicTables;
