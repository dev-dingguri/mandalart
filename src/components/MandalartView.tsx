import { useCallback, HTMLAttributes, useState } from 'react';
import MandalartFocusView from '@/components/MandalartFocusView';
import Mandalart, { MandalartProps } from '@/components/Mandalart';
import { MandalartMeta, TopicNode } from '@/types';
import {
  MAX_MANDALART_TITLE_SIZE,
  TABLE_CENTER_IDX,
  TMP_MANDALART_ID,
} from '@/constants';
import MandalartViewToggle from '@/components/MandalartViewToggle';
import TextInputDialog from '@/components/TextInputDialog';
import { useTranslation } from 'react-i18next';
import { trackViewModeChange } from '@/lib/analyticsEvents';
import { useModal } from '@/hooks/useModal';

type MandalartViewProps = {
  mandalartId: string;
  meta: MandalartMeta;
  topicTree: TopicNode;
  onMandalartMetaChange: (meta: MandalartMeta) => void;
  onTopicTreeChange: (topicTree: TopicNode) => void;
} & HTMLAttributes<HTMLDivElement>;

const MandalartView = ({
  mandalartId,
  meta,
  topicTree,
  onMandalartMetaChange,
  onTopicTreeChange,
  className,
  ...rest
}: MandalartViewProps) => {
  const [isAllView, setIsAllView] = useState(true);
  const { isOpen: isOpenTitleEditor, open: openTitleEditor, close: closeTitleEditor } = useModal();

  const { t } = useTranslation();

  const handleGetTopic = useCallback(
    (gridIdx: number, gridItemIdx: number) =>
      getTopic(topicTree, gridIdx, gridItemIdx),
    [topicTree]
  );

  const handleUpdateTopic = useCallback(
    (gridIdx: number, gridItemIdx: number, text: string) => {
      const newTopicTree = structuredClone(topicTree);
      const newTopic = getTopic(newTopicTree, gridIdx, gridItemIdx);
      newTopic.text = text;
      onTopicTreeChange(newTopicTree);
    },
    [topicTree, onTopicTreeChange]
  );

  const mandalartProps: MandalartProps = {
    onGetTopic: handleGetTopic,
    onUpdateTopic: handleUpdateTopic,
  };

  return (
    <div className={className} {...rest}>
      <p className="text-sm text-muted-foreground">
        {mandalartId === TMP_MANDALART_ID && `(${t('mandalart.temp')})`}
      </p>
      <div className="flex items-center gap-3">
        <h2
          role="button"
          tabIndex={0}
          className="min-w-0 flex-1 cursor-pointer select-none truncate text-2xl font-semibold"
          onClick={() => openTitleEditor()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openTitleEditor();
            }
          }}
        >
          {meta.title ? meta.title : t('mandalart.untitled')}
        </h2>
        <MandalartViewToggle
          isAllView={isAllView}
          onChange={(val) => {
            setIsAllView(val);
            trackViewModeChange(val ? 'all' : 'focus');
          }}
        />
      </div>
      <div className="mb-2 mt-3">
        {isAllView ? (
          <Mandalart {...mandalartProps} />
        ) : (
          <MandalartFocusView {...mandalartProps} />
        )}
      </div>
      <TextInputDialog
        isOpen={isOpenTitleEditor}
        initialText={meta.title}
        textLimit={MAX_MANDALART_TITLE_SIZE}
        onClose={closeTitleEditor}
        onConfirm={(title) => onMandalartMetaChange({ title })}
      />
    </div>
  );
};

const getTopic = (
  topicTree: TopicNode,
  gridIdx: number,
  gridItemIdx: number
) => {
  let node = topicTree;
  [gridIdx, gridItemIdx].forEach((idx) => {
    if (idx !== TABLE_CENTER_IDX) {
      node = node.children[idx < TABLE_CENTER_IDX ? idx : idx - 1];
    }
  });
  if (!node) {
    throw new Error('Cannot get topicNode.');
  }
  return node;
};

export default MandalartView;
