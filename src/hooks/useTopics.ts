import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import { TopicNode } from 'types/TopicNode';
import useBoolean from 'hooks/useBoolean';

const useTopics = (
  initialTopicTree: TopicNode | null,
  user: User | null,
  mandalartId: string | null
) => {
  const [topicTree, setTopicTree] = useState<TopicNode | null>(
    initialTopicTree
  );
  const [isSyncing, { on: startSyncing, off: stopSyncing }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);
  const isLoading = user && !isSyncing;

  useEffect(() => {
    stopSyncing();
    setError(null);

    if (!user || !mandalartId) return;
    return repository.syncTopics(
      user.uid,
      mandalartId,
      (topicTree: TopicNode) => {
        setTopicTree(topicTree);
        startSyncing();
      },
      (e) => {
        setError(e);
        startSyncing();
      }
    );
  }, [user, mandalartId, startSyncing, stopSyncing]);

  return [topicTree, setTopicTree, isLoading, error] as const;
};

export default useTopics;
