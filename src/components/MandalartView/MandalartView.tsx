import { useState, useCallback } from 'react';
import ZoomInMandalart from 'components/ZoomInMandalart/ZoomInMandalart';
import Mandalart, { MandalartProps } from 'components/Mandalart/Mandalart';
import { TopicNode } from 'types/TopicNode';
import styles from './MandalartView.module.css';
import {
  MAX_MANDALART_TITLE_SIZE,
  TABLE_CENTER_IDX,
  TMP_MANDALART_ID,
} from 'constants/constants';
import { cloneDeep } from 'lodash';
import MandalartViewToggle from 'components/MandalartViewToggle/MandalartViewToggle';
import { Snippet } from 'types/Snippet';
import TextEditor from 'components/TextEditor/TextEditor';
import useBoolean from 'hooks/useBoolean';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

type MandalartViewProps = {
  mandalartId: string;
  snippet: Snippet;
  topicTree: TopicNode;
  onSnippetChange: (snippet: Snippet) => void;
  onTopicTreeChange: (topicTree: TopicNode) => void;
};

const MandalartView = ({
  mandalartId,
  snippet,
  topicTree,
  onSnippetChange,
  onTopicTreeChange,
}: MandalartViewProps) => {
  const [isAllView, setIsAllView] = useState(true);
  const [isShownTitleEditor, { on: showTitleEditor, off: closeTitleEditor }] =
    useBoolean(false);
  const { t } = useTranslation();

  const handleGetTopic = useCallback(
    (gridIdx: number, gridItemIdx: number) =>
      getTopic(topicTree, gridIdx, gridItemIdx),
    [topicTree]
  );

  const handleUpdateTopic = useCallback(
    (gridIdx: number, gridItemIdx: number, text: string) => {
      const newTopicTree = cloneDeep(topicTree);
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
    <section>
      <div className={styles.titleBar}>
        <Typography variant="body2">
          {mandalartId === TMP_MANDALART_ID && `(${t('mandalart.temp')})`}
        </Typography>
        <Typography variant="h2" onClick={showTitleEditor}>
          {snippet.title ? snippet.title : t('mandalart.snippet.untitled')}
        </Typography>
      </div>
      <div className={styles.mandalart}>
        {isAllView ? (
          <Mandalart {...mandalartProps} />
        ) : (
          <ZoomInMandalart {...mandalartProps} />
        )}
      </div>
      <MandalartViewToggle isAllView={isAllView} onChange={setIsAllView} />
      <TextEditor
        isShown={isShownTitleEditor}
        initialText={snippet.title}
        maxText={MAX_MANDALART_TITLE_SIZE}
        onClose={closeTitleEditor}
        onConfirm={(title) => onSnippetChange({ title })}
      />
    </section>
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
