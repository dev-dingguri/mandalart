import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService from 'services/authService';
import { initialState } from 'types/initialState';

const useUser = (initialUser: initialState<User | null>) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      console.log(`AuthStateChange user=${user ? user.email : 'none'}`);
      setUser(user);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    authService
      .getRedirectResult()
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // tuple로 고정
  return [user, isLoading, error] as const;
};

export default useUser;
