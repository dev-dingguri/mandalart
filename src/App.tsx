import { useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import MainPage from '@/components/MainPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PATH_OSS } from '@/constants/constants';
import { useIsDarkMode } from '@/stores/useThemeStore';
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';

const OpenSourceLicensesPage = lazy(
  () => import('@/components/OpenSourceLicensesPage')
);

const App = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { trackAppVersion } = useAnalyticsEvents();

  useEffect(() => {
    trackAppVersion();
  }, [trackAppVersion]);

  const isDarkMode = useIsDarkMode();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.title = t('seo.title');
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', t('seo.description'));
    setMeta('property', 'og:title', t('seo.title'));
    setMeta('property', 'og:description', t('seo.description'));
    setMeta('name', 'theme-color', isDarkMode ? '#000000' : '#ffffff');
  }, [t, isDarkMode]);

  return (
    <div className="h-dvh">
      <BrowserRouter>
        <Routes>
          <Route path={`/${lang}`} element={<MainPage />} />
          <Route
            path={`/${lang}${PATH_OSS}`}
            element={
              <Suspense fallback={null}>
                <OpenSourceLicensesPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to={`/${lang}`} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
