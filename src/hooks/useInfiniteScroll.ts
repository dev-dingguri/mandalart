import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver 기반 무한 스크롤 훅.
 * 반환된 ref를 센티널 요소에 연결하면, 뷰포트 진입 시 onLoadMore가 호출된다.
 */
const useInfiniteScroll = <T extends HTMLElement = HTMLDivElement>(
  onLoadMore: () => void,
  rootMargin = '200px'
) => {
  const sentinelRef = useRef<T>(null);
  // 콜백을 ref로 보관하여, 콜백 변경 시 observer 재생성을 방지
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rootMargin]);

  return sentinelRef;
};

export default useInfiniteScroll;
