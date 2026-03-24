import { useEffect, useRef } from 'react';
import Mandalart, { MandalartProps } from '@/components/Mandalart';
import { TABLE_COL_SIZE, TABLE_SIZE, TABLE_CENTER_IDX } from '@/constants';
import AspectSquare from '@/components/AspectSquare';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

type MandalartFocusViewProps = MandalartProps & {
  onFocusedGridChange?: () => void;
};

const MandalartFocusView = ({
  onFocusedGridChange,
  ...props
}: MandalartFocusViewProps) => {
  const {
    focusedIdx,
    setFocusedIdx,
    containerRef,
    touchHandlers,
    keyboardHandlers,
  } = useSwipeNavigation({
    gridSize: TABLE_SIZE,
    colSize: TABLE_COL_SIZE,
    initialIdx: TABLE_CENTER_IDX,
  });

  // Focus View 진입 시 컨테이너에 포커스를 부여하여 클릭 없이 방향키 사용 가능
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // 포커스 그리드 변경 시 부모에 알림 (편집 중인 셀 저장 및 선택 해제용)
  const prevFocusedIdxRef = useRef(focusedIdx);
  useEffect(() => {
    if (prevFocusedIdxRef.current !== focusedIdx) {
      prevFocusedIdxRef.current = focusedIdx;
      onFocusedGridChange?.();
    }
  }, [focusedIdx, onFocusedGridChange]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="aspect-square w-full overflow-hidden outline-none"
      data-testid="mandalart-focus-view"
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
