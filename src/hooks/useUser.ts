import { useCallback } from 'react';
import { User } from 'firebase/auth';
import authService from 'services/authService';
import signInSessionStorage from '../services/signInSessionStorage';
import useSubscription from './useSubscription';

const useUser = () => {
  const subscribe = useCallback(
    (
      updateCallback: (data: User | null) => void,
      cancelCallback: (error: Error) => void
    ) => {
      authService
        .getRedirectResult()
        .then((user) => {
          if (!user) return; // 리디렉션 작업이 호출되지 않은 경우 user = null
          signInSessionStorage.initial(user); // todo: 개선 검토
        })
        .catch(cancelCallback);
      return authService.onAuthStateChanged((user) => {
        updateCallback(user);
      });
    },
    []
  );

  const { data, status, error } = useSubscription<User>(subscribe);

  return { user: data, isLoading: status === 'loading', error };
};

export default useUser;
