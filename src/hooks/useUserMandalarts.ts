import { useEffect, useState, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import useUserSnippets from 'hooks/useUserSnippets';
import useUserTopics from 'hooks/useUserTopics';
import repository from 'services/mandalartsRepository';
import {
  MAX_UPLOAD_MANDALARTS_SIZE,
  TMP_MANDALART_ID,
  DEFAULT_SNIPPET,
  DEFAULT_TOPIC_TREE,
} from 'constants/constants';
import mandalartsStorage from '../services/mandalartsStorage';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { MandalartsHandlers } from 'components/MainCommon/MainCommon';

const useUserMandalarts = (
  user: User,
  initialMandalartId: string | null
): MandalartsHandlers & { isLoading: boolean } => {
  const {
    snippetMap,
    isLoading: isSnippetMapLoading,
    error: snippetMapError,
  } = useUserSnippets(user);
  const [currentMandalartId, selectMandalartId] = useState<string | null>(
    initialMandalartId
  );
  const {
    topicTree: currentTopicTree,
    isLoading: isTopicTreeLoading,
    error: topicsError,
  } = useUserTopics(user, currentMandalartId);
  const isLoading = isSnippetMapLoading || isTopicTreeLoading;
  const error = useMemo(
    () => (snippetMapError ? snippetMapError : topicsError),
    [snippetMapError, topicsError]
  );

  const { t } = useTranslation();

  const createMandalart = useCallback(
    async (user: User | null, snippet: Snippet, topicTree: TopicNode) => {
      if (!user) return;
      if (snippetMap && !canUpload(snippetMap.size, 1)) {
        // todo: 커스텀 에러 검토
        throw new Error(
          `${t('mandalart.errors.create.maxUploaded', {
            maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
          })}`
        );
      }
      return repository
        .createSnippet(user.uid, snippet)
        .then(({ key: mandalartId }) => {
          if (!mandalartId) {
            throw new Error(`${t('mandalart.errors.create.default')}`);
          }
          selectMandalartId(mandalartId);
          return repository.saveTopics(user.uid, mandalartId, topicTree);
        });
    },
    [snippetMap, t]
  );

  const deleteMandalart = useCallback(
    async (user: User | null, mandalartId: string | null) => {
      if (!user) return;
      if (!mandalartId) return;
      return repository.deleteSnippet(user.uid, mandalartId).then(() => {
        return repository.deleteTopics(user.uid, mandalartId);
      });
    },
    []
  );

  const saveSnippet = useCallback(
    async (user: User | null, mandalartId: string | null, snippet: Snippet) => {
      if (!user) return;
      if (!mandalartId) return;
      return repository.saveSnippet(user.uid, mandalartId, snippet);
    },
    []
  );

  const saveTopics = useCallback(
    async (
      user: User | null,
      mandalartId: string | null,
      topicTree: TopicNode
    ) => {
      if (!user) return;
      if (!mandalartId) return;
      return repository.saveTopics(user.uid, mandalartId, topicTree);
    },
    []
  );

  const uploadDraft = useCallback(
    async (user: User | null) => {
      const savedSnippet = mandalartsStorage
        .readSnippets()
        .get(TMP_MANDALART_ID);
      const snippet = savedSnippet ? savedSnippet : DEFAULT_SNIPPET;
      const savedTopicTree = mandalartsStorage
        .readTopics()
        .get(TMP_MANDALART_ID);
      const topicTree = savedTopicTree ? savedTopicTree : DEFAULT_TOPIC_TREE;

      if (!isAnyChanged(snippet, topicTree)) return;

      return createMandalart(user, snippet, topicTree)
        .then(() => {
          mandalartsStorage.deleteSnippets();
          mandalartsStorage.deleteTopics();
        })
        .catch((e: Error) => {
          // todo: e가 'The Mandalart could not be created. ~~'에러인 경우에만
          throw new Error(
            `${t('mandalart.errors.uploadDraft.maxUploaded', {
              maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
            })}`
          );
        });
    },
    [createMandalart, t]
  );

  useEffect(() => {
    if (!snippetMap) return;
    if (currentMandalartId && snippetMap.has(currentMandalartId)) return;
    const last = Array.from(snippetMap.keys()).pop();
    selectMandalartId(last ? last : null);
  }, [snippetMap, currentMandalartId]);

  return {
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    isLoading,
    error,
    selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
    uploadDraft,
  };
};

const canUpload = (currentSize: number, uploadSize: number) => {
  // todo: snippet에 isLocal만들고 필터링 필요
  return currentSize + uploadSize <= MAX_UPLOAD_MANDALARTS_SIZE;
};

const isAnyChanged = (snippet: Snippet, topicTree: TopicNode) => {
  return (
    !isEqual(snippet, DEFAULT_SNIPPET) || //
    !isEqual(topicTree, DEFAULT_TOPIC_TREE)
  );
};

export default useUserMandalarts;
