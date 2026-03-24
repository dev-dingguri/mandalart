import { useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import {
  trackSignIn,
  trackSignOut,
  trackUserType,
  trackGuestUpload,
} from '@/lib/analyticsEvents';
import type { TFunction } from 'i18next';

type AuthCallbackDeps = {
  user: User | null;
  openAlert: (msg: string) => void;
  t: TFunction;
};

export const useAuthCallbacks = ({ user, openAlert, t }: AuthCallbackDeps) => {
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const getShouldUploadTemp = useAuthStore((s) => s.getShouldUploadTemp);
  const setShouldUploadTemp = useAuthStore((s) => s.setShouldUploadTemp);
  const uploadTemp = useMandalartStore((s) => s.uploadTemp);

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

  // 로그인 직후 게스트 데이터를 Firebase로 마이그레이션
  useEffect(() => {
    const shouldUploadTemp = !!user && getShouldUploadTemp();
    if (!shouldUploadTemp) return;
    // effect 재실행 방지를 위해 먼저 false로 설정하되, 실패 시 복원하여 재시도 가능하게 함
    setShouldUploadTemp(false);
    uploadTemp()
      .then(() => trackGuestUpload())
      .catch((e: Error) => {
        setShouldUploadTemp(true);
        openAlert(e.message);
      });
    // trackGuestUpload은 모듈 수준 함수라 의존성 배열에서 생략
  }, [user, getShouldUploadTemp, setShouldUploadTemp, uploadTemp, openAlert]);

  const handleSignIn = useCallback(
    async (providerId: string) => {
      // trackSignIn은 모듈 수준 함수라 의존성 배열에서 생략
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
    [signIn, openAlert, t],
  );

  const handleSignOut = useCallback(() => {
    // trackSignOut은 모듈 수준 함수라 의존성 배열에서 생략
    trackSignOut();
    signOut();
  }, [signOut]);

  return {
    onSignIn: handleSignIn,
    onSignOut: handleSignOut,
  };
};
