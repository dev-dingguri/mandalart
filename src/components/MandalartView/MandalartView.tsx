import { memo, useState } from 'react';
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
import MandalartViewType from 'components/MandalartViewType/MandalartViewType';
import { Snippet } from 'types/Snippet';
import TextEditor from 'components/TextEditor/TextEditor';
import useBoolean from 'hooks/useBoolean';
import { useTranslation } from 'react-i18next';

type MandalartViewProps = {
  mandalartId: string;
  snippet: Snippet;
  topicTree: TopicNode;
  onSnippetChange: (snippet: Snippet) => void;
  onTopicTreeChange: (topicTree: TopicNode) => void;
};

const MandalartView = memo(
  ({
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

    const handleUpdateTopic = (
      tableIdx: number,
      tableItemIdx: number,
      text: string
    ) => {
      const newTopicTree = cloneDeep(topicTree);
      const newTopic = getTopic(newTopicTree, tableIdx, tableItemIdx);
      newTopic.text = text;
      onTopicTreeChange(newTopicTree);
    };

    const topicTablesProps: MandalartProps = {
      onGetTopic: (tableIdx, tableItemIdx) =>
        getTopic(topicTree, tableIdx, tableItemIdx),
      onUpdateTopic: handleUpdateTopic,
    };

    return (
      <section>
        <div className={styles.titleBar}>
          {mandalartId === TMP_MANDALART_ID && (
            <h1 className={styles.draft}>{`(${t('mandalart.draft')})`}</h1>
          )}
          <h1 className={styles.title} onClick={showTitleEditor}>
            {snippet.title}
          </h1>
        </div>
        <div className={styles.mandalart}>
          <div className={styles.container}>
            {isAllView ? (
              <Mandalart {...topicTablesProps} />
            ) : (
              <ZoomInMandalart {...topicTablesProps} />
            )}
          </div>
        </div>
        <MandalartViewType isAllView={isAllView} onChange={setIsAllView} />
        <TextEditor
          isShown={isShownTitleEditor}
          initialText={snippet.title}
          maxText={MAX_MANDALART_TITLE_SIZE}
          onClose={closeTitleEditor}
          onConfirm={(title) => onSnippetChange({ title })}
        />
      </section>
    );
  }
);

const getTopic = (
  topicTree: TopicNode,
  tableIdx: number,
  tableItemIdx: number
) => {
  let node = topicTree;
  [tableIdx, tableItemIdx].forEach((idx) => {
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
