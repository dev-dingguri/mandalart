import { User } from 'firebase/auth';
import { TopicNode } from 'types/TopicNode';
import useSubscription from './useSubscription';
import { useCallback } from 'react';
import useDatabase from './useDatabase';
import { DB_TOPIC_TREES } from 'constants/constants';

const useUserTopics = (user: User, mandalartId: string | null) => {
  const { subscribe } = useDatabase<TopicNode>(`${user.uid}/${DB_TOPIC_TREES}`);

  const subscribeWithKey = useCallback(
    (
      updateCallback: (data: TopicNode | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      // todo: subscribe 내부에서 처리 검토
      if (!mandalartId) {
        updateCallback(null);
        return;
      }
      return subscribe(mandalartId, updateCallback, cancelCallback);
    },
    [mandalartId, subscribe]
  );

  const { data, status, error } = useSubscription<TopicNode>(subscribeWithKey);

  return { topicTree: data, isLoading: status === 'loading', error };
};

export default useUserTopics;
