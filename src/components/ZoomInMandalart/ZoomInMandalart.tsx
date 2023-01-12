import React, { useRef, useState, TouchEvent } from 'react';
import Mandalart, { MandalartProps } from 'components/Mandalart/Mandalart';
import styles from './ZoomInMandalart.module.css';
import { useCallback } from 'react';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';

const ZoomInMandalart = ({ ...props }: MandalartProps) => {
  const [focusedIdx, setFocusedIdx] = useState(TABLE_CENTER_IDX);
  const isSyncedFocuseRef = useRef(false);

  const ref = useRef<HTMLDivElement>(null);
  // 스와이프 시작시 상태를 저장하기 위한 useRef들
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startTopRef = useRef(0);
  const startLeftRef = useRef(0);
  const startTimeRef = useRef(new Date());

  const calculateMovedIdx = (endY: number, endX: number) => {
    let movedIdx = focusedIdx;
    const mandalart = ref.current!;
    const baseline = mandalart.clientWidth * 0.35;
    const period = Date.now() - startTimeRef.current.getTime();
    // 500ms안에 스와이프가 끝나면 가중치 적용
    const weight = Math.min(Math.max((500 - period) * 0.02, 1), 5);
    const forceY = (endY - startYRef.current) * weight;
    const forceX = (endX - startXRef.current) * weight;

    // 아래로 이동
    if (forceY < -baseline) {
      if (movedIdx + TABLE_COL_SIZE < TABLE_SIZE) {
        movedIdx += TABLE_COL_SIZE;
      }
    }
    // 위로 이동
    if (forceY > baseline) {
      if (movedIdx - TABLE_COL_SIZE >= 0) {
        movedIdx -= TABLE_COL_SIZE;
      }
    }
    // 오른쪽으로 이동
    if (forceX < -baseline) {
      if (movedIdx % TABLE_COL_SIZE !== TABLE_COL_SIZE - 1) {
        movedIdx += 1;
      }
    }
    // 왼쪽으로 이동
    if (forceX > baseline) {
      if (movedIdx % TABLE_COL_SIZE !== 0) {
        movedIdx -= 1;
      }
    }
    return movedIdx;
  };

  const handleTouchStart = (ev: TouchEvent) => {
    const mandalart = ref.current!;
    startYRef.current = ev.changedTouches[0].pageY;
    startXRef.current = ev.changedTouches[0].pageX;
    startTopRef.current = mandalart.scrollTop;
    startLeftRef.current = mandalart.scrollLeft;
    startTimeRef.current = new Date();
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    const movedIdx = calculateMovedIdx(
      ev.changedTouches[0].pageY,
      ev.changedTouches[0].pageX
    );
    if (movedIdx !== focusedIdx) {
      setFocusedIdx(movedIdx);
    } else {
      const mandalart = ref.current!;
      mandalart.scroll({
        top: startTopRef.current,
        left: startLeftRef.current,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    const moveY = -(ev.changedTouches[0].pageY - startYRef.current);
    const moveX = -(ev.changedTouches[0].pageX - startXRef.current);

    const mandalart = ref.current!;
    mandalart.scroll({
      top: startTopRef.current + moveY,
      left: startLeftRef.current + moveX,
      behavior: 'auto',
    });
  };

  /**
   * return stopSyncFocuse
   */
  const handleSyncFocuse = useCallback(
    (
      tableIdx: number,
      scrollInto: (options?: ScrollIntoViewOptions) => void
    ) => {
      if (focusedIdx !== tableIdx) return;

      const scrollCenter = (behavior: ScrollBehavior) => {
        scrollInto({
          behavior: behavior,
          block: 'center',
          inline: 'center',
        });
      };

      scrollCenter(isSyncedFocuseRef.current ? 'smooth' : 'auto');
      isSyncedFocuseRef.current = true;

      const handleResize = () => scrollCenter('auto');
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    },
    [focusedIdx]
  );

  const handleCanEdit = (tableIdx: number) => focusedIdx === tableIdx;

  return (
    <div
      ref={ref}
      className={styles.mandalart}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className={styles.container}>
        <Mandalart
          {...props}
          onSyncFocuse={handleSyncFocuse}
          onUpdateFocuse={setFocusedIdx}
          onCanEdit={handleCanEdit}
        />
      </div>
    </div>
  );
};

export default ZoomInMandalart;
