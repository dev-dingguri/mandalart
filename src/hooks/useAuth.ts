import { useMemo } from 'react';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  User,
  NextOrObserver,
} from 'firebase/auth';
import { useAuthSdk } from 'contexts/FirebaseSdksContext';

const useAuth = () => {
  const auth = useAuthSdk();

  return useMemo(
    () => ({
      signIn: async (providerId: string) =>
        signInWithRedirect(auth, getProvider(providerId)),
      signOut: async () => auth.signOut().then(() => console.log('signed out')),
      getRedirectResult: () =>
        getRedirectResult(auth).then((userCred) =>
          userCred ? userCred.user : null
        ),
      onAuthStateChanged: (observer: NextOrObserver<User | null>) => {
        return auth.onAuthStateChanged(observer);
      },
    }),
    [auth]
  );
};

const getProvider = (providerId: string) => {
  switch (providerId) {
    case GoogleAuthProvider.PROVIDER_ID:
      return new GoogleAuthProvider();
    default:
      throw new Error(`Unsupported provider. providerId=${providerId}`);
  }
};

export default useAuth;
