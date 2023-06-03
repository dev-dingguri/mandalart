import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import { TopicNode } from 'types/TopicNode';
import { Unsubscribe } from 'firebase/database';
import { useQueryClient, useQuery, hashQueryKey } from '@tanstack/react-query';

const unsubscribes: Record<string, Unsubscribe> = {};

const useTopics = (
  initialTopicTree: TopicNode | null,
  user: User | null,
  mandalartId: string | null
) => {
  const [topicTree, setTopicTree] = useState<TopicNode | null>(
    initialTopicTree
  );
  const queryClient = useQueryClient();
  const queryKey = ['repository/syncTopics', user, mandalartId];
  const queryKeyHash = hashQueryKey(queryKey);
  // useEffect에 비해서 너무 복잡함
  const { data: syncTopicTree, ...rest } = useQuery<TopicNode | null, Error>({
    queryKey,
    queryFn: async () => {
      if (!user) return null;
      if (!mandalartId) return null;
      if (unsubscribes[queryKeyHash]) return null;
      return new Promise((resolve, reject) => {
        let isFirst = true;
        unsubscribes[queryKeyHash] = repository.syncTopics(
          user.uid,
          mandalartId,
          (topicTree) => {
            if (isFirst) {
              isFirst = false;
              resolve(topicTree);
            } else {
              queryClient.setQueryData(queryKey, topicTree);
            }
          },
          reject
        );
      });
    },
  });

  useEffect(() => {
    // unsubscribes의 원소를 삭제해야하기 때문에 keys를 먼저 복사합니다.
    Object.keys(unsubscribes).forEach((key) => {
      if (key !== queryKeyHash) {
        unsubscribes[key]();
        delete unsubscribes[key];
      }
    });
  }, [queryKeyHash]);

  useEffect(() => {
    syncTopicTree && setTopicTree(syncTopicTree);
  }, [syncTopicTree]);

  return { topicTree, updateTopicTree: setTopicTree, ...rest };
};

export default useTopics;
