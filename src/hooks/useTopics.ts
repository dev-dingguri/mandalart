import { useEffect, useState } from 'react';
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
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !mandalartId) return;

    startLoading();
    setError(null);
    const stopSync = repository.syncTopics(
      user.uid,
      mandalartId,
      (topicTree: TopicNode) => {
        setTopicTree(topicTree);
        endLoading();
      },
      (e) => {
        setError(e);
        endLoading();
      }
    );
    return () => stopSync();
  }, [user, mandalartId, startLoading, endLoading]);

  return [topicTree, setTopicTree, isLoading, error] as const;
};

export default useTopics;
