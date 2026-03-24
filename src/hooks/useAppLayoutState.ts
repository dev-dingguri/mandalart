import { useEffect, useCallback, useRef } from 'react';
import { MandalartMeta } from '@/types';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
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
// Object.is 대신 shallow 비교를 사용하여 내용이 같으면 리렌더 방지.
// MandalartMeta에 필드가 추가되어도 별도 수정 없이 자동으로 비교됨.
const metaEquals = (a: MandalartMeta | null, b: MandalartMeta | null) =>
  a === b || (a !== null && b !== null && shallow(a, b));

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
    (s): MandalartMeta | null =>
      s.currentMandalartId
        ? (s.metaMap.get(s.currentMandalartId) ?? null)
        : null,
    metaEquals,
  );

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

  // 에러 처리 — 만다라트 동기화 에러 (onValue 구독이 취소되므로 실시간 업데이트 중단)
  // alert 닫힘 시 새로고침하여 구독 재시작 (복구 불가하므로)
  const hasSyncErrorRef = useRef(false);
  useEffect(() => {
    if (!mandalartsError) return;
    hasSyncErrorRef.current = true;
    openAlert(t('mandalart.errors.sync.default'));
  }, [mandalartsError, openAlert, t]);

  const handleAlertClose = useCallback(() => {
    closeAlert();
    if (hasSyncErrorRef.current) {
      hasSyncErrorRef.current = false;
      window.location.reload();
    }
  }, [closeAlert]);

  // Drawer와 통합된 콜백 — 동작 후 서랍 닫기
  // 모바일에서 서랍과 다이얼로그가 동시에 표시되면 화면이 복잡하므로
  // 다이얼로그를 여는 동작 시 서랍을 명시적으로 닫음
  const handleSelectMandalart = useCallback(
    (mandalartId: string) => {
      mandalartCallbacks.onSelect(mandalartId);
      closeLeftDrawer();
    },
    [mandalartCallbacks.onSelect, closeLeftDrawer],
  );

  const handleDeleteMandalart = useCallback(
    (mandalartId: string) => {
      mandalartCallbacks.onDelete(mandalartId);
      closeLeftDrawer();
    },
    [mandalartCallbacks.onDelete, closeLeftDrawer],
  );

  const handleResetMandalart = useCallback(
    (mandalartId: string) => {
      mandalartCallbacks.onReset(mandalartId);
      closeLeftDrawer();
    },
    [mandalartCallbacks.onReset, closeLeftDrawer],
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
      onDelete: handleDeleteMandalart,
      onReset: handleResetMandalart,
      onCreate: () => {
        mandalartCallbacks.onCreate();
        closeLeftDrawer();
      },
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
      onSignIn: (providerId: string) => {
        closeSignInDialog();
        authCallbacks.onSignIn(providerId);
      },
    },
    alert: {
      isOpen: isOpenAlert,
      content: alertContent,
      close: handleAlertClose,
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
