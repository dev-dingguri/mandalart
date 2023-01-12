import Table from 'components/Table/Table';
import TopicTable from 'components/TopicTable/TopicTable';
import { TopicNode } from 'types/TopicNode';
import {
  TABLE_ROW_SIZE,
  TABLE_COL_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';
import { memo } from 'react';

export type MandalartProps = {
  onGetTopic: (tableIdx: number, tableItemIdx: number) => TopicNode;
  onUpdateTopic: (tableIdx: number, tableItemIdx: number, text: string) => void;
  onCanEdit?: (tableIdx: number) => boolean;
  onSyncFocuse?: (
    tableIdx: number,
    scrollInto: (options?: ScrollIntoViewOptions) => void
  ) => void;
  onUpdateFocuse?: (tableIdx: number) => void;
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
      <Table
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        cellGenerater={(tableIdx) => (
          // 다른 table의 값 읽기/쓰기를 제한하기 위해 아래와 같이 처리하였음
          <TopicTable
            onIsAccented={(tableItemIdx) => isAccented(tableIdx, tableItemIdx)}
            onGetTopic={(tableItemIdx) => onGetTopic(tableIdx, tableItemIdx)}
            onUpdateTopic={(tableItemIdx, text) =>
              onUpdateTopic(tableIdx, tableItemIdx, text)
            }
            onCanEdit={onCanEdit && (() => onCanEdit(tableIdx))}
            onSyncFocuse={
              onSyncFocuse &&
              ((scrollInto) => onSyncFocuse(tableIdx, scrollInto))
            }
            onUpdateFocuse={onUpdateFocuse && (() => onUpdateFocuse(tableIdx))}
          />
        )}
        space="4px"
      />
    );
  }
);

const isAccented = (tableIdx: number, tableItemIdx: number) => {
  if (tableIdx === TABLE_CENTER_IDX) {
    return tableItemIdx !== TABLE_CENTER_IDX;
  } else {
    return tableItemIdx === TABLE_CENTER_IDX;
  }
};

export default Mandalart;
