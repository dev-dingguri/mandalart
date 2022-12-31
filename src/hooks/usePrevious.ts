import { useRef, useEffect } from 'react';

const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // 이전 값 반환 (위의 useEffect에서 업데이트되기 전에 반환)
  return ref.current;
};

export default usePrevious;
