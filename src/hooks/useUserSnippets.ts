import { User } from 'firebase/auth';
import { ref } from 'firebase/database';
import { useDatabase, useDatabaseListData } from 'reactfire';
import { Snippet } from 'types/Snippet';
import { useMemo } from 'react';

const SNIPPETS_PATH = '/mandalarts/snippets/';

const useUserSnippets = (user: User) => {
  const database = useDatabase();
  const snippetsRef = ref(database, `${user.uid}${SNIPPETS_PATH}`);
  const {
    status,
    data: snippets,
    error,
  } = useDatabaseListData<Snippet & { id: string }>(snippetsRef, {
    idField: 'id',
  });

  const snippetMap = useMemo(
    () =>
      snippets
        ? new Map<string, Snippet>(
            snippets.map((snippet) => [snippet.id, snippet])
          )
        : null,
    [snippets]
  );
  const isLoading = status === 'loading';

  return { snippetMap, isLoading, error };
};

export default useUserSnippets;
