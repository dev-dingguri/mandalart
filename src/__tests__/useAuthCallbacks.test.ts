import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({
  auth: { onAuthStateChanged: vi.fn() },
  db: {},
  analytics: null,
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ onAuthStateChanged: vi.fn() })),
  GoogleAuthProvider: { PROVIDER_ID: 'google.com' },
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  onValue: vi.fn(),
}));

vi.mock('@/lib/analyticsEvents', () => ({
  trackSignIn: vi.fn(),
  trackSignOut: vi.fn(),
  trackUserType: vi.fn(),
  trackGuestUpload: vi.fn(),
}));

import { useAuthCallbacks } from '@/hooks/useAuthCallbacks';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import {
  trackSignIn,
  trackSignOut,
  trackUserType,
  trackGuestUpload,
} from '@/lib/analyticsEvents';
import type { TFunction } from 'i18next';
import type { User } from 'firebase/auth';

const mockUser = { uid: 'test-uid' } as User;
const openAlert = vi.fn();
const t = vi.fn((key: string) => key) as unknown as TFunction;

const mockSignIn = vi.fn().mockResolvedValue(undefined);
const mockSignOut = vi.fn();
const mockGetShouldUploadTemp = vi.fn().mockReturnValue(false);
const mockSetShouldUploadTemp = vi.fn();
const mockUploadTemp = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    signIn: mockSignIn,
    signOut: mockSignOut,
    getShouldUploadTemp: mockGetShouldUploadTemp,
    setShouldUploadTemp: mockSetShouldUploadTemp,
    user: null,
    isLoading: false,
    error: null,
  });
  useMandalartStore.setState({
    uploadTemp: mockUploadTemp,
    metaMap: new Map(),
    currentMandalartId: null,
    currentTopicTree: null,
    _user: null,
    _guestTopicTrees: new Map(),
    isLoading: false,
    error: null,
  });
});

describe('useAuthCallbacks', () => {
  describe('onSignIn', () => {
    it('trackSignIn을 호출한다', async () => {
      const { result } = renderHook(() =>
        useAuthCallbacks({ user: null, openAlert, t }),
      );

      await act(async () => {
        await result.current.onSignIn('google.com');
      });

      expect(trackSignIn).toHaveBeenCalledWith('google.com');
    });

    it('signIn을 호출한다', async () => {
      const { result } = renderHook(() =>
        useAuthCallbacks({ user: null, openAlert, t }),
      );

      await act(async () => {
        await result.current.onSignIn('google.com');
      });

      expect(mockSignIn).toHaveBeenCalledWith('google.com');
    });

    it('signIn 실패 시 openAlert를 호출한다', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('fail'));
      const { result } = renderHook(() =>
        useAuthCallbacks({ user: null, openAlert, t }),
      );

      await act(async () => {
        await result.current.onSignIn('google.com');
      });

      expect(openAlert).toHaveBeenCalledWith('auth.errors.signIn.default');
      expect(t).toHaveBeenCalledWith('auth.errors.signIn.default');
    });

    it('popup-closed-by-user 에러는 무시한다', async () => {
      mockSignIn.mockRejectedValueOnce({
        code: 'auth/popup-closed-by-user',
      });
      const { result } = renderHook(() =>
        useAuthCallbacks({ user: null, openAlert, t }),
      );

      await act(async () => {
        await result.current.onSignIn('google.com');
      });

      expect(openAlert).not.toHaveBeenCalled();
    });
  });

  describe('onSignOut', () => {
    it('trackSignOut과 signOut을 호출한다', () => {
      const { result } = renderHook(() =>
        useAuthCallbacks({ user: null, openAlert, t }),
      );

      act(() => {
        result.current.onSignOut();
      });

      expect(trackSignOut).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('userType 추적', () => {
    it('초기 마운트에서는 trackUserType을 호출하지 않는다', () => {
      renderHook(() => useAuthCallbacks({ user: null, openAlert, t }));

      expect(trackUserType).not.toHaveBeenCalled();
    });

    it('user 변경 시 trackUserType을 호출한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useAuthCallbacks({ user, openAlert, t }),
        { initialProps: { user: null as User | null } },
      );

      expect(trackUserType).not.toHaveBeenCalled();

      rerender({ user: mockUser });

      expect(trackUserType).toHaveBeenCalledWith('authenticated');
    });

    it('user가 null로 변경 시 guest로 추적한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useAuthCallbacks({ user, openAlert, t }),
        { initialProps: { user: mockUser as User | null } },
      );

      // 초기 마운트는 스킵
      expect(trackUserType).not.toHaveBeenCalled();

      rerender({ user: null });

      expect(trackUserType).toHaveBeenCalledWith('guest');
    });
  });

  describe('uploadTemp 마이그레이션', () => {
    it('user가 있고 shouldUploadTemp이면 uploadTemp를 호출한다', async () => {
      mockGetShouldUploadTemp.mockReturnValue(true);

      await act(async () => {
        renderHook(() =>
          useAuthCallbacks({ user: mockUser, openAlert, t }),
        );
      });

      expect(mockSetShouldUploadTemp).toHaveBeenCalledWith(false);
      expect(mockUploadTemp).toHaveBeenCalled();
    });

    it('성공 시 trackGuestUpload를 호출한다', async () => {
      mockGetShouldUploadTemp.mockReturnValue(true);
      mockUploadTemp.mockResolvedValueOnce(undefined);

      await act(async () => {
        renderHook(() =>
          useAuthCallbacks({ user: mockUser, openAlert, t }),
        );
      });

      expect(trackGuestUpload).toHaveBeenCalled();
    });

    it('실패 시 setShouldUploadTemp(true)를 복원하고 openAlert를 호출한다', async () => {
      mockGetShouldUploadTemp.mockReturnValue(true);
      mockUploadTemp.mockRejectedValueOnce(new Error('upload failed'));

      await act(async () => {
        renderHook(() =>
          useAuthCallbacks({ user: mockUser, openAlert, t }),
        );
      });

      // 실패 시 재시도를 위해 shouldUploadTemp를 true로 복원
      expect(mockSetShouldUploadTemp).toHaveBeenCalledWith(false);
      expect(mockSetShouldUploadTemp).toHaveBeenCalledWith(true);
      expect(openAlert).toHaveBeenCalledWith('upload failed');
    });

    it('user가 없으면 uploadTemp를 호출하지 않는다', async () => {
      mockGetShouldUploadTemp.mockReturnValue(true);

      await act(async () => {
        renderHook(() =>
          useAuthCallbacks({ user: null, openAlert, t }),
        );
      });

      expect(mockUploadTemp).not.toHaveBeenCalled();
    });

    it('shouldUploadTemp가 false이면 uploadTemp를 호출하지 않는다', async () => {
      mockGetShouldUploadTemp.mockReturnValue(false);

      await act(async () => {
        renderHook(() =>
          useAuthCallbacks({ user: mockUser, openAlert, t }),
        );
      });

      expect(mockUploadTemp).not.toHaveBeenCalled();
    });
  });
});
