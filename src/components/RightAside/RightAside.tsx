import React from 'react';
import styles from './RightAside.module.css';
import OutsideClickDetector from 'components/OutsideClickDetector/OutsideClickDetector';
import Select from 'components/Select/Select';
import { useNavigate } from 'react-router-dom';
import { Theme, useTheme } from 'contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

type ItemProps = {
  text: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

const Item = ({ text, children, onClick }: ItemProps) => {
  return (
    <li className={styles.item} onClick={onClick}>
      <p className={styles.text}>{text}</p>
      {children}
    </li>
  );
};

type ThemeOption = {
  value: Theme;
  name: string;
};

type RightAsideProps = {
  isShown: boolean;
  onClose: () => void;
};

const RightAside = ({ isShown, onClose }: RightAsideProps) => {
  const { theme, selectTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const themeOptions: ThemeOption[] = [
    { value: 'system', name: t('theme.options.system') },
    { value: 'light', name: t('theme.options.light') },
    { value: 'dark', name: t('theme.options.dark') },
  ];
  const handleSelectTheme = (value: string) => {
    selectTheme(value as Theme);
  };

  const languageOptions = [
    { value: 'en', name: 'English' },
    { value: 'ko', name: '한국어' },
    { value: 'ja', name: '日本語' },
  ];
  const handleSelectlanguage = (value: string) => {
    i18n.changeLanguage(value);
  };

  const navigate = useNavigate();
  const goToOpenSourceLicense = () => {
    navigate('/mandalart/oss');
  };

  return (
    <OutsideClickDetector
      className={`${styles.container} ${isShown && styles.shown}`}
      onOutsideLClick={onClose}
    >
      <div className={`${styles.aside} ${isShown && styles.shown}`}>
        <ul className={styles.list}>
          <Item text={t('theme.label')}>
            <Select
              className={styles.themeSelect}
              options={themeOptions}
              selectedValue={theme}
              onSelect={handleSelectTheme}
            />
          </Item>
          <Item text={t('language.label')}>
            <Select
              className={styles.themeSelect}
              options={languageOptions}
              selectedValue={i18n.language}
              onSelect={handleSelectlanguage}
            />
          </Item>
          <Item text={t('oss.label')} onClick={goToOpenSourceLicense} />
        </ul>
      </div>
    </OutsideClickDetector>
  );
};

export default RightAside;
