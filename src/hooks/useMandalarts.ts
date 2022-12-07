import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Snippet } from 'types/Snippet';
import { TopicNode, parseTopicNode } from 'types/TopicNode';
import useSnippets from 'hooks/useSnippets';
import useTopics from 'hooks/useTopics';
import repository from 'services/mandalartsRepository';
import { STORAGE_KEY_TOPIC_TREE } from 'constants/constants';
import { isEqual } from 'lodash';

const useMandalarts = (
  user: User | null,
  initialSnippetMap: Map<string, Snippet>,
  initialMandalartId: string | null,
  initialTopicTree: TopicNode,
  defaultSnippet: Snippet,
  defaultTopicTree: TopicNode
) => {
  const [snippetMap, updateSnippetMap, isSnippetMapLoading] = useSnippets(
    initialSnippetMap,
    user
  );
  const [currentMandalartId, updateMandalartId] = useState<string | null>(
    initialMandalartId
  );
  const [currentTopicTree, updateTopicTree] = useTopics(
    initialTopicTree,
    user,
    currentMandalartId
  );

  const createMandalart = useCallback(
    async (user: User | null, snippet: Snippet, topicTree: TopicNode) => {
      if (!user) {
        throw new Error('cannot create because user is null.');
      }
      return repository
        .createSnippet(user.uid, snippet)
        .then(({ key: mandalartId }) => {
          if (!mandalartId) {
            throw new Error('snippet creation failed.');
          }
          updateSnippetMap(new Map(snippetMap).set(mandalartId, snippet));
          updateTopicTree(topicTree);
          updateMandalartId(mandalartId);
          return repository.saveTopics(user.uid, mandalartId, topicTree);
        });
    },
    [updateSnippetMap, updateTopicTree, snippetMap]
  );

  const deleteMandalart = useCallback(
    async (user: User | null, mandalartId: string | null) => {
      if (!mandalartId) return;
      const _snippetMap = new Map(snippetMap);
      if (_snippetMap.delete(mandalartId)) {
        updateSnippetMap(_snippetMap);
      }
      // todo: 현재 선택된 만다라트 지웠을 때 처리
      if (!user) return;
      return repository.deleteSnippet(user.uid, mandalartId).then(() => {
        return repository.deleteTopics(user.uid, mandalartId);
      });
    },
    [snippetMap, updateSnippetMap]
  );

  const saveSnippet = useCallback(
    async (user: User | null, mandalartId: string | null, snippet: Snippet) => {
      if (!mandalartId) return;
      updateSnippetMap(new Map(snippetMap).set(mandalartId, snippet));

      if (!user) return;
      return repository.saveSnippet(user.uid, mandalartId, snippet);
    },
    [snippetMap, updateSnippetMap]
  );

  const saveTopics = useCallback(
    async (
      user: User | null,
      mandalartId: string | null,
      topicTree: TopicNode
    ) => {
      if (currentMandalartId === mandalartId) {
        updateTopicTree(topicTree);
      }
      if (!user || !mandalartId) return;
      return repository.saveTopics(user.uid, mandalartId, topicTree);
    },
    [currentMandalartId, updateTopicTree]
  );

  // todo: 비로그인 상태일 때 제목을 작성할 수 있게 되면 snippet도 검사
  const isAnyTopicChanged = useCallback(
    (topicTree: TopicNode) => {
      return !isEqual(topicTree, defaultTopicTree);
    },
    [defaultTopicTree]
  );

  useEffect(() => {
    if (!user) return;

    if (!currentMandalartId || !snippetMap.has(currentMandalartId)) {
      const lastId = Array.from(snippetMap.keys()).pop();
      console.log(lastId);
      updateMandalartId(lastId ? lastId : null);
    }
  }, [user, snippetMap, currentMandalartId]);

  useEffect(() => {
    if (!user || isSnippetMapLoading) return;

    const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
    if (!saved) return;
    const topicTree = parseTopicNode(saved);
    if (!isAnyTopicChanged(topicTree)) return;

    localStorage.removeItem(STORAGE_KEY_TOPIC_TREE);
    createMandalart(user, defaultSnippet, topicTree).catch(() => {
      localStorage.setItem(STORAGE_KEY_TOPIC_TREE, saved);
    });
  }, [
    user,
    isSnippetMapLoading,
    createMandalart,
    defaultSnippet,
    isAnyTopicChanged,
  ]);

  useEffect(() => {
    if (user) return;

    const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
    const topicTree = saved ? parseTopicNode(saved) : defaultTopicTree;

    updateSnippetMap(new Map<string, Snippet>());
    updateMandalartId(null);
    updateTopicTree(topicTree);
  }, [
    user,
    defaultTopicTree,
    updateSnippetMap,
    updateMandalartId,
    updateTopicTree,
  ]);

  useEffect(() => {
    if (user) return;
    localStorage.setItem(
      STORAGE_KEY_TOPIC_TREE,
      JSON.stringify(currentTopicTree)
    );
  }, [user, currentTopicTree]);

  return [
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    updateMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
  ] as const;
};

export default useMandalarts;
