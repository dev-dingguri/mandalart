import { create } from 'zustand';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  AuthError,
} from 'firebase/auth';
import { auth } from 'lib/firebase';
import { STORAGE_KEY_SIGN_IN_SESSION } from 'constants/constants';

type SignInSession = {
  shouldUploadTemp: boolean;
};

const INITIAL_SIGN_IN_SESSION: SignInSession = {
  shouldUploadTemp: true,
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (providerId: string) => Promise<void>;
  signOut: () => Promise<void>;
  getShouldUploadTemp: () => boolean;
  setShouldUploadTemp: (value: boolean) => void;
};

const getProvider = (providerId: string) => {
  if (providerId === GoogleAuthProvider.PROVIDER_ID) {
    return new GoogleAuthProvider();
  }
  throw new Error(`Unsupported provider. providerId=${providerId}`);
};

const readSessions = (): Record<string, SignInSession> => {
  try {
    return JSON.parse(
      sessionStorage.getItem(STORAGE_KEY_SIGN_IN_SESSION) || '{}'
    );
  } catch {
    return {};
  }
};

const writeSessions = (sessions: Record<string, SignInSession>) => {
  sessionStorage.setItem(
    STORAGE_KEY_SIGN_IN_SESSION,
    JSON.stringify(sessions)
  );
};

const saveSession = (uid: string) => {
  const sessions = readSessions();
  sessions[uid] = INITIAL_SIGN_IN_SESSION;
  writeSessions(sessions);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (providerId) => {
    const provider = getProvider(providerId);
    try {
      const userCred = await signInWithPopup(auth, provider);
      saveSession(userCred.user.uid);
    } catch (error) {
      const code = (error as AuthError).code;
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-browser') {
        await signInWithRedirect(auth, provider);
      } else {
        set({ error: error as Error });
      }
    }
  },

  signOut: async () => auth.signOut(),

  getShouldUploadTemp: () => {
    const user = get().user;
    if (!user) return false;
    const sessions = readSessions();
    return (sessions[user.uid] ?? INITIAL_SIGN_IN_SESSION).shouldUploadTemp;
  },

  setShouldUploadTemp: (value) => {
    const user = get().user;
    if (!user) return;
    const sessions = readSessions();
    sessions[user.uid] = {
      ...(sessions[user.uid] ?? INITIAL_SIGN_IN_SESSION),
      shouldUploadTemp: value,
    };
    writeSessions(sessions);
  },
}));

// Redirect 폴백으로 돌아온 경우 결과 처리
getRedirectResult(auth)
  .then((userCred) => {
    if (userCred) saveSession(userCred.user.uid);
  })
  .catch((error) => useAuthStore.setState({ error }));

auth.onAuthStateChanged(
  (user) => useAuthStore.setState({ user, isLoading: false, error: null }),
  (error) => useAuthStore.setState({ user: null, isLoading: false, error })
);
