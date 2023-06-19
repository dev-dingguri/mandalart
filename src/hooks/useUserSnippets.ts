import { User } from 'firebase/auth';
import { useDatabase, useDatabaseListData } from 'reactfire';
import { Snippet } from 'types/Snippet';
import { useMemo } from 'react';
import { DB_SNIPPETS_PATH } from 'constants/constants';
import { ref, push, set, remove } from 'firebase/database';

const useUserSnippets = (user: User) => {
  const db = useDatabase();
  const {
    status,
    data: snippets,
    error,
  } = useDatabaseListData<Snippet & { id: string }>(
    ref(db, `${user.uid}${DB_SNIPPETS_PATH}`),
    {
      idField: 'id',
    }
  );

  const snippetMap = useMemo(
    () =>
      snippets &&
      new Map<string, Snippet>(
        snippets.map((snippet) => [snippet.id, snippet])
      ),
    [snippets]
  );
  const isLoading = status === 'loading';

  // todo: 분리 검토
  const handlers = useMemo(() => {
    return {
      push: (value: Snippet) =>
        push(ref(db, `${user.uid}${DB_SNIPPETS_PATH}`), value),
      set: (mandalartId: string, value: Snippet) =>
        set(ref(db, `${user.uid}${DB_SNIPPETS_PATH}${mandalartId}`), value),
      remove: (mandalartId: string) =>
        remove(ref(db, `${user.uid}${DB_SNIPPETS_PATH}${mandalartId}`)),
    };
  }, [db, user.uid]);

  return { snippetMap, isLoading, error, ...handlers };
};

export default useUserSnippets;
