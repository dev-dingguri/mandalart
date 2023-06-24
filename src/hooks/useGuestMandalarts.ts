import { useEffect, useState, useCallback } from 'react';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import {
  TMP_MANDALART_ID,
  DEFAULT_SNIPPET,
  DEFAULT_TOPIC_TREE,
} from 'constants/constants';
import mandalartsStorage from '../services/mandalartsStorage';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { MandalartsHandlers } from 'components/MainContents/MainContents';

const TMP_SNIPPET_MAP = new Map<string, Snippet>([
  [TMP_MANDALART_ID, DEFAULT_SNIPPET],
]);

const useGuestMandalarts = (
  initialSnippetMap: Map<string, Snippet>,
  initialMandalartId: string | null,
  initialTopicTree: TopicNode | null
): MandalartsHandlers => {
  const [snippetMap, updateSnippetMap] = useState(initialSnippetMap);

  const [currentMandalartId, selectMandalartId] = useState<string | null>(
    initialMandalartId
  );
  const [currentTopicTree, updateTopicTree] = useState<TopicNode | null>(
    initialTopicTree
  );

  const { t } = useTranslation();

  const createMandalart = useCallback(async () => {
    throw new Error(`${t('mandalart.errors.create.signInRequired')}`);
  }, [t]);

  const deleteMandalart = useCallback(async () => {
    throw new Error('unsupported feature.');
  }, []);

  const saveSnippet = useCallback(
    async (user: User | null, mandalartId: string | null, snippet: Snippet) => {
      if (user) return;
      if (!mandalartId) return;
      updateSnippetMap((snippetMap) => {
        const newSnippetMap = new Map(snippetMap).set(mandalartId, snippet);
        mandalartsStorage.saveSnippets(newSnippetMap);
        return newSnippetMap;
      });
    },
    [updateSnippetMap]
  );

  const saveTopics = useCallback(
    async (
      user: User | null,
      mandalartId: string | null,
      topicTree: TopicNode
    ) => {
      if (user) return;
      if (!mandalartId) return;
      if (mandalartId === currentMandalartId) {
        updateTopicTree(topicTree);
        mandalartsStorage.saveTopics(new Map([[mandalartId, topicTree]]));
      }
    },
    [currentMandalartId, updateTopicTree]
  );

  useEffect(() => {
    if (currentMandalartId && snippetMap.has(currentMandalartId)) return;
    const last = Array.from(snippetMap.keys()).pop();
    selectMandalartId(last ? last : null);
  }, [snippetMap, currentMandalartId]);

  useEffect(() => {
    const savedSnippetMap = mandalartsStorage.readSnippets();
    const snippetMap = savedSnippetMap.has(TMP_MANDALART_ID)
      ? savedSnippetMap
      : TMP_SNIPPET_MAP;
    const savedTopicTree = mandalartsStorage.readTopics().get(TMP_MANDALART_ID);
    const topicTree = savedTopicTree ? savedTopicTree : DEFAULT_TOPIC_TREE;

    updateSnippetMap(snippetMap);
    selectMandalartId(TMP_MANDALART_ID);
    updateTopicTree(topicTree);
  }, [updateSnippetMap, selectMandalartId, updateTopicTree]);

  return {
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
  };
};

export default useGuestMandalarts;
