import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { createElement, type RefObject } from 'react';
import { render } from '@testing-library/react';

let observerCallback: IntersectionObserverCallback;
let observerOptions: IntersectionObserverInit | undefined;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  observerOptions = undefined;
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  // vi.fn()에 arrow function을 전달하면 new로 호출할 수 없으므로 function 사용
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (
      this: IntersectionObserver,
      cb: IntersectionObserverCallback,
      opts?: IntersectionObserverInit,
    ) {
      observerCallback = cb;
      observerOptions = opts;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    }),
  );
});

/**
 * 센티널 요소에 ref를 연결하는 래퍼 컴포넌트.
 * renderHook에서는 ref가 DOM에 연결되지 않아 effect가 동작하지 않으므로,
 * 실제 DOM 요소를 렌더링하여 ref를 연결한다.
 */
function TestComponent({
  onLoadMore,
  rootMargin,
}: {
  onLoadMore: () => void;
  rootMargin?: string;
}) {
  const ref = useInfiniteScroll<HTMLDivElement>(onLoadMore, rootMargin);
  return createElement('div', { ref, 'data-testid': 'sentinel' });
}

/** IntersectionObserver 콜백을 수동으로 트리거 */
function triggerIntersection(isIntersecting: boolean) {
  observerCallback(
    [{ isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

describe('useInfiniteScroll', () => {
  it('센티널 요소가 있으면 IntersectionObserver를 생성하고 observe한다', () => {
    const onLoadMore = vi.fn();
    render(createElement(TestComponent, { onLoadMore }));

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  it('센티널 요소가 없으면 observer를 생성하지 않는다', () => {
    const onLoadMore = vi.fn();
    // renderHook은 DOM 요소를 렌더링하지 않으므로 sentinelRef.current가 null
    renderHook(() => useInfiniteScroll(onLoadMore));

    expect(IntersectionObserver).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('교차 시 onLoadMore를 호출한다', () => {
    const onLoadMore = vi.fn();
    render(createElement(TestComponent, { onLoadMore }));

    triggerIntersection(true);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('비교차 시 onLoadMore를 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    render(createElement(TestComponent, { onLoadMore }));

    triggerIntersection(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('기본 rootMargin은 200px이다', () => {
    const onLoadMore = vi.fn();
    render(createElement(TestComponent, { onLoadMore }));

    expect(observerOptions).toEqual({ rootMargin: '200px' });
  });

  it('커스텀 rootMargin을 전달할 수 있다', () => {
    const onLoadMore = vi.fn();
    render(createElement(TestComponent, { onLoadMore, rootMargin: '500px' }));

    expect(observerOptions).toEqual({ rootMargin: '500px' });
  });

  it('언마운트 시 observer를 disconnect한다', () => {
    const onLoadMore = vi.fn();
    const { unmount } = render(createElement(TestComponent, { onLoadMore }));

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('rootMargin 변경 시 observer를 재생성한다', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      createElement(TestComponent, { onLoadMore, rootMargin: '200px' }),
    );

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).not.toHaveBeenCalled();

    rerender(createElement(TestComponent, { onLoadMore, rootMargin: '500px' }));

    // 이전 observer disconnect 후 새 observer 생성
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(IntersectionObserver).toHaveBeenCalledTimes(2);
    expect(observerOptions).toEqual({ rootMargin: '500px' });
  });

  it('콜백이 변경되어도 observer를 재생성하지 않는다', () => {
    const onLoadMore1 = vi.fn();
    const onLoadMore2 = vi.fn();
    const { rerender } = render(
      createElement(TestComponent, { onLoadMore: onLoadMore1 }),
    );

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);

    rerender(createElement(TestComponent, { onLoadMore: onLoadMore2 }));

    // useLatestRef 패턴으로 콜백 변경 시 observer 재생성 없음
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).not.toHaveBeenCalled();

    // 새 콜백이 호출되는지 확인
    triggerIntersection(true);
    expect(onLoadMore1).not.toHaveBeenCalled();
    expect(onLoadMore2).toHaveBeenCalledTimes(1);
  });

  it('sentinelRef를 반환한다', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onLoadMore));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
    // 초기값은 null (DOM에 연결되지 않은 상태)
    expect((result.current as RefObject<HTMLDivElement>).current).toBeNull();
  });
});
