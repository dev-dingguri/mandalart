import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import { TopicNode } from 'types/TopicNode';
import useSubscription from './useSubscription';
import { useCallback } from 'react';

const useUserTopics = (user: User, mandalartId: string | null) => {
  const subscribe = useCallback(
    (
      updateCallback: (data: TopicNode | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      if (!mandalartId) {
        updateCallback(null);
        return;
      }
      return repository.syncTopics(
        user.uid,
        mandalartId,
        updateCallback,
        cancelCallback
      );
    },
    [user.uid, mandalartId]
  );

  const { data, status, error } = useSubscription<TopicNode>(subscribe);

  return { topicTree: data, isLoading: status === 'loading', error };
};

export default useUserTopics;
