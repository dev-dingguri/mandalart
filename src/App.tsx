import { useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import MainPage from '@/components/MainPage';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PATH_OSS, PATH_APP, PATH_GUIDE } from '@/constants';
import { useIsDarkMode } from '@/stores/useThemeStore';
import { trackAppVersion } from '@/lib/analyticsEvents';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelmetProvider } from 'react-helmet-async';

// SPA는 라우트 변경 시 브라우저가 스크롤을 자동 초기화하지 않으므로 수동 처리
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const OpenSourceLicensesPage = lazy(
  () => import('@/components/OpenSourceLicensesPage')
);
const LandingPage = lazy(() => import('@/components/LandingPage'));
const GuidePage = lazy(() => import('@/components/GuidePage'));

const App = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    trackAppVersion();
    // 모듈 수준 함수는 의존성 배열 생략 — 마운트 시 1회만 실행하면 충분
  }, []);

  useEffect(() => {
    // 빌드 타임 프리렌더러(vite-plugin-prerender)가 이 이벤트를 기다렸다가 HTML을 캡처함
    // 이벤트 없이 타임아웃에 의존하면 React hydration 전 빈 DOM이 스냅샷될 수 있음
    document.dispatchEvent(new Event('render-event'));
  }, []);

  const isDarkMode = useIsDarkMode();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // theme-color만 여기서 처리 — title/description/og는 SEOHead(react-helmet-async)가 담당
    // 브라우저 주소창/상태바 색상을 실제 배경색(--background)과 일치시킴
    const el = document.querySelector('meta[name="theme-color"]');
    if (el) {
      el.setAttribute('content', isDarkMode ? '#1c1c1e' : '#f2f2f7');
    }
  }, [isDarkMode]);

  return (
    <HelmetProvider>
      <TooltipProvider>
        <Toaster
          theme={isDarkMode ? 'dark' : 'light'}
          position="bottom-center"
          duration={3000}
          toastOptions={{ className: 'text-sm' }}
        />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route
              path={`/${lang}`}
              element={
                <Suspense fallback={null}>
                  <LandingPage />
                </Suspense>
              }
            />
            {/* 도구 페이지만 h-dvh로 감쌈 — 랜딩/가이드는 스크롤이 필요한 긴 콘텐츠 페이지 */}
            <Route
              path={`/${lang}${PATH_APP}`}
              element={
                <div className="h-dvh">
                  <MainPage />
                </div>
              }
            />
            <Route
              path={`/${lang}${PATH_GUIDE}`}
              element={
                <Suspense fallback={null}>
                  <GuidePage />
                </Suspense>
              }
            />
            {/* OSS 페이지도 h-full + overflow-y-auto 패턴이므로 고정 높이 필요 */}
            <Route
              path={`/${lang}${PATH_OSS}`}
              element={
                <div className="h-dvh">
                  <Suspense fallback={null}>
                    <OpenSourceLicensesPage />
                  </Suspense>
                </div>
              }
            />
            <Route path="*" element={<Navigate to={`/${lang}`} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  );
};

export default App;
