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
  });

export default i18n;
