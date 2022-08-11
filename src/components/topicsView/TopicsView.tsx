import { useEffect, useState } from 'react';
import TopicTables from '../topicTables/TopicTables';
import styles from './TopicsView.module.css';

const STORAGE_KEY_TOPIC_TREE = 'topicTree';
const TABLE_ROW_SIZE = 3;
const TABLE_COL_SIZE = 3;
const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
const CENTRAL_IDX = 4;

type TopicNode = {
  text: string;
  /** length: 0 or TABLE_SIZE */
  children: TopicNode[];
};

const deepCopy = (node: TopicNode): TopicNode => {
  return JSON.parse(JSON.stringify(node));
};

const isCentral = (tableIdx: number) => {
  return tableIdx === CENTRAL_IDX;
};

const toTopicNodeChildrenIdx = (tableIdx: number) => {
  return tableIdx > CENTRAL_IDX ? tableIdx - 1 : tableIdx;
};

const initialTopicTree = (): TopicNode => {
  const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
  return saved
    ? JSON.parse(saved)
    : {
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => {
          return {
            text: '',
            children: Array.from({ length: TABLE_SIZE - 1 }, () => {
              return { text: '', children: [] };
            }),
          };
        }),
      };
};

const TopicsView = () => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    tableIdx: number,
    tableItemIdx: number
  ) => {
    const newTopicTree = deepCopy(topicTree);
    let topicNode = isCentral(tableIdx)
      ? newTopicTree
      : newTopicTree.children[toTopicNodeChildrenIdx(tableIdx)];
    topicNode = isCentral(tableItemIdx)
      ? topicNode
      : topicNode.children[toTopicNodeChildrenIdx(tableItemIdx)];
    topicNode.text = ev.target.value;
    setTopicTree(newTopicTree);
  };

  const getTopics = (tableIdx: number) => {
    const topicNode = isCentral(tableIdx)
      ? topicTree
      : topicTree.children[toTopicNodeChildrenIdx(tableIdx)];
    const topics = topicNode.children.map((node) => node.text);
    topics.splice(CENTRAL_IDX, 0, topicNode.text);
    return topics;
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

  return (
    <section className={styles.topicsView}>
      <TopicTables
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        getTopics={getTopics}
        onChange={handleChange}
      />
    </section>
  );
};

export default TopicsView;
