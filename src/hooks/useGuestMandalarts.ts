import { useEffect, useState, useCallback, useMemo } from 'react';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import {
  TMP_MANDALART_ID,
  EMPTY_SNIPPET,
  EMPTY_TOPIC_TREE,
} from 'constants/constants';
import { useTranslation } from 'react-i18next';
import { MandalartsHandlers } from 'components/MainContents/MainContents';
import useGuestSnippets from './useGuestSnippets';
import useGuestTopicTrees from './useGuestTopicTrees';

const TMP_SNIPPET_MAP = new Map<string, Snippet>([
  [TMP_MANDALART_ID, EMPTY_SNIPPET],
]);

const TMP_TOPICS_MAP = new Map<string, TopicNode>([
  [TMP_MANDALART_ID, EMPTY_TOPIC_TREE],
]);

const useGuestMandalarts = (): MandalartsHandlers & { isLoading: boolean } => {
  const [snippetMap, setSnippetMap] = useGuestSnippets();
  const [currentMandalartId, selectMandalartId] = useState<string | null>(null);
  const [topicTrees, setTopicTrees] = useGuestTopicTrees();
  const currentTopicTree = useMemo(
    () =>
      currentMandalartId ? topicTrees.get(currentMandalartId) ?? null : null,
    [currentMandalartId, topicTrees]
  );

  // 스니펫이 로딩된 후, 만다라트 id 선택 및 현재 토픽 트리 로딩전까지 로딩 상태가 false인 상황 방지
  // todo: 개선 필요
  const isLoading = snippetMap.size > 0 && (!currentMandalartId || !topicTrees);

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

  useEffect(() => {
    if (currentMandalartId && snippetMap.has(currentMandalartId)) return;
    const last = Array.from(snippetMap.keys()).pop();
    selectMandalartId(last ? last : null);
  }, [snippetMap, currentMandalartId]);

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
