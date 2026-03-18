import { useEffect, useCallback, useRef } from 'react';
import { createEmptyMeta, createEmptyTopicTree } from '@/constants';
import { MandalartMeta } from '@/types/MandalartMeta';
import { TopicNode } from '@/types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import useModal from '@/hooks/useModal';
import { useLatestRef } from '@/hooks/useLatestRef';
import {
  trackUserType,
  trackSignIn,
  trackSignOut,
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
  trackGuestUpload,
} from '@/lib/analyticsEvents';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

// Firebase onValue가 매 snapshot마다 새 MandalartMeta 객체를 생성하므로
// Object.is 대신 필드 수준 비교를 사용하여 내용이 같으면 리렌더 방지
const metaEquals = (a: MandalartMeta | null, b: MandalartMeta | null) =>
  a === b || (a !== null && b !== null && a.title === b.title);

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
  // Zustand 5는 create 훅에서 equality fn을 직접 지원하지 않으므로
  // zustand/traditional의 useStoreWithEqualityFn을 사용
  const currentMandalartMeta = useStoreWithEqualityFn(
    useMandalartStore,
    (s): MandalartMeta | null => s.currentMandalartId ? s.metaMap.get(s.currentMandalartId) ?? null : null,
    metaEquals
  );

  // 콜백 전용 — ref로 참조하여 콜백 재생성 방지 (rerender-defer-reads)
  const currentIdRef = useLatestRef(currentMandalartId);

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

  // 초기 마운트 시 스킵 — AuthenticatedView/GuestView가 이미 올바른 user로 마운트되므로
  // 실제 전환(로그인/로그아웃) 시에만 추적
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackUserType(user ? 'authenticated' : 'guest');
  }, [user]);

  const handleMandalartMetaChange = useCallback(
    (meta: MandalartMeta) => {
      saveMandalartMeta(currentIdRef.current, meta);
    },
    [saveMandalartMeta, currentIdRef]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentIdRef.current, topicTree);
    },
    [saveTopicTree, currentIdRef]
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
  // trackGuestUpload은 모듈 수준 함수라 의존성 배열에서 생략
  }, [user, getShouldUploadTemp, setShouldUploadTemp, uploadTemp, openAlert]);

  const handleSignOut = useCallback(() => {
    trackSignOut();
    signOut();
  // trackSignOut은 모듈 수준 함수라 의존성 배열에서 생략
  }, [signOut]);

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
    // trackSignIn은 모듈 수준 함수라 의존성 배열에서 생략
    [signIn, openAlert, t]
  );

  const handleCreateMandalart = useCallback(
    (afterSuccess?: () => void) => {
      createMandalart(createEmptyMeta(), createEmptyTopicTree())
        .then(() => {
          trackMandalartCreate();
          afterSuccess?.();
        })
        .catch((e: Error) => openAlert(e.message));
    },
    // trackMandalartCreate은 모듈 수준 함수라 의존성 배열에서 생략
    [createMandalart, openAlert]
  );

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
    // trackMandalartDelete은 모듈 수준 함수라 의존성 배열에서 생략
    [openConfirmDialog, t, deleteMandalart]
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
    // trackMandalartReset은 모듈 수준 함수라 의존성 배열에서 생략
    [openConfirmDialog, t, saveMandalartMeta, saveTopicTree]
  );

  const handleConfirmDialogConfirm = useCallback(() => {
    confirmDialogContent?.onConfirm();
    closeConfirmDialog();
  }, [confirmDialogContent, closeConfirmDialog]);

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
      // onClick 핸들러로 직접 전달되므로 래핑하여 MouseEvent가 afterSuccess에 전달되지 않도록 함
      onCreate: () => handleCreateMandalart(),
    },
    leftDrawer: {
      isOpen: isOpenLeftDrawer,
      open: openLeftDrawer,
      close: closeLeftDrawer,
      onSelect: handleSelectMandalart,
      onDelete: handleDeleteMandalart,
      onRename: handleRenameMandalart,
      onReset: handleResetMandalart,
      onCreate: () => handleCreateMandalart(closeLeftDrawer),
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
      onConfirm: handleConfirmDialogConfirm,
      close: closeConfirmDialog,
    },
  };
};

export default useAppLayoutState;
