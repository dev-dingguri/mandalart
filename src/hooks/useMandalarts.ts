import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import useSnippets from 'hooks/useSnippets';
import useTopics from 'hooks/useTopics';
import repository from 'services/mandalartsRepository';
import {
  TMP_MANDALART_ID,
  DEFAULT_SNIPPET,
  DEFAULT_TOPIC_TREE,
} from 'constants/constants';
import mandalartsStorage from '../services/mandalartsStorage';
import useStorageUpload from './useStorageUpload';

const TMP_SNIPPET_MAP = new Map<string, Snippet>([
  [TMP_MANDALART_ID, DEFAULT_SNIPPET],
]);

const useMandalarts = (
  user: User | null,
  initialSnippetMap: Map<string, Snippet>,
  initialMandalartId: string | null,
  initialTopicTree: TopicNode | null
) => {
  const [snippetMap, updateSnippetMap, isSnippetMapLoading] = useSnippets(
    initialSnippetMap,
    user
  );
  const [currentMandalartId, updateMandalartId] = useState<string | null>(
    initialMandalartId
  );
  const [currentTopicTree, updateTopicTree, isTopicTreeLoading] = useTopics(
    initialTopicTree,
    user,
    currentMandalartId
  );

  const createMandalart = useCallback(
    async (user: User | null, snippet: Snippet, topicTree: TopicNode) => {
      if (!user) {
        throw new Error('Sign in is required to add a new Mandalart.');
      }
      return repository
        .createSnippet(user.uid, snippet)
        .then(({ key: mandalartId }) => {
          if (!mandalartId) {
            throw new Error('snippet creation failed.');
          }
          updateSnippetMap((snippetMap) =>
            new Map(snippetMap).set(mandalartId, snippet)
          );
          updateTopicTree(topicTree);
          updateMandalartId(mandalartId);
          return repository.saveTopics(user.uid, mandalartId, topicTree);
        });
    },
    [updateSnippetMap, updateTopicTree]
  );

  const deleteMandalart = useCallback(
    async (user: User | null, mandalartId: string | null) => {
      if (!mandalartId) return;
      updateSnippetMap((snippetMap) => {
        const deleted = new Map(snippetMap);
        return deleted.delete(mandalartId) ? deleted : snippetMap;
      });
      if (user) {
        return repository.deleteSnippet(user.uid, mandalartId).then(() => {
          return repository.deleteTopics(user.uid, mandalartId);
        });
      } else {
        mandalartsStorage.deleteSnippets();
        mandalartsStorage.deleteTopics();
      }
    },
    [updateSnippetMap]
  );

  const saveSnippet = useCallback(
    async (user: User | null, mandalartId: string | null, snippet: Snippet) => {
      if (!mandalartId) return;
      if (snippet.title === '') {
        snippet = DEFAULT_SNIPPET;
      }
      updateSnippetMap((snippetMap) =>
        new Map(snippetMap).set(mandalartId, snippet)
      );
      if (user) {
        return repository.saveSnippet(user.uid, mandalartId, snippet);
      } else {
        mandalartsStorage.saveSnippets(new Map([[TMP_MANDALART_ID, snippet]]));
      }
    },
    [updateSnippetMap]
  );

  const saveTopics = useCallback(
    (user: User | null, mandalartId: string | null, topicTree: TopicNode) => {
      if (mandalartId === currentMandalartId) {
        updateTopicTree(topicTree);
      }
      if (user && mandalartId) {
        return repository.saveTopics(user.uid, mandalartId, topicTree);
      } else {
        mandalartsStorage.saveTopics(new Map([[TMP_MANDALART_ID, topicTree]]));
      }
    },
    [currentMandalartId, updateTopicTree]
  );

  const [isUploading] = useStorageUpload(user, createMandalart);

  const isLoading = isSnippetMapLoading || isTopicTreeLoading || isUploading;

  useEffect(() => {
    if (user) return;

    const savedSnippetMap = mandalartsStorage.readSnippets();
    const snippetMap = savedSnippetMap.has(TMP_MANDALART_ID)
      ? savedSnippetMap
      : TMP_SNIPPET_MAP;
    const savedTopicTree = mandalartsStorage.readTopics().get(TMP_MANDALART_ID);
    const topicTree = savedTopicTree ? savedTopicTree : DEFAULT_TOPIC_TREE;

    updateSnippetMap(snippetMap);
    updateMandalartId(TMP_MANDALART_ID);
    updateTopicTree(topicTree);
  }, [user, updateSnippetMap, updateMandalartId, updateTopicTree]);

  useEffect(() => {
    if (currentMandalartId && snippetMap.has(currentMandalartId)) return;
    const last = Array.from(snippetMap.keys()).pop();
    updateMandalartId(last ? last : null);
  }, [snippetMap, currentMandalartId]);

  return [
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    isLoading,
    updateMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
  ] as const;
};

export default useMandalarts;
