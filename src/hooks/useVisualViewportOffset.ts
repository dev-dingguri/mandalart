import { useState, useEffect } from 'react';

/**
 * 모바일 가상 키보드가 열릴 때 fixed 중앙 정렬 요소의 top 오프셋(px)을 반환합니다.
 * 보이는 영역 중앙까지의 전체 오프셋에 감쇠 계수(0.6)를 적용하여,
 * 키보드 바로 위에 자연스럽게 위치하도록 합니다.
 *
 * - 키보드 닫힘: 0 반환 (변화 없음)
 * - 키보드 열림: 음수 반환 (위로 이동)
 */
// 1.0 = 보이는 영역 정중앙, 0 = 원래 위치 고수
const DAMPING = 0.6;

export function useVisualViewportOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // visualViewport 중심 vs 레이아웃 뷰포트 중심의 차이를 계산
      // vv.offsetTop: iOS에서 키보드로 인해 뷰포트가 스크롤된 양
      const visibleCenter = vv.offsetTop + vv.height / 2;
      const layoutCenter = window.innerHeight / 2;
      setOffset((visibleCenter - layoutCenter) * DAMPING);
    };

    vv.addEventListener('resize', update, { passive: true });
    vv.addEventListener('scroll', update, { passive: true });
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}
