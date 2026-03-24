import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type ChangeHandler = (e: MediaQueryListEvent) => void;

/**
 * matchMedia를 테스트용으로 모킹.
 * setup.ts의 전역 모킹을 덮어쓰되, change 이벤트를 수동 트리거할 수 있게 함.
 */
const mockMatchMedia = (initialMatches: boolean) => {
  let handler: ChangeHandler | null = null;

  const mql = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: vi.fn((_event: string, cb: ChangeHandler) => {
      handler = cb;
    }),
    removeEventListener: vi.fn((_event: string, cb: ChangeHandler) => {
      if (handler === cb) handler = null;
    }),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => {
      mql.media = query;
      return mql;
    }),
  });

  /** change 이벤트를 수동으로 트리거 */
  const fireChange = (matches: boolean) => {
    mql.matches = matches;
    handler?.({ matches } as MediaQueryListEvent);
  };

  return { mql, fireChange };
};

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('초기값으로 matchMedia의 matches를 반환한다 (true)', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('초기값으로 matchMedia의 matches를 반환한다 (false)', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('change 이벤트 시 matches 값이 갱신된다', () => {
    const { fireChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
    act(() => fireChange(true));
    expect(result.current).toBe(true);
  });

  it('query 변경 시 새 matchMedia를 구독한다', () => {
    const { mql } = mockMatchMedia(false);
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } },
    );

    rerender({ query: '(min-width: 1024px)' });

    // 이전 query에 대해 removeEventListener가 호출됨
    expect(mql.removeEventListener).toHaveBeenCalled();
    // 새 query에 대해 addEventListener가 호출됨
    expect(mql.addEventListener).toHaveBeenCalledTimes(2);
  });

  it('언마운트 시 이벤트 리스너를 정리한다', () => {
    const { mql } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();
    expect(mql.removeEventListener).toHaveBeenCalled();
  });
});
