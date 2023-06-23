import { Snippet } from 'types/Snippet';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import useSubscription from './useSubscription';
import { useCallback } from 'react';

const useUserSnippets = (user: User) => {
  const subscribe = useCallback(
    (
      updateCallback: (data: Map<string, Snippet> | null) => void,
      cancelCallback: (error: Error) => void
    ) => repository.syncSnippets(user.uid, updateCallback, cancelCallback),
    [user.uid]
  );
  const { data, status, error } =
    useSubscription<Map<string, Snippet>>(subscribe);

  return {
    snippetMap: data ? data : new Map<string, Snippet>(),
    isLoading: status === 'loading',
    error,
  };
};

export default useUserSnippets;
