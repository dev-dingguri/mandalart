import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;
  selectTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, selectTheme: setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const initialTheme = (): Theme => {
  const theme = localStorage.getItem('theme');
  return theme && ['system', 'light', 'dark'].includes(theme)
    ? (theme as Theme)
    : 'system';
};

const updateTheme = (theme: Theme) => {
  if (isLightTheme(theme)) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('theme', theme);
};

export const isLightTheme = (theme: Theme) => {
  return (
    theme === 'light' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: light)').matches)
  );
};

export const useTheme = () => useContext(ThemeContext);
