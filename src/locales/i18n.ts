import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import resources from './languages';

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    supportedLngs: Object.keys(resources),
    fallbackLng: {
      default: ['en'],
    },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
    keySeparator: '.',
    resources: resources,
    // 리소스가 인라인이므로 동기 초기화해도 무방 — 비동기(기본값 true)면
    // isInitialized가 setTimeout으로 지연되어 첫 렌더에서 fallback 언어가 잠깐 보임
    initImmediate: false,
  });

export default i18n;
