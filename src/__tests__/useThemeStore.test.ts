import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/stores/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear(); // persist 미들웨어의 localStorage 잔류 방지
    useThemeStore.setState({ ternaryDarkMode: 'system' });
  });

  it('초기 ternaryDarkMode는 system이어야 한다', () => {
    expect(useThemeStore.getState().ternaryDarkMode).toBe('system');
  });

  it('setTernaryDarkMode로 dark로 변경되어야 한다', () => {
    useThemeStore.getState().setTernaryDarkMode('dark');
    expect(useThemeStore.getState().ternaryDarkMode).toBe('dark');
  });

  it('setTernaryDarkMode로 light로 변경되어야 한다', () => {
    useThemeStore.getState().setTernaryDarkMode('light');
    expect(useThemeStore.getState().ternaryDarkMode).toBe('light');
  });

  it('setTernaryDarkMode로 system으로 되돌릴 수 있어야 한다', () => {
    useThemeStore.getState().setTernaryDarkMode('dark');
    useThemeStore.getState().setTernaryDarkMode('system');
    expect(useThemeStore.getState().ternaryDarkMode).toBe('system');
  });
});
