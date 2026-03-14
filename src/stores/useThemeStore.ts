import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TernaryDarkMode = 'system' | 'light' | 'dark';

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

  // system 모드일 때 OS 설정을 상태로 추적
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (ternaryDarkMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [ternaryDarkMode]);

  if (ternaryDarkMode === 'dark') return true;
  if (ternaryDarkMode === 'light') return false;
  return systemDark;
};
