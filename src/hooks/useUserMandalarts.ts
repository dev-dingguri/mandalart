import { useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import useUserSnippets from 'hooks/useUserSnippets';
import useUserTopicTree from 'hooks/useUserTopicTree';
import {
  MAX_UPLOAD_MANDALARTS_SIZE,
  EMPTY_SNIPPET,
  EMPTY_TOPIC_TREE,
  DB_SNIPPETS,
  DB_TOPIC_TREES,
} from 'constants/constants';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { MandalartsHandlers } from 'components/MainContents/MainContents';
import useDatabase from './useDatabase';
import useGuestSnippets from './useGuestSnippets';
import useGuestTopicTrees from './useGuestTopicTrees';
import useMandalartSelector from './useMandalartSelector';

const useUserMandalarts = (
  user: User
): MandalartsHandlers & { isLoading: boolean } => {
  const {
    snippetMap,
    isLoading: isSnippetMapLoading,
    error: snippetMapError,
  } = useUserSnippets(user);
  const {
    push: pushSnippet,
    set: setSnippet,
    remove: removeSnippet,
  } = useDatabase<Snippet>(`${user.uid}/${DB_SNIPPETS}`);
  const {
    mandalartId: currentMandalartId,
    isSelected,
    selectMandalart: selectMandalartId,
  } = useMandalartSelector(snippetMap);
  const {
    topicTree: currentTopicTree,
    isLoading: isTopicTreeLoading,
    error: topicTreeError,
  } = useUserTopicTree(user, currentMandalartId);
  const { set: setTopics, remove: removeTopics } = useDatabase<TopicNode>(
    `${user.uid}/${DB_TOPIC_TREES}`
  );

  const [guestSnippets, setGuestSnippets] = useGuestSnippets();
  const [guestTopicTrees, setGuestTopicTrees] = useGuestTopicTrees();

  const isLoading =
    isSnippetMapLoading ||
    isTopicTreeLoading ||
    !isSelected ||
    (snippetMap.size > 0 && !currentTopicTree);

  const error = useMemo(
    () => (snippetMapError ? snippetMapError : topicTreeError),
    [snippetMapError, topicTreeError]
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
    [pushSnippet, setTopics, selectMandalartId, snippetMap.size, t]
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

  const saveTopicTree = useCallback(
    async (mandalartId: string | null, topicTree: TopicNode) => {
      if (!mandalartId) return;
      return setTopics(mandalartId, topicTree);
    },
    [setTopics]
  );

  // todo: 임시 만다라트 업로드한 다음에 동기화 시작하거나 만다라트 업로드도 로딩에 포함시키기
  const uploadTemp = useCallback(async () => {
    const firstKey = Array.from(guestSnippets.keys()).shift();
    if (!firstKey) return;
    const guestSnippet = guestSnippets.get(firstKey);
    const guestTopicTree = guestTopicTrees.get(firstKey);
    if (!guestSnippet || !guestTopicTree) return;

    if (!isAnyChanged(guestSnippet, guestTopicTree)) return;

    return createMandalart(guestSnippet, guestTopicTree)
      .then(() => {
        setGuestSnippets(new Map());
        setGuestTopicTrees(new Map());
      })
      .catch((e: Error) => {
        // todo: e가 'The Mandalart could not be created. ~~'에러인 경우에만
        throw new Error(
          `${t('mandalart.errors.uploadTemp.maxUploaded', {
            maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
          })}`
        );
      });
  }, [
    guestSnippets,
    setGuestSnippets,
    guestTopicTrees,
    setGuestTopicTrees,
    createMandalart,
    t,
  ]);

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
    saveTopicTree,
    uploadTemp,
  };
};

const canUpload = (currentSize: number, uploadSize: number) => {
  // todo: snippet에 isLocal만들고 필터링 필요
  return currentSize + uploadSize <= MAX_UPLOAD_MANDALARTS_SIZE;
};

const isAnyChanged = (snippet: Snippet, topicTree: TopicNode) => {
  return (
    !isEqual(snippet, EMPTY_SNIPPET) || //
    !isEqual(topicTree, EMPTY_TOPIC_TREE)
  );
};

export default useUserMandalarts;
