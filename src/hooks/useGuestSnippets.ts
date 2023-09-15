import { STORAGE_KEY_SNIPPETS } from 'constants/constants';
import { useMemo } from 'react';
import { Snippet } from 'types/Snippet';
import { useLocalStorage } from 'usehooks-ts';

const useGuestSnippets = () => {
  const [snippets, setSnippets] = useLocalStorage<Record<string, Snippet>>(
    STORAGE_KEY_SNIPPETS,
    {}
  );

  return useMemo(() => {
    return [
      new Map(Object.entries(snippets)),
      (snippetMap: Map<string, Snippet>) =>
        setSnippets(Object.fromEntries(snippetMap)),
    ] as const;
  }, [snippets, setSnippets]);
};

export default useGuestSnippets;
