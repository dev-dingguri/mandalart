import { useState, useCallback, HTMLAttributes } from 'react';
import MandalartFocusView from 'components/MandalartFocusView';
import Mandalart, { MandalartProps } from 'components/Mandalart';
import { TopicNode } from 'types/TopicNode';
import {
  MAX_TOPIC_TEXT_SIZE,
  TABLE_CENTER_IDX,
  TMP_MANDALART_ID,
} from 'constants/constants';
import MandalartViewToggle from 'components/MandalartViewToggle';
import { Snippet } from 'types/Snippet';
import TextInputDialog from 'components/TextInputDialog';
import { useTranslation } from 'react-i18next';

type MandalartViewProps = {
  mandalartId: string;
  snippet: Snippet;
  topicTree: TopicNode;
  onSnippetChange: (snippet: Snippet) => void;
  onTopicTreeChange: (topicTree: TopicNode) => void;
} & HTMLAttributes<HTMLDivElement>;

const MandalartView = ({
  mandalartId,
  snippet,
  topicTree,
  onSnippetChange,
  onTopicTreeChange,
  className,
  ...rest
}: MandalartViewProps) => {
  const [isAllView, setIsAllView] = useState(true);
  const [isOpenTitleEditor, setIsOpenTitleEditor] = useState(false);

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
          className="min-w-0 flex-1 cursor-pointer select-none truncate text-2xl font-semibold"
          onClick={() => setIsOpenTitleEditor(true)}
        >
          {snippet.title ? snippet.title : t('mandalart.snippet.untitled')}
        </h2>
        <MandalartViewToggle isAllView={isAllView} onChange={setIsAllView} />
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
        initialText={snippet.title}
        textLimit={MAX_TOPIC_TEXT_SIZE}
        onClose={() => setIsOpenTitleEditor(false)}
        onConfirm={(title) => onSnippetChange({ title })}
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
