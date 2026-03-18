import { useRef } from 'react';

/**
 * 매 렌더마다 ref.current를 최신 값으로 동기화.
 * useCallback 내에서 최신 상태를 참조하면서도 콜백 재생성을 방지할 때 사용.
 * (advanced-use-latest / advanced-event-handler-refs 패턴)
 */
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
