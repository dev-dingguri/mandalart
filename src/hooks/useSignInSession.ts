import { useCallback } from 'react';
import { STORAGE_KEY_SIGN_IN_SESSION } from 'constants/constants';
import { useSessionStorage } from 'usehooks-ts';
import { User } from 'firebase/auth';

type SignInSession = {
  shouldUploadTemp: boolean;
};

export const INITIAL_SIGN_IN_SESSION: SignInSession = {
  shouldUploadTemp: true,
};

const useSignInSession = () => {
  // key: user.uid
  const [signInSessions, setSignInSessions] = useSessionStorage<
    Record<string, SignInSession>
  >(STORAGE_KEY_SIGN_IN_SESSION, {});

  const getSignInSession = useCallback(
    (user: User) => signInSessions[user.uid] ?? INITIAL_SIGN_IN_SESSION,
    [signInSessions]
  );
  const setSignInSession = useCallback(
    (user: User, signInSession: SignInSession) =>
      setSignInSessions((signInSessions) => ({
        ...signInSessions,
        [user.uid]: signInSession,
      })),
    [setSignInSessions]
  );

  const getShouldUploadTemp = useCallback(
    (user: User) => getSignInSession(user).shouldUploadTemp,
    [getSignInSession]
  );
  const setShouldUploadTemp = useCallback(
    (user: User, shouldUploadTemp: boolean) => {
      const signInSession = getSignInSession(user);
      setSignInSession(user, { ...signInSession, shouldUploadTemp });
    },
    [getSignInSession, setSignInSession]
  );

  return {
    getSignInSession,
    setSignInSession,
    getShouldUploadTemp,
    setShouldUploadTemp,
  };
};

export default useSignInSession;
