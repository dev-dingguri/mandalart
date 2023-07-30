import ItemGrid from 'components/ItemGrid/ItemGrid';
import TopicGrid from 'components/TopicGrid/TopicGrid';
import { TopicNode } from 'types/TopicNode';
import {
  TABLE_ROW_SIZE,
  TABLE_COL_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';
import { memo } from 'react';

export type MandalartProps = {
  onGetTopic: (gridIdx: number, gridItemIdx: number) => TopicNode;
  onUpdateTopic: (gridIdx: number, gridItemIdx: number, text: string) => void;
  onCanEdit?: (gridIdx: number) => boolean;
  onSyncFocuse?: (
    gridIdx: number,
    scrollInto: (options?: ScrollIntoViewOptions) => void
  ) => void;
  onUpdateFocuse?: (gridIdx: number) => void;
};

const Mandalart = memo(
  ({
    onGetTopic,
    onUpdateTopic,
    onCanEdit,
    onSyncFocuse,
    onUpdateFocuse,
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
            onUpdateTopic={(gridItemIdx, text) =>
              onUpdateTopic(gridIdx, gridItemIdx, text)
            }
            onCanEdit={onCanEdit && (() => onCanEdit(gridIdx))}
            onSyncFocuse={
              onSyncFocuse &&
              ((scrollInto) => onSyncFocuse(gridIdx, scrollInto))
            }
            onUpdateFocuse={onUpdateFocuse && (() => onUpdateFocuse(gridIdx))}
          />
        )}
        spacing="4px"
      />
    );
  }
);

const isAccented = (gridIdx: number, gridItemIdx: number) => {
  if (gridIdx === TABLE_CENTER_IDX) {
    return gridItemIdx !== TABLE_CENTER_IDX;
  } else {
    return gridItemIdx === TABLE_CENTER_IDX;
  }
};

export default Mandalart;
