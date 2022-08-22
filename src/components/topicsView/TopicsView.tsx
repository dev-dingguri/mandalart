import { useEffect, useRef, useState } from 'react';
import PartTopicTables from '../partTopicTables/PartTopicTables';
import TopicTables, { TopicTablesProps } from '../topicTables/TopicTables';
import {
  TopicNode,
  parseTopicNode,
  cloneTopicNode,
} from '../../type/TopicNode';
import styles from './TopicsView.module.css';
import TopicInputModal from '../topicInputModal/TopicInputModal';

const STORAGE_KEY_TOPIC_TREE = 'topicTree';
const TABLE_ROW_SIZE = 3;
const TABLE_COL_SIZE = 3;
const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
const CENTER_IDX = 4;

const getTopicNode = (
  topicTree: TopicNode,
  tableIdx: number,
  tableItemIdx: number
) => {
  let node = topicTree;
  const idxs = [tableIdx, tableItemIdx];
  idxs.forEach((idx) => {
    node =
      idx === CENTER_IDX
        ? node
        : node.children[idx < CENTER_IDX ? idx : idx - 1];
  });
  if (!node) {
    throw new Error('cannot get node');
  }
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
  const [isShowTopicInputModal, setIsShowTopicInputModal] = useState(false);
  const updateTopicNodePosRef = useRef<{
    tableIdx: number;
    tableItemIdx: number;
  }>();

  const updateItem = (tableIdx: number, tableItemIdx: number, text: string) => {
    const newTopicTree = cloneTopicNode(topicTree);
    const newTopic = getTopicNode(newTopicTree, tableIdx, tableItemIdx);
    newTopic.text = text;
    setTopicTree(newTopicTree);
  };

  const handleTopicInputModalEnter = (text: string) => {
    if (updateTopicNodePosRef.current) {
      const { tableIdx, tableItemIdx } = updateTopicNodePosRef.current;
      updateItem(tableIdx, tableItemIdx, text);
    }
    setIsShowTopicInputModal(false);
  };

  const getTopicInputModalTopicText = () => {
    if (updateTopicNodePosRef.current) {
      const { tableIdx, tableItemIdx } = updateTopicNodePosRef.current;
      return getTopicNode(topicTree, tableIdx, tableItemIdx).text;
    }
    return '';
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

  const topicTablesProps: TopicTablesProps = {
    rowSize: TABLE_ROW_SIZE,
    colSize: TABLE_COL_SIZE,
    getTopicNode: (tableIdx, tableItemIdx) =>
      getTopicNode(topicTree, tableIdx, tableItemIdx),
    onClick: (tableIdx, tableItemIdx) => {
      updateTopicNodePosRef.current = { tableIdx, tableItemIdx };
      setIsShowTopicInputModal(true);
    },
  };

  return (
    <>
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
      <TopicInputModal
        isShow={isShowTopicInputModal}
        text={getTopicInputModalTopicText()}
        onClose={() => setIsShowTopicInputModal(false)}
        onEnter={handleTopicInputModalEnter}
      />
    </>
  );
};

export default TopicsView;
