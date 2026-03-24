import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';

/** 스와이프 인식 기준: 컨테이너 너비 대비 비율 */
const SWIPE_THRESHOLD_RATIO = 0.35;
/** 플릭 제스처로 인식하는 최대 시간(ms) */
const FLICK_MAX_DURATION_MS = 500;
/** 플릭 속도→가중치 변환 계수 */
const FLICK_WEIGHT_FACTOR = 0.02;
/** 빠른 플릭 시 최대 가중치 배율 */
const FLICK_MAX_WEIGHT = 5;

type SwipeNavigationConfig = {
  gridSize: number;
  colSize: number;
  initialIdx: number;
};

export const useSwipeNavigation = ({
  gridSize,
  colSize,
  initialIdx,
}: SwipeNavigationConfig) => {
  const [focusedIdx, setFocusedIdx] = useState(initialIdx);
  const containerRef = useRef<HTMLDivElement>(null);

  // 핸들러 안정화를 위해 상태/config를 ref로 동기화
  const focusedIdxRef = useLatestRef(focusedIdx);
  const configRef = useLatestRef({ gridSize, colSize });

  // 스와이프 시작 시점의 상태를 하나의 ref로 통합
  const swipeStartRef = useRef({
    y: 0,
    x: 0,
    scrollTop: 0,
    scrollLeft: 0,
    time: 0,
  });

  const handleTouchStart = useCallback((ev: TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    swipeStartRef.current = {
      y: ev.changedTouches[0].pageY,
      x: ev.changedTouches[0].pageX,
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((ev: TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const start = swipeStartRef.current;
    const currentIdx = focusedIdxRef.current;
    const { gridSize, colSize } = configRef.current;

    const movedIdx = calculateSwipedIdx({
      currentIdx,
      startY: start.y,
      startX: start.x,
      endY: ev.changedTouches[0].pageY,
      endX: ev.changedTouches[0].pageX,
      startTime: start.time,
      baseline: container.clientWidth * SWIPE_THRESHOLD_RATIO,
      colSize,
      gridSize,
    });

    if (movedIdx !== currentIdx) {
      setFocusedIdx(movedIdx);
    } else {
      // 인덱스가 변경되지 않았으면 원래 스크롤 위치로 복원
      container.scroll({
        top: start.scrollTop,
        left: start.scrollLeft,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleTouchMove = useCallback((ev: TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const start = swipeStartRef.current;
    container.scroll({
      top: start.scrollTop - (ev.changedTouches[0].pageY - start.y),
      left: start.scrollLeft - (ev.changedTouches[0].pageX - start.x),
      behavior: 'auto',
    });
  }, []);

  const handleKeyDown = useCallback((ev: KeyboardEvent) => {
    const { gridSize, colSize } = configRef.current;
    const currentIdx = focusedIdxRef.current;
    const movedIdx = calculateKeyboardIdx(
      currentIdx,
      ev.key,
      colSize,
      gridSize,
    );
    if (movedIdx !== currentIdx) {
      ev.preventDefault(); // 방향키에 의한 스크롤 방지
      setFocusedIdx(movedIdx);
    }
  }, []);

  const touchHandlers = useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
      onTouchMove: handleTouchMove,
    }),
    [handleTouchStart, handleTouchEnd, handleTouchMove],
  );

  const keyboardHandlers = useMemo(
    () => ({
      onKeyDown: handleKeyDown,
    }),
    [handleKeyDown],
  );

  return {
    focusedIdx,
    setFocusedIdx,
    containerRef,
    touchHandlers,
    keyboardHandlers,
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
  // FLICK_MAX_DURATION_MS 안에 스와이프가 끝나면 가중치를 적용하여 빠른 플릭 제스처를 인식
  const weight = Math.min(
    Math.max((FLICK_MAX_DURATION_MS - period) * FLICK_WEIGHT_FACTOR, 1),
    FLICK_MAX_WEIGHT,
  );
  const forceY = (endY - startY) * weight;
  const forceX = (endX - startX) * weight;

  // 의도적으로 else if가 아닌 독립 if 사용 — 대각선 스와이프 시 상하+좌우 동시 이동을 허용
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

/** 키보드 방향키에 따라 이동할 그리드 인덱스를 계산 */
const calculateKeyboardIdx = (
  currentIdx: number,
  key: string,
  colSize: number,
  gridSize: number,
): number => {
  switch (key) {
    case 'ArrowDown':
      return currentIdx + colSize < gridSize
        ? currentIdx + colSize
        : currentIdx;
    case 'ArrowUp':
      return currentIdx - colSize >= 0 ? currentIdx - colSize : currentIdx;
    case 'ArrowRight':
      return currentIdx % colSize !== colSize - 1 ? currentIdx + 1 : currentIdx;
    case 'ArrowLeft':
      return currentIdx % colSize !== 0 ? currentIdx - 1 : currentIdx;
    default:
      return currentIdx;
  }
};
