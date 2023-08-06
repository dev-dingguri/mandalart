import { useEffect, useCallback, useMemo } from 'react';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import {
  TMP_MANDALART_ID,
  EMPTY_SNIPPET,
  EMPTY_TOPIC_TREE,
} from 'constants/constants';
import { useTranslation } from 'react-i18next';
import { MandalartsHandlers } from 'components/MainContent/MainContent';
import useGuestSnippets from './useGuestSnippets';
import useGuestTopicTrees from './useGuestTopicTrees';
import useMandalartSelector from './useMandalartSelector';

const TMP_SNIPPET_MAP = new Map<string, Snippet>([
  [TMP_MANDALART_ID, EMPTY_SNIPPET],
]);

const TMP_TOPICS_MAP = new Map<string, TopicNode>([
  [TMP_MANDALART_ID, EMPTY_TOPIC_TREE],
]);

const useGuestMandalarts = (): MandalartsHandlers & { isLoading: boolean } => {
  const [snippetMap, setSnippetMap] = useGuestSnippets();
  const {
    mandalartId: currentMandalartId,
    isSelected,
    selectMandalart: selectMandalartId,
  } = useMandalartSelector(snippetMap);
  const [topicTrees, setTopicTrees] = useGuestTopicTrees();
  const currentTopicTree = useMemo(
    () =>
      currentMandalartId ? topicTrees.get(currentMandalartId) ?? null : null,
    [currentMandalartId, topicTrees]
  );

  const isLoading = !isSelected;

  const { t } = useTranslation();

  const createMandalart = useCallback(async () => {
    throw new Error(`${t('mandalart.errors.create.signInRequired')}`);
  }, [t]);

  const deleteMandalart = useCallback(async () => {
    throw new Error('unsupported feature.');
  }, []);

  const saveSnippet = useCallback(
    async (mandalartId: string | null, snippet: Snippet) => {
      if (!mandalartId) return;
      const newSnippetMap = new Map(snippetMap).set(mandalartId, snippet);
      setSnippetMap(newSnippetMap);
    },
    [snippetMap, setSnippetMap]
  );

  const saveTopicTree = useCallback(
    async (mandalartId: string | null, topicTree: TopicNode) => {
      if (!mandalartId) return;
      setTopicTrees(new Map(topicTrees).set(mandalartId, topicTree));
    },
    [topicTrees, setTopicTrees]
  );

  useEffect(() => {
    if (snippetMap.size > 0 && topicTrees.size > 0) return;
    setSnippetMap(TMP_SNIPPET_MAP);
    setTopicTrees(TMP_TOPICS_MAP);
  }, [snippetMap.size, topicTrees.size, setSnippetMap, setTopicTrees]);

  return {
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    isLoading,
    selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopicTree,
  };
};

export default useGuestMandalarts;
