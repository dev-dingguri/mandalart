import { useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import MainPage from '@/components/MainPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PATH_OSS } from '@/constants';
import { useIsDarkMode } from '@/stores/useThemeStore';
import { trackAppVersion } from '@/lib/analyticsEvents';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const OpenSourceLicensesPage = lazy(
  () => import('@/components/OpenSourceLicensesPage')
);

const App = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    trackAppVersion();
    // 모듈 수준 함수는 의존성 배열 생략 — 마운트 시 1회만 실행하면 충분
  }, []);

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
    // 브라우저 주소창/상태바 색상을 실제 배경색(--background)과 일치시킴
    setMeta('name', 'theme-color', isDarkMode ? '#1c1c1e' : '#f2f2f7');
  }, [t, isDarkMode]);

  return (
    <TooltipProvider>
      <Toaster
        theme={isDarkMode ? 'dark' : 'light'}
        position="bottom-center"
        duration={3000}
        toastOptions={{ className: 'text-sm' }}
      />
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
    </TooltipProvider>
  );
};

export default App;
