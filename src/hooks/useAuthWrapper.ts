import { useAuth } from 'reactfire';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useCallback } from 'react';

const useAuthWrapper = () => {
  const auth = useAuth();
  const signIn = useCallback(
    async (providerId: string) =>
      signInWithRedirect(auth, getProvider(providerId)),
    [auth]
  );
  const signOut = useCallback(
    async () => auth.signOut().then(() => console.log('signed out')),
    [auth]
  );

  return { signIn, signOut };
};

const getProvider = (providerId: string) => {
  switch (providerId) {
    case GoogleAuthProvider.PROVIDER_ID:
      return new GoogleAuthProvider();
    default:
      throw new Error(`Unsupported provider. providerId=${providerId}`);
  }
};

export default useAuthWrapper;
