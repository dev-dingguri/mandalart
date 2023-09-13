import { Snippet } from 'types/Snippet';
import { User } from 'firebase/auth';
import useSubscription from './useSubscription';
import useDatabase from './useDatabase';
import { DB_SNIPPETS } from 'constants/constants';

const useUserSnippets = (user: User) => {
  const { subscribeList } = useDatabase<Snippet>(`${user.uid}/${DB_SNIPPETS}`);

  const { data, status, error } =
    useSubscription<Map<string, Snippet>>(subscribeList);

  return {
    snippetMap: data ? data : new Map<string, Snippet>(),
    isLoading: status === 'loading',
    error,
  };
};

export default useUserSnippets;
