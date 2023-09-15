import { STORAGE_KEY_TOPIC_TREES } from 'constants/constants';
import { TopicNode } from 'types/TopicNode';
import { useLocalStorage } from 'usehooks-ts';
import { useMemo } from 'react';

const useGuestTopicTrees = () => {
  const [topicTrees, setTopicTrees] = useLocalStorage<
    Record<string, TopicNode>
  >(STORAGE_KEY_TOPIC_TREES, {});

  return useMemo(() => {
    return [
      new Map(Object.entries(topicTrees)),
      (topicTrees: Map<string, TopicNode>) =>
        setTopicTrees(Object.fromEntries(topicTrees)),
    ] as const;
  }, [topicTrees, setTopicTrees]);
};
export default useGuestTopicTrees;
