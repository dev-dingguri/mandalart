import Mandalart, { MandalartProps } from '@/components/Mandalart';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from '@/constants';
import AspectSquare from '@/components/AspectSquare';
import useSwipeNavigation from '@/hooks/useSwipeNavigation';

const MandalartFocusView = (props: MandalartProps) => {
  const { focusedIdx, setFocusedIdx, containerRef, touchHandlers } =
    useSwipeNavigation({
      gridSize: TABLE_SIZE,
      colSize: TABLE_COL_SIZE,
      initialIdx: TABLE_CENTER_IDX,
    });

  return (
    <div
      ref={containerRef}
      className="aspect-square w-full overflow-hidden"
      {...touchHandlers}
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
