import React, { useEffect, useRef } from 'react';
import styles from './App.module.css';
import Mandalart from 'components/Mandalart/Mandalart';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OpenSourceLicenses from 'components/OpenSourceLicenses/OpenSourceLicenses';

const App = () => {
  const ref = useRef<HTMLDivElement>(null);

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
      <BrowserRouter>
        <Routes>
          <Route path="/mandalart" element={<Mandalart />} />
          <Route
            path="/mandalart/open-source-license"
            element={<OpenSourceLicenses />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
