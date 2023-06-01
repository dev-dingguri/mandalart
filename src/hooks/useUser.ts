import { useEffect, useState } from 'react';
import { Unsubscribe, User } from 'firebase/auth';
import authService from 'services/authService';
import signInSessionStorage from '../services/signInSessionStorage';
import { hashQueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

const unsubscribes: Record<string, Unsubscribe> = {};

const useUser = (initialUser: User | null) => {
  const [user, setUser] = useState(initialUser);
  const { data: redirectedUser, ...rest } = useQuery<User | null, Error>({
    queryKey: ['auth/redirectResult'],
    // firebase의 Auth.onAuthStateChanged의 error파라미터가 Deprecated되어서
    // firebase의 Auth.getRedirectResult로 로그인 결과를 받아옵니다.
    queryFn: async () => {
      return authService.getRedirectResult().then((userCred) => {
        if (!userCred) return null;
        signInSessionStorage.initial(userCred.user);
        return userCred.user;
      });
    },
  });
  const queryClient = useQueryClient();
  const queryKey = ['auth/onAuthStateChanged'];
  const queryKeyHash = hashQueryKey(queryKey);
  // useEffect에 비해서 너무 복잡함
  const { data: syncUser } = useQuery<User | null, Error>({
    queryKey,
    queryFn: async () => {
      if (unsubscribes[queryKeyHash]) return null;
      return new Promise((resolve) => {
        let isFirst = true;
        unsubscribes[queryKeyHash] = authService.onAuthStateChanged(
          async (user) => {
            console.log(`AuthStateChange user=${user ? user.email : 'none'}`);
            if (isFirst) {
              isFirst = false;
              resolve(user);
            } else {
              queryClient.setQueryData(queryKey, user);
            }
          }
        );
      });
    },
    initialData: initialUser,
  });

  useEffect(() => {
    // unsubscribes의 원소를 삭제해야하기 때문에 keys를 먼저 복사합니다.
    Object.keys(unsubscribes).forEach((key) => {
      if (key !== queryKeyHash) {
        unsubscribes[key]();
        delete unsubscribes[key];
      }
    });
  }, [queryKeyHash]);

  useEffect(() => {
    redirectedUser && setUser(redirectedUser);
    setUser(syncUser);
  }, [redirectedUser, syncUser]);

  return { user, ...rest };
};

export default useUser;
