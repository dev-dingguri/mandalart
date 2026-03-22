import { useEffect } from 'react';
import Mandalart, { MandalartProps } from '@/components/Mandalart';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from '@/constants';
import AspectSquare from '@/components/AspectSquare';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

const MandalartFocusView = (props: MandalartProps) => {
  const { focusedIdx, setFocusedIdx, containerRef, touchHandlers, keyboardHandlers } =
    useSwipeNavigation({
      gridSize: TABLE_SIZE,
      colSize: TABLE_COL_SIZE,
      initialIdx: TABLE_CENTER_IDX,
    });

  // Focus View 진입 시 컨테이너에 포커스를 부여하여 클릭 없이 방향키 사용 가능
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="aspect-square w-full overflow-hidden outline-none"
      {...touchHandlers}
      {...keyboardHandlers}
    >
      <AspectSquare style={{ width: '240%' }}>
        <Mandalart
          {...props}
          focusHandlers={{ focusedIdx, onUpdateFocus: setFocusedIdx }}
        />
      </AspectSquare>
    </div>
  );
};

export default MandalartFocusView;
