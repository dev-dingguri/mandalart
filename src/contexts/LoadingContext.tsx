import {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
} from 'react';
import { useEffect, useRef } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  addLoadingCondition: (key: string, condition: boolean) => void;
  deleteLoadingCondition: (key: string) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setLoading] = useState(false);
  const conditionsRef = useRef<Map<string, boolean>>(new Map());

  const loadingConditionHandlers = useMemo(() => {
    const conditions = conditionsRef.current;
    const updateIsLoading = () => {
      const isLoading = Array.from(conditions.values()).includes(true);
      setLoading(isLoading);
    };
    return {
      addLoadingCondition: (key: string, condition: boolean) => {
        conditions.set(key, condition);
        updateIsLoading();
      },
      deleteLoadingCondition: (key: string) => {
        conditions.delete(key);
        updateIsLoading();
      },
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, ...loadingConditionHandlers }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useIsLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useIsLoading must be used within a LoadingProvider.');
  }
  console.log(`isLoading=${context.isLoading}`);
  return context.isLoading;
};

export const useAddLoadingCondition = (key: string, condition: boolean) => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error(
      'useAddLoadingCondition must be used within a LoadingProvider'
    );
  }
  const { addLoadingCondition, deleteLoadingCondition } = context;

  useEffect(() => {
    addLoadingCondition(key, condition);
  }, [key, condition, addLoadingCondition]);

  useEffect(() => {
    return () => deleteLoadingCondition(key);
  }, [key, deleteLoadingCondition]);
};
