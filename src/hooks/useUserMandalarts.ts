import { useState, useCallback, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import useSnippets from 'hooks/useUserSnippets';
import useTopics from 'hooks/useUserTopics';
//import repository from 'services/mandalartsRepository';
import {
  MAX_UPLOAD_MANDALARTS_SIZE,
  TMP_MANDALART_ID,
  DEFAULT_SNIPPET,
  DEFAULT_TOPIC_TREE,
  DB_SNIPPETS,
  DB_TOPIC_TREES,
} from 'constants/constants';
import mandalartsStorage from '../services/mandalartsStorage';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { MandalartsHandlers } from 'components/MainContents/MainContents';
import useDatabase from './useDatabase';
import signInSessionStorage from 'services/signInSessionStorage';

const useUserMandalarts = (
  user: User
): MandalartsHandlers & { isLoading: boolean } => {
  const {
    snippetMap,
    isLoading: isSnippetMapLoading,
    error: snippetMapError,
  } = useSnippets(user);
  const {
    push: pushSnippet,
    set: setSnippet,
    remove: removeSnippet,
  } = useDatabase<Snippet>(`${user.uid}/${DB_SNIPPETS}`);

  const [currentMandalartId, selectMandalartId] = useState<string | null>(null);
  const {
    topicTree: currentTopicTree,
    isLoading: isTopicTreeLoading,
    error: topicsError,
  } = useTopics(user, currentMandalartId);
  const { set: setTopics, remove: removeTopics } = useDatabase<TopicNode>(
    `${user.uid}/${DB_TOPIC_TREES}`
  );

  // 스니펫이 로딩된 후, 만다라트 id 선택 및 현재 토픽 트리 로딩전까지 로딩 상태가 false인 상황 방지
  // todo: 개선 필요
  const isLoading =
    isSnippetMapLoading ||
    isTopicTreeLoading ||
    (snippetMap.size > 0 && (!currentMandalartId || !currentTopicTree));

  const error = useMemo(
    () => (snippetMapError ? snippetMapError : topicsError),
    [snippetMapError, topicsError]
  );

  const { t } = useTranslation();

  const createMandalart = useCallback(
    async (snippet: Snippet, topicTree: TopicNode) => {
      if (!canUpload(snippetMap.size, 1)) {
        // todo: 커스텀 에러 검토
        throw new Error(
          `${t('mandalart.errors.create.maxUploaded', {
            maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
          })}`
        );
      }
      return pushSnippet(snippet).then(({ key: mandalartId }) => {
        if (!mandalartId) {
          throw new Error(`${t('mandalart.errors.create.default')}`);
        }
        selectMandalartId(mandalartId);
        return setTopics(mandalartId, topicTree);
      });
    },
    [pushSnippet, setTopics, snippetMap.size, t]
  );

  const deleteMandalart = useCallback(
    async (mandalartId: string | null) => {
      if (!mandalartId) return;
      return removeSnippet(mandalartId).then(() => {
        return removeTopics(mandalartId);
      });
    },
    [removeSnippet, removeTopics]
  );

  const saveSnippet = useCallback(
    async (mandalartId: string | null, snippet: Snippet) => {
      if (!mandalartId) return;
      return setSnippet(mandalartId, snippet);
    },
    [setSnippet]
  );

  const saveTopics = useCallback(
    async (mandalartId: string | null, topicTree: TopicNode) => {
      if (!mandalartId) return;
      return setTopics(mandalartId, topicTree);
    },
    [setTopics]
  );

  const uploadDraft = useCallback(async () => {
    const data = signInSessionStorage.read(user);
    if (!data || data.isTriedUploadDraft) return;
    data.isTriedUploadDraft = true;
    signInSessionStorage.save(user, data);

    const savedSnippet = mandalartsStorage.readSnippets().get(TMP_MANDALART_ID);
    const snippet = savedSnippet ? savedSnippet : DEFAULT_SNIPPET;
    const savedTopicTree = mandalartsStorage.readTopics().get(TMP_MANDALART_ID);
    const topicTree = savedTopicTree ? savedTopicTree : DEFAULT_TOPIC_TREE;

    if (!isAnyChanged(snippet, topicTree)) return;

    return createMandalart(snippet, topicTree)
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
  }, [user, createMandalart, t]);

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
