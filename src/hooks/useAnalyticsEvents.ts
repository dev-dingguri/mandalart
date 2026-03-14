import { useMemo } from 'react';
import useAnalytics from 'hooks/useAnalytics';
import { APP_VERSION } from 'version';

const useAnalyticsEvents = () => {
  const { logEvent, setUserProperties } = useAnalytics();

  return useMemo(
    () => ({
      trackAppVersion: () => setUserProperties({ app_version: APP_VERSION }),
      trackUserType: (userType: 'guest' | 'authenticated') =>
        setUserProperties({ user_type: userType }),

      trackSignIn: (provider: string) => logEvent('sign_in', { provider }),
      trackSignOut: () => logEvent('sign_out'),

      trackMandalartCreate: () => logEvent('mandalart_create'),
      trackMandalartDelete: () => logEvent('mandalart_delete'),
      trackMandalartReset: () => logEvent('mandalart_reset'),
      trackGuestUpload: () => logEvent('guest_upload'),

      trackViewModeChange: (mode: 'all' | 'focus') =>
        logEvent('view_mode_change', { mode }),

      trackLanguageChange: (language: string) =>
        logEvent('language_change', { language }),
      trackThemeChange: (theme: string) =>
        logEvent('theme_change', { theme }),
    }),
    [logEvent, setUserProperties]
  );
};

export default useAnalyticsEvents;
