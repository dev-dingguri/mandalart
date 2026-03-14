import { useCallback } from 'react';
import { User } from 'firebase/auth';
import useSubscription from './useSubscription';
import useAuth from './useAuth';
import useSignInSession, { INITIAL_SIGN_IN_SESSION } from './useSignInSession';

const useUser = () => {
  const { getRedirectResult, onAuthStateChanged } = useAuth();
  const { setSignInSession } = useSignInSession();

  const subscribe = useCallback(
    (
      updateCallback: (data: User | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      getRedirectResult()
        // 리디렉션 작업이 호출되지 않은 경우 user = null
        .then((user) => user && setSignInSession(user, INITIAL_SIGN_IN_SESSION))
        .catch(cancelCallback);
      return onAuthStateChanged(updateCallback);
    },
    [getRedirectResult, onAuthStateChanged, setSignInSession]
  );

  const { data, status, error } = useSubscription<User>(subscribe);

  return { user: data, isLoading: status === 'loading', error };
};

export default useUser;
