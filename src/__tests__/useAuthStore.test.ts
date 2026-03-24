import { vi, describe, it, expect, beforeEach } from 'vitest';

// vi.hoisted: these run before vi.mock factories (which are hoisted to the top)
const {
  authStateCallbacks,
  mockSignInWithPopup,
  mockSignOut,
} = vi.hoisted(() => ({
  authStateCallbacks: {
    onUser: null as ((user: any) => void) | null,
    onError: null as ((error: Error) => void) | null,
  },
  mockSignInWithPopup: vi.fn(),
  mockSignOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((onUser: any, onError: any) => {
      authStateCallbacks.onUser = onUser;
      authStateCallbacks.onError = onError;
      return vi.fn(); // unsubscribe
    }),
    signOut: mockSignOut,
  },
  db: {},
  analytics: null,
}));

vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    static PROVIDER_ID = 'google.com';
  }
  return {
    getAuth: vi.fn(() => ({ onAuthStateChanged: vi.fn() })),
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  };
});

// firebase/database may be imported transitively
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  onValue: vi.fn(),
}));

// Import AFTER mocks so module-level side effects use mocked modules
import { useAuthStore } from '@/stores/useAuthStore';
import { STORAGE_KEY_SIGN_IN_SESSION } from '@/constants';

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      isLoading: true,
      error: null,
    });
  });

  // -- Initial state --

  describe('초기 상태', () => {
    it('초기 상태는 user=null, isLoading=true이다', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  // -- onAuthStateChanged --

  describe('onAuthStateChanged', () => {
    it('사용자 로그인 시 user, isLoading, error를 업데이트한다', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      authStateCallbacks.onUser!(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('에러 발생 시 error를 설정하고 user를 null로 한다', () => {
      const error = new Error('Auth failed');
      authStateCallbacks.onError!(error);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // -- signIn --

  describe('signIn', () => {
    it('Google 로그인 시 signInWithPopup을 호출한다', async () => {
      mockSignInWithPopup.mockResolvedValue({ user: { uid: 'test-uid' } });

      await useAuthStore.getState().signIn('google.com');

      expect(mockSignInWithPopup).toHaveBeenCalledOnce();
    });

    it('로그인 성공 시 sessionStorage에 세션을 저장한다', async () => {
      mockSignInWithPopup.mockResolvedValue({ user: { uid: 'test-uid' } });

      await useAuthStore.getState().signIn('google.com');

      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY_SIGN_IN_SESSION) || '{}',
      );
      expect(stored['test-uid']).toEqual({ shouldUploadTemp: true });
    });

    it('지원하지 않는 provider에 대해 에러를 throw한다', async () => {
      await expect(
        useAuthStore.getState().signIn('facebook.com'),
      ).rejects.toThrow('Unsupported provider');
    });
  });

  // -- signOut --

  describe('signOut', () => {
    it('auth.signOut을 호출한다', async () => {
      await useAuthStore.getState().signOut();

      expect(mockSignOut).toHaveBeenCalledOnce();
    });
  });

  // -- getShouldUploadTemp --

  describe('getShouldUploadTemp', () => {
    it('user가 없으면 false를 반환한다', () => {
      const result = useAuthStore.getState().getShouldUploadTemp();
      expect(result).toBe(false);
    });

    it('세션이 없으면 기본값 true를 반환한다', () => {
      useAuthStore.setState({ user: { uid: 'test-uid' } as any });

      const result = useAuthStore.getState().getShouldUploadTemp();
      expect(result).toBe(true);
    });

    it('세션이 있으면 저장된 값을 반환한다', () => {
      useAuthStore.setState({ user: { uid: 'test-uid' } as any });
      sessionStorage.setItem(
        STORAGE_KEY_SIGN_IN_SESSION,
        JSON.stringify({ 'test-uid': { shouldUploadTemp: false } }),
      );

      const result = useAuthStore.getState().getShouldUploadTemp();
      expect(result).toBe(false);
    });
  });

  // -- setShouldUploadTemp --

  describe('setShouldUploadTemp', () => {
    it('user가 없으면 아무 동작하지 않는다', () => {
      useAuthStore.getState().setShouldUploadTemp(false);

      const stored = sessionStorage.getItem(STORAGE_KEY_SIGN_IN_SESSION);
      expect(stored).toBeNull();
    });

    it('세션에 값을 저장한다', () => {
      useAuthStore.setState({ user: { uid: 'test-uid' } as any });

      useAuthStore.getState().setShouldUploadTemp(false);

      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY_SIGN_IN_SESSION) || '{}',
      );
      expect(stored['test-uid']).toEqual({ shouldUploadTemp: false });
    });

    it('기존 세션을 업데이트한다', () => {
      useAuthStore.setState({ user: { uid: 'test-uid' } as any });
      // Pre-populate with shouldUploadTemp: true
      sessionStorage.setItem(
        STORAGE_KEY_SIGN_IN_SESSION,
        JSON.stringify({ 'test-uid': { shouldUploadTemp: true } }),
      );

      useAuthStore.getState().setShouldUploadTemp(false);

      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY_SIGN_IN_SESSION) || '{}',
      );
      expect(stored['test-uid']).toEqual({ shouldUploadTemp: false });
    });
  });
});
