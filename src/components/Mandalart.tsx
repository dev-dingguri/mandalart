import ItemGrid from '@/components/ItemGrid';
import TopicGrid from '@/components/TopicGrid';
import { TopicNode } from '@/types';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE, TABLE_CENTER_IDX } from '@/constants';
import { memo } from 'react';

import type { SelectedCell } from '@/lib/cellNavigation';
export type { SelectedCell } from '@/lib/cellNavigation';

type FocusHandlers = {
  focusedIdx: number;
  onUpdateFocus: (gridIdx: number) => void;
};

export type MandalartProps = {
  onGetTopic: (gridIdx: number, gridItemIdx: number) => TopicNode;
  onSelectCell: (gridIdx: number, gridItemIdx: number) => void;
  selectedCell: SelectedCell | null;
  usePopoverAnchor?: boolean;
  focusHandlers?: FocusHandlers;
};

const Mandalart = memo(
  ({
    onGetTopic,
    onSelectCell,
    selectedCell,
    usePopoverAnchor,
    focusHandlers,
  }: MandalartProps) => {
    return (
      <ItemGrid
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        createItem={(gridIdx) => (
          // 다른 grid의 값 읽기/쓰기를 제한하기 위해 아래와 같이 처리하였음
          <TopicGrid
            onIsAccented={(gridItemIdx) => isAccented(gridIdx, gridItemIdx)}
            onGetTopic={(gridItemIdx) => onGetTopic(gridIdx, gridItemIdx)}
            onSelectItem={(gridItemIdx) => onSelectCell(gridIdx, gridItemIdx)}
            selectedGridItemIdx={
              selectedCell?.gridIdx === gridIdx
                ? selectedCell.gridItemIdx
                : null
            }
            usePopoverAnchor={usePopoverAnchor}
            focusHandlers={
              focusHandlers
                ? {
                    isFocused: focusHandlers.focusedIdx === gridIdx,
                    onUpdateFocus: () => focusHandlers.onUpdateFocus(gridIdx),
                  }
                : undefined
            }
          />
        )}
        spacing="4px"
      />
    );
  },
);
Mandalart.displayName = 'Mandalart';

const isAccented = (gridIdx: number, gridItemIdx: number) => {
  return gridIdx === TABLE_CENTER_IDX
    ? gridItemIdx !== TABLE_CENTER_IDX
    : gridItemIdx === TABLE_CENTER_IDX;
};

export default Mandalart;
