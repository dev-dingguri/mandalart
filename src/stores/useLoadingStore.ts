import { useEffect } from 'react';
import { create } from 'zustand';

type LoadingState = {
  conditions: Map<string, boolean>;
  isLoading: boolean;
  addCondition: (key: string, condition: boolean) => void;
  deleteCondition: (key: string) => void;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  conditions: new Map(),
  isLoading: false,
  addCondition: (key, condition) => {
    const conditions = new Map(get().conditions);
    conditions.set(key, condition);
    set({
      conditions,
      isLoading: Array.from(conditions.values()).includes(true),
    });
  },
  deleteCondition: (key) => {
    const conditions = new Map(get().conditions);
    conditions.delete(key);
    set({
      conditions,
      isLoading: Array.from(conditions.values()).includes(true),
    });
  },
}));

export const useIsLoading = () => useLoadingStore((s) => s.isLoading);

export const useAddLoadingCondition = (key: string, condition: boolean) => {
  const addCondition = useLoadingStore((s) => s.addCondition);
  const deleteCondition = useLoadingStore((s) => s.deleteCondition);

  useEffect(() => {
    addCondition(key, condition);
  }, [key, condition, addCondition]);

  useEffect(() => {
    return () => deleteCondition(key);
  }, [key, deleteCondition]);
};
