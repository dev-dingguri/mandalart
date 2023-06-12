import { useState, useEffect } from 'react';
import { Snippet } from 'types/Snippet';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import useBoolean from 'hooks/useBoolean';

const useSnippets = (
  initialSnippetMap: Map<string, Snippet>,
  user: User | null
) => {
  const [snippetMap, setSnippetMap] = useState(initialSnippetMap);
  const [isSyncing, { on: startSyncing, off: stopSyncing }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);
  const isLoading = user !== null && !isSyncing;

  useEffect(() => {
    stopSyncing();
    setError(null);

    if (!user) return;
    return repository.syncSnippets(
      user.uid,
      (snippetMap) => {
        setSnippetMap(snippetMap);
        startSyncing();
      },
      (e) => {
        setError(e);
        startSyncing();
      }
    );
  }, [user, startSyncing, stopSyncing]);

  return { snippetMap, setSnippetMap, isLoading, error };
};

export default useSnippets;
