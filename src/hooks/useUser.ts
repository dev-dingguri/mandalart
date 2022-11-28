import useBoolean from 'hooks/useBoolean';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService from 'services/authService';

const useUser = (initialUser: User | null) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      console.log(`AuthStateChange user=${user ? user.email : 'none'}`);
      setUser(user);
    });
  }, []);

  useEffect(() => {
    startLoading();
    setError(null);
    authService
      .getRedirectResult()
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
        setError(e);
      })
      .finally(() => {
        endLoading();
      });
  }, [startLoading, endLoading]);

  // tuple로 고정
  return [user, isLoading, error] as const;
};

export default useUser;
