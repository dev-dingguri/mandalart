import { useState, useEffect } from 'react';
import { Snippet } from 'types/Snippet';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import { Unsubscribe } from 'firebase/database';
import { hashQueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

const unsubscribes: Record<string, Unsubscribe> = {};

const useSnippets = (
  initialSnippetMap: Map<string, Snippet>,
  user: User | null
) => {
  const [snippetMap, setSnippetMap] = useState(initialSnippetMap);
  const queryClient = useQueryClient();
  const queryKey = ['repository/syncSnippets', user];
  const queryKeyHash = hashQueryKey(queryKey);
  // useEffect에 비해서 너무 복잡함
  const { data: syncSnippetMap, ...rest } = useQuery<
    Map<string, Snippet> | null,
    Error
  >({
    queryKey,
    queryFn: async () => {
      if (!user) return null;
      if (unsubscribes[queryKeyHash]) return null;
      return new Promise((resolve, reject) => {
        let isFirst = true;
        unsubscribes[queryKeyHash] = repository.syncSnippets(
          user.uid,
          (snippetMap) => {
            if (isFirst) {
              isFirst = false;
              resolve(snippetMap);
            } else {
              queryClient.setQueryData(queryKey, snippetMap);
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
    syncSnippetMap && setSnippetMap(syncSnippetMap);
  }, [syncSnippetMap]);

  return { snippetMap, updateSnippetMap: setSnippetMap, ...rest };
};

export default useSnippets;
