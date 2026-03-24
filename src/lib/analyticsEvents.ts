import { logEvent, setUserProperties } from '@/lib/analytics';
import { APP_VERSION } from '@/version';

export const trackAppVersion = () =>
  setUserProperties({ app_version: APP_VERSION });

export const trackUserType = (userType: 'guest' | 'authenticated') =>
  setUserProperties({ user_type: userType });

export const trackSignIn = (provider: string) =>
  logEvent('sign_in', { provider });

export const trackSignOut = () => logEvent('sign_out');

export const trackMandalartCreate = () => logEvent('mandalart_create');

export const trackMandalartDelete = () => logEvent('mandalart_delete');

export const trackMandalartReset = () => logEvent('mandalart_reset');

export const trackGuestUpload = () => logEvent('guest_upload');

export const trackViewModeChange = (mode: 'all' | 'focus') =>
  logEvent('view_mode_change', { mode });

export const trackLanguageChange = (language: string) =>
  logEvent('language_change', { language });

export const trackThemeChange = (theme: string) =>
  logEvent('theme_change', { theme });
