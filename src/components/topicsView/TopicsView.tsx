import { useEffect, useState } from 'react';
import PartTopicTables from '../partTopicTables/PartTopicTables';
import TopicTables, { TopicTablesProps } from '../topicTables/TopicTables';
import {
  TopicNode,
  parseTopicNode,
  cloneTopicNode,
} from '../../type/TopicNode';
import styles from './TopicsView.module.css';
import TopicEditor from '../topicEditor/TopicEditor';
import { User } from 'firebase/auth';
import topicRepository from '../../service/topicRepository';
import { TABLE_SIZE, TABLE_CENTER_IDX } from '../../common/const';

const STORAGE_KEY_TOPIC_TREE = 'topicTree';

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
  isAllView: boolean;
  user: User | null;
};

const TopicsView = ({ isAllView, user }: TopicsViewProps) => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);
  const [editingTopicPos, setEditingTopicPos] = useState<{
    tableIdx: number;
    tableItemIdx: number;
  } | null>(null);

  const updateItem = (tableIdx: number, tableItemIdx: number, text: string) => {
    const newTopicTree = cloneTopicNode(topicTree);
    const newTopic = getTopicNode(newTopicTree, tableIdx, tableItemIdx);
    newTopic.text = text;
    setTopicTree(newTopicTree);

    // todo: useEffect(() => {...}, [topicTree, user]); 에서 처리 검토
    if (user) {
      console.log('saveTopics');
      topicRepository.saveTopics(user.uid, newTopicTree);
    }
  };

  const isShowEditor = () => {
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

  useEffect(() => {
    if (user) {
      const stopSync = topicRepository.syncTopics(
        user.uid,
        (topicTree: TopicNode) => {
          console.log('onUpdate');
          setTopicTree(topicTree);
        }
      );
      return () => {
        console.log('stopSync');
        stopSync();
      };
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

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
        isShow={isShowEditor()}
        text={getEditingTopicText()}
        onClose={handleCloseEditor}
        onEnter={handleEnterEditor}
      />
    </>
  );
};

export default TopicsView;
