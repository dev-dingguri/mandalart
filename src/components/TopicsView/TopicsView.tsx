import { memo } from 'react';
import PartTopicTables from 'components/PartTopicTables/PartTopicTables';
import TopicTables, {
  TopicTablesProps,
} from 'components/TopicTables/TopicTables';
import { TopicNode } from 'types/TopicNode';
import styles from './TopicsView.module.css';
import { TABLE_CENTER_IDX } from 'constants/constants';
import { cloneDeep } from 'lodash';

type TopicsViewProps = {
  isAllView: boolean;
  topicTree: TopicNode;
  onTopicTreeChange: (topicTree: TopicNode) => void;
};

const TopicsView = memo(
  ({ isAllView, topicTree, onTopicTreeChange }: TopicsViewProps) => {
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

    const topicTablesProps: TopicTablesProps = {
      onGetTopic: (tableIdx, tableItemIdx) =>
        getTopic(topicTree, tableIdx, tableItemIdx),
      onUpdateTopic: handleUpdateTopic,
    };

    return (
      <section className={styles.topicsView}>
        <div className={styles.container}>
          {isAllView ? (
            <TopicTables {...topicTablesProps} />
          ) : (
            <PartTopicTables {...topicTablesProps} />
          )}
        </div>
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

export default TopicsView;
