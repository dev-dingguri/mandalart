import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TernaryDarkMode = 'system' | 'light' | 'dark';

const getIsDarkMode = (mode: TernaryDarkMode): boolean => {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

type ThemeState = {
  ternaryDarkMode: TernaryDarkMode;
  setTernaryDarkMode: (mode: TernaryDarkMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ternaryDarkMode: 'system' as TernaryDarkMode,
      setTernaryDarkMode: (mode) => set({ ternaryDarkMode: mode }),
    }),
    {
      name: 'ternaryDarkMode',
    }
  )
);

// 파생값: 각 컴포넌트에서 isDarkMode가 필요할 때 사용
export const useIsDarkMode = () => {
  const { ternaryDarkMode } = useThemeStore();
  return getIsDarkMode(ternaryDarkMode);
};
