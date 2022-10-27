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
  return ['system', 'light', 'dark'].includes(localStorage.theme)
    ? localStorage.theme
    : 'system';
};

const updateTheme = (theme: Theme) => {
  if (isLightTheme(theme)) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.theme = theme;
};

export const isLightTheme = (theme: Theme) => {
  return (
    theme === 'light' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: light)').matches)
  );
};

export const useTheme = () => useContext(ThemeContext);
