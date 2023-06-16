import React, { useEffect, useRef } from 'react';
import styles from './App.module.css';
import MainPage from 'components/MainPage/MainPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OpenSourceLicenses from 'components/OpenSourceLicenses/OpenSourceLicenses';
import { useTranslation } from 'react-i18next';
import { PATH_MAIN, PATH_OSS } from 'constants/constants';
import { Helmet } from 'react-helmet-async';

const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  /* 모바일 브라우저 주소창 및 네비게이션 영역 제외한 크기 계산 */
  useEffect(() => {
    const handleResize = () => {
      const app = ref.current!;
      const vh = window.innerHeight;
      app.style.setProperty('--vh', `${vh}px`);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={ref} className={styles.app}>
      <Helmet>
        <title>{t('tag.title')}</title>
        <meta name="description" content={`${t('tag.description')}`} />
        <meta property="og:title" content={`${t('tag.title')}`} />
        <meta property="og:description" content={`${t('tag.description')}`} />
      </Helmet>
      <BrowserRouter>
        <Routes>
          <Route
            path={`/${lang}${PATH_MAIN}`} //
            element={<MainPage />}
          />
          <Route
            path={`/${lang}${PATH_OSS}`}
            element={<OpenSourceLicenses />}
          />
          <Route path="*" element={<Navigate to={`/${lang}${PATH_MAIN}`} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
