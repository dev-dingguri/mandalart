import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import * as resources from './resources';

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    detection: {
      order: ['path', 'navigator'],
      lookupFromPathIndex: 0,
    },
    keySeparator: '.',
    load: 'languageOnly',
    resources,
  });

export default i18n;
