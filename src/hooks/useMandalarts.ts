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
  const [snippetMap, updateSnippetMap] = useSnippets(initialSnippetMap, user);
  const [currentMandalartId, updateMandalartId] = useState<string | null>(
    initialMandalartId
  );
  const [currentTopicTree, updateTopicTree] = useTopics(
    initialTopicTree,
    user,
    currentMandalartId
  );

  const createMandalart = useCallback(
    (userId: string, snippet: Snippet, topicTree: TopicNode) => {
      return repository
        .createSnippet(userId, snippet)
        .then(({ key: mandalartId }) => {
          if (!mandalartId) {
            throw new Error('snippet creation failed.');
          }
          updateSnippetMap(new Map(snippetMap).set(mandalartId, snippet));
          updateTopicTree(topicTree);
          updateMandalartId(mandalartId);
          return repository.saveTopics(userId, mandalartId, topicTree);
        });
    },
    [updateSnippetMap, updateTopicTree, snippetMap]
  );

  const deleteMandalart = useCallback(
    (userId: string, mandalartId: string) => {
      const _snippetMap = new Map(snippetMap);
      if (_snippetMap.delete(mandalartId)) {
        updateSnippetMap(_snippetMap);
      }
      // todo: 현재 선택된 만다라트 지웠을 때 처리
      return repository.deleteSnippet(userId, mandalartId).then(() => {
        return repository.deleteTopics(userId, mandalartId);
      });
    },
    [snippetMap, updateSnippetMap]
  );

  const saveSnippet = useCallback(
    (userId: string, mandalartId: string, snippet: Snippet) => {
      updateSnippetMap(new Map(snippetMap).set(mandalartId, snippet));
      return repository.saveSnippet(userId, mandalartId, snippet);
    },
    [snippetMap, updateSnippetMap]
  );

  const saveTopics = useCallback(
    (userId: string, mandalartId: string, topicTree: TopicNode) => {
      if (currentMandalartId === mandalartId) {
        updateTopicTree(topicTree);
      }
      return repository.saveTopics(userId, mandalartId, topicTree);
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
    const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
    if (!saved) return;

    const topicTree = parseTopicNode(saved) as TopicNode;

    if (user) {
      if (!isAnyTopicChanged(topicTree)) return;

      localStorage.removeItem(STORAGE_KEY_TOPIC_TREE);
      createMandalart(user.uid, defaultSnippet, topicTree).catch(() => {
        localStorage.setItem(STORAGE_KEY_TOPIC_TREE, saved);
      });
    } else {
      updateTopicTree(topicTree);
    }
  }, [
    user,
    updateTopicTree,
    createMandalart,
    defaultSnippet,
    isAnyTopicChanged,
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
    updateSnippetMap,
    updateMandalartId,
    updateTopicTree,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
  ] as const;
};

export default useMandalarts;
