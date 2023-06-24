import { useCallback } from 'react';
import { User } from 'firebase/auth';
import signInSessionStorage from '../services/signInSessionStorage';
import useSubscription from './useSubscription';
import useAuth from './useAuth';

const useUser = () => {
  const { getRedirectResult, onAuthStateChanged } = useAuth();

  const subscribe = useCallback(
    (
      updateCallback: (data: User | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      getRedirectResult()
        .then((user) => {
          if (!user) return; // 리디렉션 작업이 호출되지 않은 경우 user = null
          signInSessionStorage.initial(user); // todo: 개선 검토
        })
        .catch(cancelCallback);
      // todo: getRedirectResult에서 error 발생 후 onAuthStateChanged에서 성공(user=null)으로 처리하는 상황이 발생하는지 확인
      return onAuthStateChanged(updateCallback);
    },
    [getRedirectResult, onAuthStateChanged]
  );

  const { data, status, error } = useSubscription<User>(subscribe);

  return { user: data, isLoading: status === 'loading', error };
};

export default useUser;
