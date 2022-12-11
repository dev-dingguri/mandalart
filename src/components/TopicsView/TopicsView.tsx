import { useState } from 'react';
import PartTopicTables from 'components/PartTopicTables/PartTopicTables';
import TopicTables, {
  TopicTablesProps,
} from 'components/TopicTables/TopicTables';
import { TopicNode } from 'types/TopicNode';
import styles from './TopicsView.module.css';
import { TABLE_CENTER_IDX } from 'constants/constants';
import TextEditor from 'components/TextEditor/TextEditor';
import { cloneDeep } from 'lodash';

const getTopicNode = (
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
    throw new Error('cannot get node');
  }
  return node;
};

type TopicsViewProps = {
  isAllView: boolean;
  topicTree: TopicNode;
  onTopicTreeChange: (topicTree: TopicNode) => void;
};

const TopicsView = ({
  isAllView,
  topicTree,
  onTopicTreeChange,
}: TopicsViewProps) => {
  const [editingTopicPos, setEditingTopicPos] = useState<{
    tableIdx: number;
    tableItemIdx: number;
  } | null>(null);

  const updateItem = (tableIdx: number, tableItemIdx: number, text: string) => {
    const newTopicTree = cloneDeep(topicTree);
    const newTopic = getTopicNode(newTopicTree, tableIdx, tableItemIdx);
    newTopic.text = text;
    onTopicTreeChange(newTopicTree);
  };

  const isShownTopicEditor = () => {
    return editingTopicPos !== null;
  };

  const handleShowTopicEditor = (tableIdx: number, tableItemIdx: number) => {
    setEditingTopicPos({ tableIdx, tableItemIdx });
  };

  const handleCloseTopicEditor = () => {
    setEditingTopicPos(null);
  };

  const handleTopicEditorEnter = (text: string) => {
    if (!editingTopicPos) return;

    const { tableIdx, tableItemIdx } = editingTopicPos;
    updateItem(tableIdx, tableItemIdx, text);
    handleCloseTopicEditor();
  };

  const getEditingTopicText = () => {
    if (!editingTopicPos) return '';

    const { tableIdx, tableItemIdx } = editingTopicPos;
    return getTopicNode(topicTree, tableIdx, tableItemIdx).text;
  };

  const topicTablesProps: TopicTablesProps = {
    getTopicNode: (tableIdx, tableItemIdx) =>
      getTopicNode(topicTree, tableIdx, tableItemIdx),
    onShowTopicEditor: handleShowTopicEditor,
  };

  return (
    <>
      <section className={styles.topicsView}>
        <div className={styles.container}>
          {isAllView ? (
            <TopicTables {...topicTablesProps} />
          ) : (
            <PartTopicTables {...topicTablesProps} />
          )}
        </div>
      </section>
      <TextEditor
        isShown={isShownTopicEditor()}
        title={'Topic'}
        value={getEditingTopicText()}
        placeholder={'Please enter your content.'}
        onClose={handleCloseTopicEditor}
        onEnter={handleTopicEditorEnter}
      />
    </>
  );
};

export default TopicsView;
