import { describe, it, expect } from 'vitest';
import {
  calculateKeyboardIdx,
  calculateSwipedIdx,
  type SwipeParams,
} from '@/hooks/useSwipeNavigation';

// 3×3 그리드 기본 설정
const COL_SIZE = 3;
const GRID_SIZE = 9;
const BASELINE = 100;

/** 스와이프 파라미터 기본값 (이동 없음) */
const baseSwipeParams: SwipeParams = {
  currentIdx: 4,
  startY: 300,
  startX: 300,
  endY: 300,
  endX: 300,
  startTime: Date.now() - 1000, // 플릭이 아닌 일반 스와이프 (1초 전)
  baseline: BASELINE,
  colSize: COL_SIZE,
  gridSize: GRID_SIZE,
};

describe('calculateKeyboardIdx', () => {
  describe('ArrowDown', () => {
    it('아래로 colSize만큼 이동한다', () => {
      expect(calculateKeyboardIdx(0, 'ArrowDown', COL_SIZE, GRID_SIZE)).toBe(3);
    });

    it('중간 위치에서 아래로 이동한다', () => {
      expect(calculateKeyboardIdx(4, 'ArrowDown', COL_SIZE, GRID_SIZE)).toBe(7);
    });

    it('하단 경계에서 이동하지 않는다', () => {
      expect(calculateKeyboardIdx(6, 'ArrowDown', COL_SIZE, GRID_SIZE)).toBe(6);
      expect(calculateKeyboardIdx(7, 'ArrowDown', COL_SIZE, GRID_SIZE)).toBe(7);
      expect(calculateKeyboardIdx(8, 'ArrowDown', COL_SIZE, GRID_SIZE)).toBe(8);
    });
  });

  describe('ArrowUp', () => {
    it('위로 colSize만큼 이동한다', () => {
      expect(calculateKeyboardIdx(3, 'ArrowUp', COL_SIZE, GRID_SIZE)).toBe(0);
    });

    it('중간 위치에서 위로 이동한다', () => {
      expect(calculateKeyboardIdx(4, 'ArrowUp', COL_SIZE, GRID_SIZE)).toBe(1);
    });

    it('상단 경계에서 이동하지 않는다', () => {
      expect(calculateKeyboardIdx(0, 'ArrowUp', COL_SIZE, GRID_SIZE)).toBe(0);
      expect(calculateKeyboardIdx(1, 'ArrowUp', COL_SIZE, GRID_SIZE)).toBe(1);
      expect(calculateKeyboardIdx(2, 'ArrowUp', COL_SIZE, GRID_SIZE)).toBe(2);
    });
  });

  describe('ArrowRight', () => {
    it('오른쪽으로 1칸 이동한다', () => {
      expect(calculateKeyboardIdx(0, 'ArrowRight', COL_SIZE, GRID_SIZE)).toBe(1);
    });

    it('중간 위치에서 오른쪽으로 이동한다', () => {
      expect(calculateKeyboardIdx(4, 'ArrowRight', COL_SIZE, GRID_SIZE)).toBe(5);
    });

    it('우측 경계에서 이동하지 않는다 (currentIdx % colSize === colSize - 1)', () => {
      expect(calculateKeyboardIdx(2, 'ArrowRight', COL_SIZE, GRID_SIZE)).toBe(2);
      expect(calculateKeyboardIdx(5, 'ArrowRight', COL_SIZE, GRID_SIZE)).toBe(5);
      expect(calculateKeyboardIdx(8, 'ArrowRight', COL_SIZE, GRID_SIZE)).toBe(8);
    });
  });

  describe('ArrowLeft', () => {
    it('왼쪽으로 1칸 이동한다', () => {
      expect(calculateKeyboardIdx(1, 'ArrowLeft', COL_SIZE, GRID_SIZE)).toBe(0);
    });

    it('중간 위치에서 왼쪽으로 이동한다', () => {
      expect(calculateKeyboardIdx(4, 'ArrowLeft', COL_SIZE, GRID_SIZE)).toBe(3);
    });

    it('좌측 경계에서 이동하지 않는다 (currentIdx % colSize === 0)', () => {
      expect(calculateKeyboardIdx(0, 'ArrowLeft', COL_SIZE, GRID_SIZE)).toBe(0);
      expect(calculateKeyboardIdx(3, 'ArrowLeft', COL_SIZE, GRID_SIZE)).toBe(3);
      expect(calculateKeyboardIdx(6, 'ArrowLeft', COL_SIZE, GRID_SIZE)).toBe(6);
    });
  });

  describe('알 수 없는 키', () => {
    it('인식하지 않는 키 입력 시 현재 인덱스를 그대로 반환한다', () => {
      expect(calculateKeyboardIdx(4, 'Enter', COL_SIZE, GRID_SIZE)).toBe(4);
      expect(calculateKeyboardIdx(4, 'Space', COL_SIZE, GRID_SIZE)).toBe(4);
      expect(calculateKeyboardIdx(4, 'Tab', COL_SIZE, GRID_SIZE)).toBe(4);
      expect(calculateKeyboardIdx(4, 'a', COL_SIZE, GRID_SIZE)).toBe(4);
    });
  });
});

describe('calculateSwipedIdx', () => {
  describe('수평 스와이프', () => {
    it('왼쪽으로 스와이프하면 오른쪽 셀로 이동한다 (currentIdx + 1)', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        endX: 300 - BASELINE - 1, // baseline을 초과하는 왼쪽 스와이프
      });
      expect(result).toBe(5);
    });

    it('오른쪽으로 스와이프하면 왼쪽 셀로 이동한다 (currentIdx - 1)', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        endX: 300 + BASELINE + 1, // baseline을 초과하는 오른쪽 스와이프
      });
      expect(result).toBe(3);
    });
  });

  describe('수직 스와이프', () => {
    it('위로 스와이프하면 아래 셀로 이동한다 (currentIdx + colSize)', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 1,
        endY: 300 - BASELINE - 1, // baseline을 초과하는 위쪽 스와이프
      });
      expect(result).toBe(4);
    });

    it('아래로 스와이프하면 위 셀로 이동한다 (currentIdx - colSize)', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        endY: 300 + BASELINE + 1, // baseline을 초과하는 아래쪽 스와이프
      });
      expect(result).toBe(1);
    });
  });

  describe('임계값 미만의 스와이프', () => {
    it('baseline 이하의 이동량은 인덱스를 변경하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        endX: 300 - BASELINE + 1, // baseline에 도달하지 않는 스와이프
        endY: 300 - BASELINE + 1,
      });
      expect(result).toBe(4);
    });

    it('정확히 baseline과 같은 이동량도 인덱스를 변경하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        endX: 300 - BASELINE, // force = -baseline, 조건은 < -baseline이므로 미충족
      });
      expect(result).toBe(4);
    });
  });

  describe('경계 검사', () => {
    it('우측 경계에서 왼쪽 스와이프 시 이동하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 2, // colSize - 1 = 우측 경계
        endX: 300 - BASELINE - 1,
      });
      expect(result).toBe(2);
    });

    it('좌측 경계에서 오른쪽 스와이프 시 이동하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 0, // 좌측 경계
        endX: 300 + BASELINE + 1,
      });
      expect(result).toBe(0);
    });

    it('하단 경계에서 위쪽 스와이프 시 이동하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 6, // gridSize - colSize = 하단 행
        endY: 300 - BASELINE - 1,
      });
      expect(result).toBe(6);
    });

    it('상단 경계에서 아래쪽 스와이프 시 이동하지 않는다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 0, // 상단 행
        endY: 300 + BASELINE + 1,
      });
      expect(result).toBe(0);
    });
  });

  describe('대각선 스와이프', () => {
    it('독립 if문을 사용하므로 상하+좌우 동시 이동이 가능하다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4, // 중앙 (row=1, col=1)
        endY: 300 - BASELINE - 1, // 위로 → 아래 셀로
        endX: 300 - BASELINE - 1, // 왼쪽으로 → 오른쪽 셀로
      });
      // Y축: 4 + 3 = 7, X축: 7 + 1 = 8
      expect(result).toBe(8);
    });

    it('대각선 이동 시 한 축만 경계에 걸리면 다른 축만 이동한다', () => {
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 2, // row=0, col=2 (우측 경계)
        endY: 300 - BASELINE - 1, // 위로 → 아래 행으로 이동 가능
        endX: 300 - BASELINE - 1, // 왼쪽으로 → 우측 경계이므로 이동 불가
      });
      // Y축: 2 + 3 = 5, X축: 5 % 3 === 2 (colSize - 1)이므로 이동 불가
      expect(result).toBe(5);
    });
  });

  describe('플릭 제스처', () => {
    it('빠른 스와이프(500ms 이내)는 가중치로 힘이 증폭된다', () => {
      // period=100ms → weight = min(max((500-100)*0.02, 1), 5) = min(8, 5) = 5
      // 작은 이동거리도 가중치 덕에 baseline을 초과할 수 있다
      const smallMove = BASELINE / 5; // weight=5 적용 시 baseline과 동일해지므로 약간 초과시킴
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        startTime: Date.now() - 100, // 100ms 전 (빠른 플릭)
        endX: 300 - (smallMove + 1), // 작은 왼쪽 이동
      });
      // forceX = (endX - startX) * weight = -(smallMove+1) * 5
      // -(BASELINE/5 + 1) * 5 = -(BASELINE + 5), 이것은 < -BASELINE이므로 이동
      expect(result).toBe(5);
    });

    it('느린 스와이프(500ms 초과)는 가중치가 1이다', () => {
      // period=1000ms → weight = min(max((500-1000)*0.02, 1), 5) = min(max(-10, 1), 5) = 1
      const smallMove = BASELINE / 5;
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        startTime: Date.now() - 1000, // 1초 전 (느린 스와이프)
        endX: 300 - (smallMove + 1), // 같은 작은 이동
      });
      // forceX = -(smallMove+1) * 1 = -(BASELINE/5 + 1), 이것은 > -BASELINE이므로 미이동
      expect(result).toBe(4);
    });

    it('가중치 최댓값은 5로 제한된다', () => {
      // period=0ms → weight = min(max((500-0)*0.02, 1), 5) = min(10, 5) = 5
      const moveAmount = BASELINE / 5 + 1; // weight=5 적용 시 baseline 초과
      const result = calculateSwipedIdx({
        ...baseSwipeParams,
        currentIdx: 4,
        startTime: Date.now(), // 방금 시작 (최대 속도)
        endX: 300 - moveAmount,
      });
      expect(result).toBe(5);
    });
  });
});
