import { useEffect, useState } from 'react';
import { Snippet } from 'types/Snippet';
import { User } from 'firebase/auth';
import repository from 'services/mandalartsRepository';
import useBoolean from 'hooks/useBoolean';

const useSnippets = (
  initialSnippetMap: Map<string, Snippet>,
  user: User | null
) => {
  const [snippetMap, setSnippetMap] = useState(initialSnippetMap);
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    startLoading();
    setError(null);
    const stopSync = repository.syncSnippets(
      user.uid,
      (snippetMap) => {
        endLoading();
        setSnippetMap(snippetMap);
      },
      (e) => {
        endLoading();
        setError(e);
      }
    );
    return () => stopSync();
  }, [user, startLoading, endLoading]);

  // tuple로 고정
  return [snippetMap, setSnippetMap, isLoading, error] as const;
};

export default useSnippets;
