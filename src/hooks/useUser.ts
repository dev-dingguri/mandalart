import useBoolean from 'hooks/useBoolean';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService from 'services/authService';
import signInSessionStorage from '../services/signInSessionStorage';

const useUser = (initialUser: User | null) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    startLoading();
    setError(null);
    authService
      .getRedirectResult()
      .then((userCred) => {
        if (!userCred) return;
        signInSessionStorage.initial(userCred.user);
      })
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
        setError(e);
      })
      .finally(() => {
        endLoading();
      });
  }, [startLoading, endLoading]);

  useEffect(() => {
    return authService.onAuthStateChanged((user) => {
      console.log(`AuthStateChange user=${user ? user.email : 'none'}`);
      setUser(user);
    });
  }, []);

  return [user, isLoading, error] as const;
};

export default useUser;
