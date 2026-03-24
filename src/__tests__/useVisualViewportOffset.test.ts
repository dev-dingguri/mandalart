import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisualViewportOffset } from '@/hooks/useVisualViewportOffset';

type MockVisualViewport = {
  offsetTop: number;
  height: number;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};

let mockViewport: MockVisualViewport;
let resizeHandler: (() => void) | null = null;
let scrollHandler: (() => void) | null = null;

beforeEach(() => {
  mockViewport = {
    offsetTop: 0,
    height: window.innerHeight, // layout viewport과 동일 = 키보드 닫힘
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === 'resize') resizeHandler = handler;
      if (event === 'scroll') scrollHandler = handler;
    }),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, 'visualViewport', {
    value: mockViewport,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  resizeHandler = null;
  scrollHandler = null;
  Object.defineProperty(window, 'visualViewport', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

describe('useVisualViewportOffset', () => {
  it('visualViewport가 없으면 0을 반환한다', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVisualViewportOffset());
    expect(result.current).toBe(0);
  });

  it('키보드가 닫힌 상태에서 0을 반환한다', () => {
    // viewport height === innerHeight, offsetTop === 0 → 차이 없음
    const { result } = renderHook(() => useVisualViewportOffset());
    expect(result.current).toBe(0);
  });

  it('키보드가 열리면 음수 오프셋을 반환한다', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true,
    });
    mockViewport.height = 800; // beforeEach에서 초기값이 이전 innerHeight이므로 재설정

    const { result } = renderHook(() => useVisualViewportOffset());

    // 키보드가 화면 절반을 차지하는 시나리오
    mockViewport.height = 400;
    mockViewport.offsetTop = 0;

    // visibleCenter = 0 + 400/2 = 200
    // layoutCenter = 800/2 = 400
    // offset = (200 - 400) * 0.6 = -120
    act(() => {
      resizeHandler?.();
    });

    expect(result.current).toBe(-120);
  });

  it('스크롤 이벤트에도 오프셋을 업데이트한다', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true,
    });
    mockViewport.height = 800;

    const { result } = renderHook(() => useVisualViewportOffset());

    mockViewport.height = 400;
    mockViewport.offsetTop = 0;

    act(() => {
      scrollHandler?.();
    });

    expect(result.current).toBe(-120);
  });

  it('언마운트 시 이벤트 리스너를 정리한다', () => {
    const { unmount } = renderHook(() => useVisualViewportOffset());

    unmount();

    expect(mockViewport.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(mockViewport.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
  });

  it('offsetTop이 있으면 오프셋 계산에 반영한다', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true,
    });
    mockViewport.height = 800;

    const { result } = renderHook(() => useVisualViewportOffset());

    // iOS에서 키보드로 인해 뷰포트가 스크롤된 상황
    mockViewport.height = 400;
    mockViewport.offsetTop = 100;

    // visibleCenter = 100 + 400/2 = 300
    // layoutCenter = 800/2 = 400
    // offset = (300 - 400) * 0.6 = -60
    act(() => {
      resizeHandler?.();
    });

    expect(result.current).toBe(-60);
  });
});
