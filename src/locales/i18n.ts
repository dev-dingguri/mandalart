import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as resources from './resources';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    detection: { order: ['localStorage', 'navigator'] },
    keySeparator: '.',
    resources,
  });

i18n.changeLanguage();

export default i18n;
