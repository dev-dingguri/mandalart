import { useEffect, useCallback } from 'react';
import { MandalartMeta } from '@/types/MandalartMeta';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { useModal } from '@/hooks/useModal';
import { useMandalartCallbacks } from '@/hooks/useMandalartCallbacks';
import type { ConfirmDialogOptions } from '@/hooks/useMandalartCallbacks';
import { useAuthCallbacks } from '@/hooks/useAuthCallbacks';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

// Firebase onValue가 매 snapshot마다 새 MandalartMeta 객체를 생성하므로
// Object.is 대신 필드 수준 비교를 사용하여 내용이 같으면 리렌더 방지
const metaEquals = (a: MandalartMeta | null, b: MandalartMeta | null) =>
  a === b || (a !== null && b !== null && a.title === b.title);

export const useAppLayoutState = ({
  user = null,
  error: userError = null,
}: UserHandlers) => {
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

  // 액션만 구독 — Zustand 액션은 참조가 안정적이므로 리렌더를 유발하지 않음
  const signOut = useAuthStore((s) => s.signOut);

  const { t } = useTranslation();

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
  } = useModal<ConfirmDialogOptions>();

  // 서브 훅 조합 — 각 도메인의 콜백을 위임
  const mandalartCallbacks = useMandalartCallbacks({
    openAlert,
    openConfirmDialog,
    t,
  });

  const authCallbacks = useAuthCallbacks({
    user,
    openAlert,
    t,
  });

  // 에러 처리 — 사용자 인증 에러
  useEffect(() => {
    if (!userError) return;
    openAlert(t('auth.errors.signIn.default'));
  }, [userError, openAlert, t]);

  // 에러 처리 — 만다라트 동기화 에러 시 자동 로그아웃
  useEffect(() => {
    if (!mandalartsError) return;
    openAlert(t('mandalart.errors.sync.default'));
    signOut();
  }, [mandalartsError, openAlert, signOut, t]);

  // Drawer와 통합된 콜백 — 선택 후 서랍 닫기
  const handleSelectMandalart = useCallback(
    (mandalartId: string) => {
      mandalartCallbacks.onSelect(mandalartId);
      closeLeftDrawer();
    },
    [mandalartCallbacks.onSelect, closeLeftDrawer]
  );

  const handleConfirmDialogConfirm = useCallback(() => {
    confirmDialogContent?.onConfirm();
    closeConfirmDialog();
  }, [confirmDialogContent, closeConfirmDialog]);

  return {
    user,
    onSignOut: authCallbacks.onSignOut,
    mandalart: {
      hasMandalarts,
      currentId: currentMandalartId,
      currentMeta: currentMandalartMeta,
      currentTopicTree,
      onMetaChange: mandalartCallbacks.onMetaChange,
      onTopicTreeChange: mandalartCallbacks.onTopicTreeChange,
      // onClick 핸들러로 직접 전달되므로 래핑하여 MouseEvent가 afterSuccess에 전달되지 않도록 함
      onCreate: () => mandalartCallbacks.onCreate(),
    },
    leftDrawer: {
      isOpen: isOpenLeftDrawer,
      open: openLeftDrawer,
      close: closeLeftDrawer,
      onSelect: handleSelectMandalart,
      onDelete: mandalartCallbacks.onDelete,
      onRename: mandalartCallbacks.onRename,
      onReset: mandalartCallbacks.onReset,
      onCreate: () => mandalartCallbacks.onCreate(closeLeftDrawer),
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
      onSignIn: authCallbacks.onSignIn,
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
