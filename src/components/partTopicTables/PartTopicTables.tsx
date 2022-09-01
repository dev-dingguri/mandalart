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
  let startTime: Date;

  const handleClick = (tableIdx: number, tableItemIdx: number) => {
    if (tableIdx !== focusedTableIdx) {
      setFocusedTableIdx(tableIdx);
    } else {
      props.onClick(tableIdx, tableItemIdx);
    }
  };

  const handleTouchStart = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    startY = ev.changedTouches[0].pageY;
    startX = ev.changedTouches[0].pageX;
    startTop = partTopicTablesRef.current.scrollTop;
    startLeft = partTopicTablesRef.current.scrollLeft;
    startTime = new Date();
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    const endY = ev.changedTouches[0].pageY;
    const endX = ev.changedTouches[0].pageX;
    const baseline = partTopicTablesRef.current.clientWidth * 0.35;
    const weight = Math.max(
      (500 - (Date.now() - startTime.getTime())) * 0.1, // 500ms안에 스와이프가 끝나면 가중치 적용
      1
    );
    const moveY = (endY - startY) * weight;
    const moveX = (endX - startX) * weight;

    let newFocusedTableIdx = focusedTableIdx;
    // 아래로 이동
    if (moveY < -baseline) {
      if (newFocusedTableIdx + TABLE_COL_SIZE < TABLE_SIZE) {
        newFocusedTableIdx += TABLE_COL_SIZE;
      }
    }
    // 위로 이동
    if (moveY > baseline) {
      if (newFocusedTableIdx - TABLE_COL_SIZE >= 0) {
        newFocusedTableIdx -= TABLE_COL_SIZE;
      }
    }
    // 오른쪽으로 이동
    if (moveX < -baseline) {
      if (newFocusedTableIdx % TABLE_COL_SIZE !== TABLE_COL_SIZE - 1) {
        newFocusedTableIdx += 1;
      }
    }
    // 왼쪽으로 이동
    if (moveX > baseline) {
      if (newFocusedTableIdx % TABLE_COL_SIZE !== 0) {
        newFocusedTableIdx -= 1;
      }
    }
    if (focusedTableIdx === newFocusedTableIdx) {
      partTopicTablesRef.current.scroll({
        top: startTop,
        left: startLeft,
        behavior: 'smooth',
      });
    } else {
      setFocusedTableIdx(newFocusedTableIdx);
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    const moveY = -(ev.changedTouches[0].pageY - startY);
    const moveX = -(ev.changedTouches[0].pageX - startX);

    partTopicTablesRef.current.scroll({
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
