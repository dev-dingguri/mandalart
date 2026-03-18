import { useEffect, useCallback, useRef } from 'react';
import { createEmptyMeta, createEmptyTopicTree } from '@/constants';
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
  // 액션만 구독 — Zustand 액션은 참조가 안정적이므로 리렌더를 유발하지 않음
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const getShouldUploadTemp = useAuthStore((s) => s.getShouldUploadTemp);
  const setShouldUploadTemp = useAuthStore((s) => s.setShouldUploadTemp);

  // 상태 — 개별 selector로 필요한 값만 구독하여 무관한 store 변경에 리렌더 방지
  const hasMandalarts = useMandalartStore((s) => s.metaMap.size > 0);
  const currentMandalartId = useMandalartStore((s) => s.currentMandalartId);
  const currentTopicTree = useMandalartStore((s) => s.currentTopicTree);
  const mandalartsError = useMandalartStore((s) => s.error);
  // metaMap 전체가 바뀌어도, 현재 ID의 메타가 동일하면 Object.is로 리렌더 스킵
  const currentMandalartMeta = useMandalartStore(
    (s) => s.currentMandalartId ? s.metaMap.get(s.currentMandalartId) ?? null : null
  );

  // 액션
  const selectMandalartId = useMandalartStore((s) => s.selectMandalart);
  const createMandalart = useMandalartStore((s) => s.createMandalart);
  const deleteMandalart = useMandalartStore((s) => s.deleteMandalart);
  const saveMandalartMeta = useMandalartStore((s) => s.saveMandalartMeta);
  const saveTopicTree = useMandalartStore((s) => s.saveTopicTree);
  const uploadTemp = useMandalartStore((s) => s.uploadTemp);

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
  const {
    isOpen: isOpenConfirmDialog,
    open: openConfirmDialog,
    close: closeConfirmDialog,
    content: confirmDialogContent,
  } = useModal<{ message: string; confirmText: string; onConfirm: () => void }>();

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
    createMandalart(createEmptyMeta(), createEmptyTopicTree())
      .then(() => trackMandalartCreate())
      .catch((e: Error) => openAlert(e.message));
  }, [createMandalart, trackMandalartCreate, openAlert]);

  const handleCreateMandalartFromDrawer = useCallback(() => {
    createMandalart(createEmptyMeta(), createEmptyTopicTree())
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
      openConfirmDialog({
        message: t('mandalart.confirmDelete'),
        confirmText: t('mandalart.delete'),
        onConfirm: () => {
          deleteMandalart(mandalartId);
          trackMandalartDelete();
        },
      });
    },
    [openConfirmDialog, t, deleteMandalart, trackMandalartDelete]
  );

  const handleRenameMandalart = useCallback(
    (mandalartId: string, name: string) => {
      saveMandalartMeta(mandalartId, { title: name });
    },
    [saveMandalartMeta]
  );

  const handleResetMandalart = useCallback(
    (mandalartId: string) => {
      openConfirmDialog({
        message: t('mandalart.confirmReset'),
        confirmText: t('mandalart.reset'),
        onConfirm: () => {
          saveMandalartMeta(mandalartId, createEmptyMeta());
          saveTopicTree(mandalartId, createEmptyTopicTree());
          trackMandalartReset();
        },
      });
    },
    [openConfirmDialog, t, saveMandalartMeta, saveTopicTree, trackMandalartReset]
  );

  return {
    user,
    onSignOut: handleSignOut,
    mandalart: {
      hasMandalarts,
      currentId: currentMandalartId,
      currentMeta: currentMandalartMeta,
      currentTopicTree,
      onMetaChange: handleMandalartMetaChange,
      onTopicTreeChange: handleTopicTreeChange,
      onCreate: handleCreateMandalart,
    },
    leftDrawer: {
      isOpen: isOpenLeftDrawer,
      open: openLeftDrawer,
      close: closeLeftDrawer,
      onSelect: handleSelectMandalart,
      onDelete: handleDeleteMandalart,
      onRename: handleRenameMandalart,
      onReset: handleResetMandalart,
      onCreate: handleCreateMandalartFromDrawer,
    },
    rightDrawer: {
      isOpen: isOpenRightDrawer,
      open: openRightDrawer,
      close: closeRightDrawer,
    },
    signInDialog: {
      isOpen: isOpenSignInDialog,
      open: openSignInDialog,
      close: closeSignInDialog,
      onSignIn: handleSignIn,
    },
    alert: {
      isOpen: isOpenAlert,
      content: alertContent,
      close: closeAlert,
    },
    confirmDialog: {
      isOpen: isOpenConfirmDialog,
      message: confirmDialogContent?.message ?? null,
      confirmText: confirmDialogContent?.confirmText ?? null,
      onConfirm: () => {
        confirmDialogContent?.onConfirm();
        closeConfirmDialog();
      },
      close: closeConfirmDialog,
    },
  };
};

export default useAppLayoutState;
