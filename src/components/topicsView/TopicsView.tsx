import { useEffect, useState } from 'react';
import PartTopicTables from '../partTopicTables/PartTopicTables';
import TopicTables, { TopicTablesProps } from '../topicTables/TopicTables';
import {
  TopicNode,
  parseTopicNode,
  cloneTopicNode,
} from '../../type/TopicNode';
import styles from './TopicsView.module.css';

const STORAGE_KEY_TOPIC_TREE = 'topicTree';
const TABLE_ROW_SIZE = 3;
const TABLE_COL_SIZE = 3;
const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
const CENTER_IDX = 4;

const getTopicNode = (
  node: TopicNode,
  tableIdx: number,
  tableItemIdx: number
) => {
  const idxs = [tableIdx, tableItemIdx];
  idxs.forEach((idx) => {
    node =
      idx === CENTER_IDX
        ? node
        : node.children[idx < CENTER_IDX ? idx : idx - 1];
  });
  return node;
};

const initialTopicTree = () => {
  const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
  return saved
    ? parseTopicNode(saved)
    : {
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
          text: '',
          children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
            text: '',
            children: [],
          })),
        })),
      };
};

type TopicsViewProps = {
  isViewAll: boolean;
};

const TopicsView = ({ isViewAll }: TopicsViewProps) => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    tableIdx: number,
    tableItemIdx: number
  ) => {
    const newTopicTree = cloneTopicNode(topicTree);
    const changedNode = getTopicNode(newTopicTree, tableIdx, tableItemIdx);
    changedNode.text = ev.target.value;
    setTopicTree(newTopicTree);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

  const topicTablesProps: TopicTablesProps = {
    rowSize: TABLE_ROW_SIZE,
    colSize: TABLE_COL_SIZE,
    getTopicNode: (tableIdx, tableItemIdx) => {
      return getTopicNode(topicTree, tableIdx, tableItemIdx);
    },
    onChange: handleChange,
    onClick: (tableIdx, tableItemIdx) => {
      console.log(`${tableIdx}, ${tableItemIdx}`);
    },
  };

  return (
    <section className={styles.topicsView}>
      {isViewAll ? (
        <TopicTables {...topicTablesProps} />
      ) : (
        <PartTopicTables
          initialFocusedTableIdx={CENTER_IDX}
          {...topicTablesProps}
        />
      )}
    </section>
  );
};

export default TopicsView;
