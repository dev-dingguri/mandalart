import React, { useState } from 'react';
import MainPage from 'components/MainPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OpenSourceLicensesPage from 'components/OpenSourceLicensesPage';
import { useTranslation } from 'react-i18next';
import { PATH_MAIN, PATH_OSS } from 'constants/constants';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { throttle } from 'lodash';
import theme from 'theme';
import { useEventListener, useTernaryDarkMode } from 'usehooks-ts';

const App = () => {
  const [height, setHeight] = useState(window.innerHeight);
  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  /* 모바일 브라우저 주소창 및 네비게이션 영역 제외한 높이로 변경 */
  useEventListener(
    'resize',
    throttle(() => setHeight(window.innerHeight), 33)
  );

  const { isDarkMode } = useTernaryDarkMode();

  return (
    <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <Box sx={{ height }}>
        <Helmet>
          <title>{t('tag.title')}</title>
          <meta name="description" content={`${t('tag.description')}`} />
          <meta property="og:title" content={`${t('tag.title')}`} />
          <meta property="og:description" content={`${t('tag.description')}`} />
          {isDarkMode && <meta name="theme-color" content="#000000" />}
        </Helmet>
        <BrowserRouter>
          <Routes>
            <Route
              path={`/${lang}${PATH_MAIN}`} //
              element={<MainPage />}
            />
            <Route
              path={`/${lang}${PATH_OSS}`}
              element={<OpenSourceLicensesPage />}
            />
            <Route
              path="*"
              element={<Navigate to={`/${lang}${PATH_MAIN}`} />}
            />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
};

export default App;
