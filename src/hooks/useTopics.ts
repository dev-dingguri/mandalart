import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import repository from 'services/mandalartRepository';
import { TopicNode } from 'types/TopicNode';

const useTopics = (
  initialTopicTree: TopicNode,
  user: User | null,
  mandalartId: string | null
) => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !mandalartId) return;

    setIsLoading(true);
    setError(null);
    const stopSync = repository.syncTopics(
      user.uid,
      mandalartId,
      (topicTree: TopicNode) => {
        setTopicTree(topicTree);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      }
    );
    return () => stopSync();
  }, [user, mandalartId]);

  // tuple로 고정
  return [topicTree, setTopicTree, isLoading, error] as const;
};

export default useTopics;
