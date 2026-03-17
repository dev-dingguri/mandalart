import { useRef, useState, type TouchEvent } from 'react';

type SwipeNavigationConfig = {
  gridSize: number;
  colSize: number;
  initialIdx: number;
};

const useSwipeNavigation = ({
  gridSize,
  colSize,
  initialIdx,
}: SwipeNavigationConfig) => {
  const [focusedIdx, setFocusedIdx] = useState(initialIdx);
  const containerRef = useRef<HTMLDivElement>(null);

  // 스와이프 시작 시점의 상태를 하나의 ref로 통합
  const swipeStartRef = useRef({
    y: 0,
    x: 0,
    scrollTop: 0,
    scrollLeft: 0,
    time: 0,
  });

  const handleTouchStart = (ev: TouchEvent) => {
    const container = containerRef.current!;
    swipeStartRef.current = {
      y: ev.changedTouches[0].pageY,
      x: ev.changedTouches[0].pageX,
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    const container = containerRef.current!;
    const start = swipeStartRef.current;

    const movedIdx = calculateSwipedIdx({
      currentIdx: focusedIdx,
      startY: start.y,
      startX: start.x,
      endY: ev.changedTouches[0].pageY,
      endX: ev.changedTouches[0].pageX,
      startTime: start.time,
      baseline: container.clientWidth * 0.35,
      colSize,
      gridSize,
    });

    if (movedIdx !== focusedIdx) {
      setFocusedIdx(movedIdx);
    } else {
      // 인덱스가 변경되지 않았으면 원래 스크롤 위치로 복원
      container.scroll({
        top: start.scrollTop,
        left: start.scrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    const container = containerRef.current!;
    const start = swipeStartRef.current;
    container.scroll({
      top: start.scrollTop - (ev.changedTouches[0].pageY - start.y),
      left: start.scrollLeft - (ev.changedTouches[0].pageX - start.x),
      behavior: 'auto',
    });
  };

  return {
    focusedIdx,
    setFocusedIdx,
    containerRef,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
      onTouchMove: handleTouchMove,
    },
  };
};

type SwipeParams = {
  currentIdx: number;
  startY: number;
  startX: number;
  endY: number;
  endX: number;
  startTime: number;
  baseline: number;
  colSize: number;
  gridSize: number;
};

/** 스와이프 방향과 속도를 기반으로 이동할 그리드 인덱스를 계산 */
const calculateSwipedIdx = ({
  currentIdx,
  startY,
  startX,
  endY,
  endX,
  startTime,
  baseline,
  colSize,
  gridSize,
}: SwipeParams): number => {
  let movedIdx = currentIdx;
  const period = Date.now() - startTime;
  // 500ms 안에 스와이프가 끝나면 가중치를 적용하여 빠른 플릭 제스처를 인식
  const weight = Math.min(Math.max((500 - period) * 0.02, 1), 5);
  const forceY = (endY - startY) * weight;
  const forceX = (endX - startX) * weight;

  // 아래로 이동
  if (forceY < -baseline && movedIdx + colSize < gridSize) {
    movedIdx += colSize;
  }
  // 위로 이동
  if (forceY > baseline && movedIdx - colSize >= 0) {
    movedIdx -= colSize;
  }
  // 오른쪽으로 이동
  if (forceX < -baseline && movedIdx % colSize !== colSize - 1) {
    movedIdx += 1;
  }
  // 왼쪽으로 이동
  if (forceX > baseline && movedIdx % colSize !== 0) {
    movedIdx -= 1;
  }

  return movedIdx;
};

export default useSwipeNavigation;
