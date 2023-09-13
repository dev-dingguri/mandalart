import { useState, useCallback, useLayoutEffect } from 'react';

type Unsubscribe = () => void;

type SubscriptionStatus<T> = {
  data: T | null;
  status: 'loading' | 'success' | 'error';
  error: Error | null;
};
const useSubscription = <T>(
  subscribe: (
    updateCallback: (data: T | null) => void,
    cancelCallback: (error: Error) => void
  ) => Unsubscribe | void
) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    SubscriptionStatus<T>
  >({
    data: null,
    status: 'loading',
    error: null,
  });

  const load = useCallback(() => {
    setSubscriptionStatus({
      data: null,
      status: 'loading',
      error: null,
    });
  }, []);
  const updateCallback = useCallback((data: T | null) => {
    setSubscriptionStatus({
      data,
      status: 'success',
      error: null,
    });
  }, []);
  const cancelCallback = useCallback((error: Error) => {
    setSubscriptionStatus({
      data: null,
      status: 'error',
      error,
    });
  }, []);

  useLayoutEffect(() => {
    load();
    return subscribe(updateCallback, cancelCallback);
  }, [subscribe, load, updateCallback, cancelCallback]);

  return { ...subscriptionStatus };
};

export default useSubscription;
