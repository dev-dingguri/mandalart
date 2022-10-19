import { useState } from 'react';
import PartTopicTables from 'components/partTopicTables/PartTopicTables';
import TopicTables, {
  TopicTablesProps,
} from 'components/topicTables/TopicTables';
import { TopicNode, cloneTopicNode } from 'types/TopicNode';
import styles from './TopicsView.module.css';
import TopicEditor from 'components/topicEditor/TopicEditor';
import { TABLE_CENTER_IDX } from 'common/const';

const getTopicNode = (
  topicTree: TopicNode,
  tableIdx: number,
  tableItemIdx: number
) => {
  let node = topicTree;
  const idxs = [tableIdx, tableItemIdx];
  idxs.forEach((idx) => {
    node =
      idx === TABLE_CENTER_IDX
        ? node
        : node.children[idx < TABLE_CENTER_IDX ? idx : idx - 1];
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
    const newTopicTree = cloneTopicNode(topicTree);
    const newTopic = getTopicNode(newTopicTree, tableIdx, tableItemIdx);
    newTopic.text = text;
    onTopicTreeChange(newTopicTree);
  };

  const isShownEditor = () => {
    return editingTopicPos !== null;
  };

  const handleStartEditor = (tableIdx: number, tableItemIdx: number) => {
    setEditingTopicPos({ tableIdx, tableItemIdx });
  };

  const handleEnterEditor = (text: string) => {
    if (!editingTopicPos) return;

    const { tableIdx, tableItemIdx } = editingTopicPos;
    updateItem(tableIdx, tableItemIdx, text);
    setEditingTopicPos(null);
  };

  const handleCloseEditor = () => {
    setEditingTopicPos(null);
  };

  const getEditingTopicText = () => {
    if (!editingTopicPos) return '';

    const { tableIdx, tableItemIdx } = editingTopicPos;
    return getTopicNode(topicTree, tableIdx, tableItemIdx).text;
  };

  const topicTablesProps: TopicTablesProps = {
    getTopicNode: (tableIdx, tableItemIdx) =>
      getTopicNode(topicTree, tableIdx, tableItemIdx),
    onTopicClick: handleStartEditor,
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
      <TopicEditor
        isShown={isShownEditor()}
        text={getEditingTopicText()}
        onClose={handleCloseEditor}
        onEnter={handleEnterEditor}
      />
    </>
  );
};

export default TopicsView;
