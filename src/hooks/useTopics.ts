import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import { TopicNode } from 'types/TopicNode';
import useBoolean from 'hooks/useBoolean';

const useTopics = (
  initialTopicTree: TopicNode,
  user: User | null,
  mandalartId: string | null
) => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !mandalartId) return;

    startLoading();
    setError(null);
    const stopSync = repository.syncTopics(
      user.uid,
      mandalartId,
      (topicTree: TopicNode) => {
        endLoading();
        setTopicTree(topicTree);
      },
      (e) => {
        endLoading();
        setError(e);
      }
    );
    return () => stopSync();
  }, [user, mandalartId, startLoading, endLoading]);

  // tuple로 고정
  return [topicTree, setTopicTree, isLoading, error] as const;
};

export default useTopics;
