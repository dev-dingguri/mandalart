import { useMemo } from 'react';
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

  return useMemo(() => {
    const getSignInSession = (user: User) =>
      signInSessions[user.uid] ?? INITIAL_SIGN_IN_SESSION;
    const setSignInSession = (user: User, signInSession: SignInSession) =>
      setSignInSessions({ ...signInSessions, [user.uid]: signInSession });

    const getShouldUploadTemp = (user: User) =>
      getSignInSession(user).shouldUploadTemp;
    const setShouldUploadTemp = (user: User, shouldUploadTemp: boolean) => {
      const signInSession = getSignInSession(user);
      setSignInSession(user, { ...signInSession, shouldUploadTemp });
    };

    return {
      getSignInSession,
      setSignInSession,
      getShouldUploadTemp,
      setShouldUploadTemp,
    };
  }, [signInSessions, setSignInSessions]);
};

export default useSignInSession;
