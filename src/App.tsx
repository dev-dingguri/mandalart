import React, { useEffect, useState } from 'react';
import MainPage from 'components/MainPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OpenSourceLicensesPage from 'components/OpenSourceLicensesPage';
import { useTranslation } from 'react-i18next';
import { PATH_OSS } from 'constants/constants';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from 'theme';
import { useEventListener, useTernaryDarkMode } from 'usehooks-ts';
import useAnalytics from 'hooks/useAnalytics';
import { APP_VERSION } from 'version';

const App = () => {
  const [height, setHeight] = useState(window.innerHeight);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { setUserProperties } = useAnalytics();

  useEffect(() => {
    setUserProperties({ app_version: APP_VERSION });
  }, [setUserProperties]);

  /* 모바일 브라우저 주소창 및 네비게이션 영역 제외한 높이로 변경 */
  useEventListener('resize', () => {
    requestAnimationFrame(() => setHeight(window.innerHeight));
  });

  const { isDarkMode } = useTernaryDarkMode();

  useEffect(() => {
    document.title = t('tag.title');
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', t('tag.description'));
    setMeta('property', 'og:title', t('tag.title'));
    setMeta('property', 'og:description', t('tag.description'));
    setMeta('name', 'theme-color', isDarkMode ? '#000000' : '#ffffff');
  }, [t, isDarkMode]);

  return (
    <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <Box sx={{ height }}>
        <BrowserRouter>
          <Routes>
            <Route path={`/${lang}`} element={<MainPage />} />
            <Route
              path={`/${lang}${PATH_OSS}`}
              element={<OpenSourceLicensesPage />}
            />
            <Route path="*" element={<Navigate to={`/${lang}`} />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
};



export default App;
