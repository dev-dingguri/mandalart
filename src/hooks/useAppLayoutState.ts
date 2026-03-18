import { useEffect, useCallback, useRef } from 'react';
import { EMPTY_META, EMPTY_TOPIC_TREE } from '@/constants/constants';
import { MandalartMeta } from '@/types/MandalartMeta';
import { TopicNode } from '@/types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import useModal from '@/hooks/useModal';
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

const useAppLayoutState = ({
  user = null,
  error: userError = null,
}: UserHandlers) => {
  const { signIn, signOut, getShouldUploadTemp, setShouldUploadTemp } =
    useAuthStore();
  const {
    metaMap,
    currentMandalartId,
    currentTopicTree,
    error: mandalartsError,
    selectMandalart: selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveMandalartMeta,
    saveTopicTree,
    uploadTemp,
  } = useMandalartStore();

  // 6-2a: useState에서 useModal로 전환하여 프로젝트 내 모달 상태 패턴 통일
  const {
    isOpen: isOpenLeftDrawer,
    open: openLeftDrawer,
    close: closeLeftDrawer,
  } = useModal();
  const {
    isOpen: isOpenRightDrawer,
    open: openRightDrawer,
    close: closeRightDrawer,
  } = useModal();

  const {
    isOpen: isOpenSignInDialog,
    open: openSignInDialog,
    close: closeSignInDialog,
  } = useModal();
  const {
    isOpen: isOpenAlert,
    open: openAlert,
    close: closeAlert,
    content: alertContent,
  } = useModal<string>();

  const { t } = useTranslation();

  const {
    trackUserType,
    trackSignIn,
    trackSignOut,
    trackMandalartCreate,
    trackMandalartDelete,
    trackMandalartReset,
    trackGuestUpload,
  } = useAnalyticsEvents();

  // user 변경 시 analytics에 사용자 유형 전송
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current === user) return;
    prevUserRef.current = user;
    trackUserType(user ? 'authenticated' : 'guest');
  }, [user, trackUserType]);

  const handleMandalartMetaChange = useCallback(
    (meta: MandalartMeta) => {
      saveMandalartMeta(currentMandalartId, meta);
    },
    [currentMandalartId, saveMandalartMeta]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentMandalartId, topicTree);
    },
    [currentMandalartId, saveTopicTree]
  );

  const currentMandalartMeta = currentMandalartId
    ? metaMap.get(currentMandalartId) ?? null
    : null;

  useEffect(() => {
    if (!userError) return;
    openAlert(t('auth.errors.signIn.default'));
  }, [userError, openAlert, t]);

  useEffect(() => {
    if (!mandalartsError) return;
    openAlert(t('mandalart.errors.sync.default'));
    signOut();
  }, [mandalartsError, openAlert, signOut, t]);

  // 로그인 직후 게스트 데이터를 Firebase로 마이그레이션
  useEffect(() => {
    const shouldUploadTemp = !!user && getShouldUploadTemp();
    if (!shouldUploadTemp) return;
    setShouldUploadTemp(false);
    uploadTemp()
      .then(() => trackGuestUpload())
      .catch((e: Error) => openAlert(e.message));
  }, [user, getShouldUploadTemp, setShouldUploadTemp, uploadTemp, openAlert, trackGuestUpload]);

  const handleSignOut = useCallback(() => {
    trackSignOut();
    signOut();
  }, [trackSignOut, signOut]);

  const handleSignIn = useCallback(
    async (providerId: string) => {
      trackSignIn(providerId);
      try {
        await signIn(providerId);
      } catch (e) {
        // 사용자가 팝업을 직접 닫은 경우는 에러로 표시하지 않음
        if ((e as { code?: string })?.code !== 'auth/popup-closed-by-user') {
          openAlert(t('auth.errors.signIn.default'));
        }
      }
    },
    [trackSignIn, signIn, openAlert, t]
  );

  const handleCreateMandalart = useCallback(() => {
    createMandalart(EMPTY_META, EMPTY_TOPIC_TREE)
      .then(() => trackMandalartCreate())
      .catch((e: Error) => openAlert(e.message));
  }, [createMandalart, trackMandalartCreate, openAlert]);

  const handleCreateMandalartFromDrawer = useCallback(() => {
    createMandalart(EMPTY_META, EMPTY_TOPIC_TREE)
      .then(() => {
        trackMandalartCreate();
        closeLeftDrawer();
      })
      .catch((e: Error) => openAlert(e.message));
  }, [createMandalart, trackMandalartCreate, closeLeftDrawer, openAlert]);

  const handleSelectMandalart = useCallback(
    (mandalartId: string) => {
      selectMandalartId(mandalartId);
      closeLeftDrawer();
    },
    [selectMandalartId, closeLeftDrawer]
  );

  const handleDeleteMandalart = useCallback(
    (mandalartId: string) => {
      deleteMandalart(mandalartId);
      trackMandalartDelete();
    },
    [deleteMandalart, trackMandalartDelete]
  );

  const handleRenameMandalart = useCallback(
    (mandalartId: string, name: string) => {
      saveMandalartMeta(mandalartId, { title: name });
    },
    [saveMandalartMeta]
  );

  const handleResetMandalart = useCallback(
    (mandalartId: string) => {
      saveMandalartMeta(mandalartId, EMPTY_META);
      saveTopicTree(mandalartId, EMPTY_TOPIC_TREE);
      trackMandalartReset();
    },
    [saveMandalartMeta, saveTopicTree, trackMandalartReset]
  );

  return {
    user,
    metaMap,
    currentMandalartId,
    currentMandalartMeta,
    currentTopicTree,
    handleMandalartMetaChange,
    handleTopicTreeChange,
    handleCreateMandalart,
    // Left drawer
    isOpenLeftDrawer,
    openLeftDrawer,
    closeLeftDrawer,
    handleSelectMandalart,
    handleDeleteMandalart,
    handleRenameMandalart,
    handleResetMandalart,
    handleCreateMandalartFromDrawer,
    // Right drawer
    isOpenRightDrawer,
    openRightDrawer,
    closeRightDrawer,
    // Sign-in dialog
    isOpenSignInDialog,
    openSignInDialog,
    closeSignInDialog,
    handleSignIn,
    handleSignOut,
    // Alert dialog
    isOpenAlert,
    alertContent,
    closeAlert,
  };
};

export default useAppLayoutState;
