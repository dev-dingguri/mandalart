import { useState, useEffect, useMemo } from 'react';
import { Snippet } from 'types/Snippet';

const useMandalartSelector = (snippets: Map<string, Snippet>) => {
  const [mandalartId, setMandalartId] = useState<string | null>(null);
  const isSelected = useMemo(
    () => !!mandalartId && snippets.has(mandalartId),
    [snippets, mandalartId]
  );

  useEffect(() => {
    if (isSelected) return;
    const last = Array.from(snippets.keys()).pop();
    setMandalartId(last ?? null);
  }, [isSelected, snippets]);

  return {
    mandalartId,
    isSelected,
    selectMandalart: setMandalartId,
  };
};

export default useMandalartSelector;
