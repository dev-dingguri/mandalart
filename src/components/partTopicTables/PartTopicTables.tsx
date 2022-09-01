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

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startTopRef = useRef(0);
  const startLeftRef = useRef(0);
  const startTimeRef = useRef(new Date());

  const handleClick = (tableIdx: number, tableItemIdx: number) => {
    if (tableIdx !== focusedTableIdx) {
      setFocusedTableIdx(tableIdx);
    } else {
      props.onClick(tableIdx, tableItemIdx);
    }
  };

  const handleTouchStart = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    startYRef.current = ev.changedTouches[0].pageY;
    startXRef.current = ev.changedTouches[0].pageX;
    startTopRef.current = partTopicTablesRef.current.scrollTop;
    startLeftRef.current = partTopicTablesRef.current.scrollLeft;
    startTimeRef.current = new Date();
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    const endY = ev.changedTouches[0].pageY;
    const endX = ev.changedTouches[0].pageX;
    const baseline = partTopicTablesRef.current.clientWidth * 0.35;
    const weight = Math.max(
      (500 - (Date.now() - startTimeRef.current.getTime())) * 0.1, // 500ms안에 스와이프가 끝나면 가중치 적용
      1
    );
    const moveY = (endY - startYRef.current) * weight;
    const moveX = (endX - startXRef.current) * weight;

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
        top: startTopRef.current,
        left: startLeftRef.current,
        behavior: 'smooth',
      });
    } else {
      setFocusedTableIdx(newFocusedTableIdx);
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    if (!partTopicTablesRef.current) return;

    const moveY = -(ev.changedTouches[0].pageY - startYRef.current);
    const moveX = -(ev.changedTouches[0].pageX - startXRef.current);

    partTopicTablesRef.current.scroll({
      top: startTopRef.current + moveY,
      left: startLeftRef.current + moveX,
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
