import { useCallback } from 'react';
import { User } from 'firebase/auth';
import useSubscription from './useSubscription';
import useAuth from './useAuth';
import useSignInSession, { INITIAL_SIGN_IN_SESSION } from './useSignInSession';
import useAnalytics from './useAnalytics';

const useUser = () => {
  const { getRedirectResult, onAuthStateChanged } = useAuth();
  const { setUserProperties } = useAnalytics();
  const { setSignInSession } = useSignInSession();

  const subscribe = useCallback(
    (
      updateCallback: (user: User | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      getRedirectResult()
        // 리디렉션 작업이 호출되지 않은 경우 user = null
        .then((user) => user && setSignInSession(user, INITIAL_SIGN_IN_SESSION))
        .catch(cancelCallback);
      // todo: getRedirectResult에서 error 발생 후 onAuthStateChanged에서 성공(user=null)으로 처리하는 상황이 발생하는지 확인
      return onAuthStateChanged((user) => {
        setUserProperties({ uid: user ? user.uid : 'null' });
        updateCallback(user);
      });
    },
    [getRedirectResult, onAuthStateChanged, setSignInSession, setUserProperties]
  );

  const { data: user, status, error } = useSubscription<User>(subscribe);

  return { user, isLoading: status === 'loading', error };
};

export default useUser;
