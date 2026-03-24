import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// -- module mocks --

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
  trackMandalartCreate: vi.fn(),
  trackMandalartDelete: vi.fn(),
  trackMandalartReset: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

// useTranslation이 매 렌더마다 같은 t 참조를 반환해야
// useEffect 의존성 배열에서 불필요한 재실행을 방지할 수 있음
const stableT = (key: string) => key;
const stableI18n = { language: 'ko', changeLanguage: vi.fn() };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT, i18n: stableI18n }),
}));

import { useAppLayoutState } from '@/hooks/useAppLayoutState';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoadingStore } from '@/stores/useLoadingStore';

// -- setup --

const mockSelectMandalart = vi.fn();
const mockCreateMandalart = vi.fn().mockResolvedValue(undefined);
const mockDeleteMandalart = vi.fn().mockResolvedValue(true);
const mockSaveMandalartMeta = vi.fn().mockResolvedValue(undefined);
const mockSaveTopicTree = vi.fn().mockResolvedValue(undefined);
const mockResetMandalart = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();

  useMandalartStore.setState({
    metaMap: new Map([['id1', { title: '목표' }]]),
    currentMandalartId: 'id1',
    currentTopicTree: null,
    isLoading: false,
    error: null,
    _user: null,
    _guestTopicTrees: new Map(),
    selectMandalart: mockSelectMandalart,
    createMandalart: mockCreateMandalart,
    deleteMandalart: mockDeleteMandalart,
    saveMandalartMeta: mockSaveMandalartMeta,
    saveTopicTree: mockSaveTopicTree,
    resetMandalart: mockResetMandalart,
  });

  useAuthStore.setState({
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn(),
    getShouldUploadTemp: vi.fn().mockReturnValue(false),
    setShouldUploadTemp: vi.fn(),
    user: null,
    isLoading: false,
    error: null,
  });

  useLoadingStore.setState({ conditions: new Map() });

  Object.defineProperty(window, 'location', {
    value: { reload: vi.fn() },
    writable: true,
    configurable: true,
  });
});

// -- tests --

describe('useAppLayoutState', () => {
  // -- 반환 구조 --

  describe('반환 구조', () => {
    it('올바른 구조를 반환한다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('onSignOut');
      expect(result.current).toHaveProperty('mandalart');
      expect(result.current).toHaveProperty('leftDrawer');
      expect(result.current).toHaveProperty('rightDrawer');
      expect(result.current).toHaveProperty('signInDialog');
      expect(result.current).toHaveProperty('alert');
      expect(result.current).toHaveProperty('confirmDialog');
    });

    it('mandalart 그룹에 스토어 값이 반영된다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      expect(result.current.mandalart.hasMandalarts).toBe(true);
      expect(result.current.mandalart.currentId).toBe('id1');
      expect(result.current.mandalart.currentMeta).toEqual({ title: '목표' });
    });
  });

  // -- leftDrawer 통합 --

  describe('leftDrawer 통합', () => {
    it('leftDrawer open/close 동작한다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      expect(result.current.leftDrawer.isOpen).toBe(false);

      act(() => {
        result.current.leftDrawer.open();
      });
      expect(result.current.leftDrawer.isOpen).toBe(true);

      act(() => {
        result.current.leftDrawer.close();
      });
      expect(result.current.leftDrawer.isOpen).toBe(false);
    });

    it('leftDrawer.onSelect 시 선택 후 서랍이 닫힌다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        result.current.leftDrawer.open();
      });
      expect(result.current.leftDrawer.isOpen).toBe(true);

      act(() => {
        result.current.leftDrawer.onSelect('id1');
      });

      expect(mockSelectMandalart).toHaveBeenCalledWith('id1');
      expect(result.current.leftDrawer.isOpen).toBe(false);
    });

    it('leftDrawer.onDelete 시 서랍이 닫힌다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        result.current.leftDrawer.open();
      });
      expect(result.current.leftDrawer.isOpen).toBe(true);

      act(() => {
        result.current.leftDrawer.onDelete('id1');
      });

      expect(result.current.leftDrawer.isOpen).toBe(false);
    });

    it('leftDrawer.onReset 시 서랍이 닫힌다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        result.current.leftDrawer.open();
      });
      expect(result.current.leftDrawer.isOpen).toBe(true);

      act(() => {
        result.current.leftDrawer.onReset('id1');
      });

      expect(result.current.leftDrawer.isOpen).toBe(false);
    });

    it('leftDrawer.onCreate 시 생성 후 서랍이 닫힌다', async () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        result.current.leftDrawer.open();
      });
      expect(result.current.leftDrawer.isOpen).toBe(true);

      await act(async () => {
        result.current.leftDrawer.onCreate();
      });

      expect(mockCreateMandalart).toHaveBeenCalled();
      expect(result.current.leftDrawer.isOpen).toBe(false);
    });
  });

  // -- rightDrawer --

  describe('rightDrawer', () => {
    it('rightDrawer open/close 동작한다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      expect(result.current.rightDrawer.isOpen).toBe(false);

      act(() => {
        result.current.rightDrawer.open();
      });
      expect(result.current.rightDrawer.isOpen).toBe(true);

      act(() => {
        result.current.rightDrawer.close();
      });
      expect(result.current.rightDrawer.isOpen).toBe(false);
    });
  });

  // -- signInDialog --

  describe('signInDialog', () => {
    it('signInDialog open/close 동작한다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      expect(result.current.signInDialog.isOpen).toBe(false);

      act(() => {
        result.current.signInDialog.open();
      });
      expect(result.current.signInDialog.isOpen).toBe(true);

      act(() => {
        result.current.signInDialog.close();
      });
      expect(result.current.signInDialog.isOpen).toBe(false);
    });

    it('signInDialog.onSignIn 시 다이얼로그가 닫히고 signIn이 호출된다', async () => {
      const mockSignIn = vi.fn().mockResolvedValue(undefined);
      useAuthStore.setState({ signIn: mockSignIn });

      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        result.current.signInDialog.open();
      });
      expect(result.current.signInDialog.isOpen).toBe(true);

      await act(async () => {
        result.current.signInDialog.onSignIn('google.com');
      });

      expect(result.current.signInDialog.isOpen).toBe(false);
      expect(mockSignIn).toHaveBeenCalledWith('google.com');
    });
  });

  // -- alert 에러 처리 --

  describe('alert 에러 처리', () => {
    it('userError가 설정되면 alert를 연다', () => {
      const { result, rerender } = renderHook(
        ({ error }) => useAppLayoutState({ error }),
        { initialProps: { error: null as Error | null } },
      );

      expect(result.current.alert.isOpen).toBe(false);

      rerender({ error: new Error('auth failed') });

      expect(result.current.alert.isOpen).toBe(true);
      expect(result.current.alert.content).toBe('auth.errors.signIn.default');
    });

    it('mandalartsError가 있으면 alert를 열고, 닫으면 reload한다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      act(() => {
        useMandalartStore.setState({ error: new Error('sync failed') });
      });

      expect(result.current.alert.isOpen).toBe(true);
      expect(result.current.alert.content).toBe(
        'mandalart.errors.sync.default',
      );

      act(() => {
        result.current.alert.close();
      });

      expect(result.current.alert.isOpen).toBe(false);
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('일반 alert 닫기 시 reload하지 않는다', () => {
      // userError로 열린 alert는 sync error가 아니므로 reload하지 않아야 함
      const { result, rerender } = renderHook(
        ({ error }) => useAppLayoutState({ error }),
        { initialProps: { error: null as Error | null } },
      );

      rerender({ error: new Error('auth failed') });
      expect(result.current.alert.isOpen).toBe(true);

      act(() => {
        result.current.alert.close();
      });

      expect(result.current.alert.isOpen).toBe(false);
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  // -- confirmDialog --

  describe('confirmDialog', () => {
    it('confirmDialog.onConfirm이 content의 onConfirm을 호출하고 닫는다', () => {
      const { result } = renderHook(() => useAppLayoutState({}));

      // leftDrawer.onDelete는 내부적으로 openConfirmDialog를 호출하여
      // confirmDialog에 content를 설정한다
      act(() => {
        result.current.leftDrawer.onDelete('id1');
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);
      expect(result.current.confirmDialog.message).toBe(
        'mandalart.confirmDelete',
      );
      expect(result.current.confirmDialog.confirmText).toBe(
        'mandalart.delete',
      );

      act(() => {
        result.current.confirmDialog.onConfirm();
      });

      expect(result.current.confirmDialog.isOpen).toBe(false);
    });
  });
});
