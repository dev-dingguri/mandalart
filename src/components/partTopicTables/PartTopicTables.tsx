import React, { useRef, useState, TouchEvent } from 'react';
import TopicTables, {
  TopicTablesProps,
} from 'components/topicTables/TopicTables';
import styles from './PartTopicTables.module.css';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';

type PartTopicTablesProps = Omit<TopicTablesProps, 'focusedIdx'>;

const PartTopicTables = ({ ...props }: PartTopicTablesProps) => {
  const [focusedIdx, setFocusedIdx] = useState(TABLE_CENTER_IDX);
  const tablesRef = useRef<HTMLDivElement>(null);
  // 스와이프 시작시 상태를 저장하기 위한 useRef들
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startTopRef = useRef(0);
  const startLeftRef = useRef(0);
  const startTimeRef = useRef(new Date());

  const calculateMovedIdx = (idx: number, endY: number, endX: number) => {
    const tables = tablesRef.current!;
    const baseline = tables.clientWidth * 0.35;
    const moveTime = Date.now() - startTimeRef.current.getTime();
    // 500ms안에 스와이프가 끝나면 가중치 적용
    const weight = Math.min(Math.max((500 - moveTime) * 0.02, 1), 5);
    const forceY = (endY - startYRef.current) * weight;
    const forceX = (endX - startXRef.current) * weight;

    // 아래로 이동
    if (forceY < -baseline) {
      if (idx + TABLE_COL_SIZE < TABLE_SIZE) {
        idx += TABLE_COL_SIZE;
      }
    }
    // 위로 이동
    if (forceY > baseline) {
      if (idx - TABLE_COL_SIZE >= 0) {
        idx -= TABLE_COL_SIZE;
      }
    }
    // 오른쪽으로 이동
    if (forceX < -baseline) {
      if (idx % TABLE_COL_SIZE !== TABLE_COL_SIZE - 1) {
        idx += 1;
      }
    }
    // 왼쪽으로 이동
    if (forceX > baseline) {
      if (idx % TABLE_COL_SIZE !== 0) {
        idx -= 1;
      }
    }
    return idx;
  };

  const handleTopicClick = (tableIdx: number, tableItemIdx: number) => {
    if (tableIdx !== focusedIdx) {
      setFocusedIdx(tableIdx);
    } else {
      props.onTopicClick(tableIdx, tableItemIdx);
    }
  };

  const handleTouchStart = (ev: TouchEvent) => {
    const tables = tablesRef.current!;
    startYRef.current = ev.changedTouches[0].pageY;
    startXRef.current = ev.changedTouches[0].pageX;
    startTopRef.current = tables.scrollTop;
    startLeftRef.current = tables.scrollLeft;
    startTimeRef.current = new Date();
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    const movedIdx = calculateMovedIdx(
      focusedIdx,
      ev.changedTouches[0].pageY,
      ev.changedTouches[0].pageX
    );
    if (movedIdx !== focusedIdx) {
      setFocusedIdx(movedIdx);
    } else {
      const tables = tablesRef.current!;
      tables.scroll({
        top: startTopRef.current,
        left: startLeftRef.current,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    const moveY = -(ev.changedTouches[0].pageY - startYRef.current);
    const moveX = -(ev.changedTouches[0].pageX - startXRef.current);

    const tables = tablesRef.current!;
    tables.scroll({
      top: startTopRef.current + moveY,
      left: startLeftRef.current + moveX,
      behavior: 'auto',
    });
  };

  return (
    <div
      ref={tablesRef}
      className={styles.partTopicTables}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className={styles.container}>
        <TopicTables
          {...props}
          focusedIdx={focusedIdx}
          onTopicClick={handleTopicClick}
        />
      </div>
    </div>
  );
};

export default PartTopicTables;
