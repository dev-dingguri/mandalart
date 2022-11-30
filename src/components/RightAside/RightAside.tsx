import React from 'react';
import styles from './RightAside.module.css';
import OutsideClickDetector from 'components/OutsideClickDetector/OutsideClickDetector';
import Select from 'components/Select/Select';
import { useNavigate } from 'react-router-dom';
import { Theme, useTheme } from 'contexts/ThemeContext';

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

  const themeOptions: ThemeOption[] = [
    { value: 'system', name: 'Use System setting' },
    { value: 'light', name: 'Light' },
    { value: 'dark', name: 'Dark' },
  ];
  const handleThemeSelect = (value: string) => {
    selectTheme(value as Theme);
  };

  const navigate = useNavigate();
  const goToOpenSourceLicense = () => {
    navigate('/mandalart/open-source-license');
  };

  return (
    <OutsideClickDetector
      className={`${styles.container} ${isShown && styles.shown}`}
      onOutsideLClick={onClose}
    >
      <div className={`${styles.aside} ${isShown && styles.shown}`}>
        <ul className={styles.list}>
          <Item text="Theme">
            <Select
              className={styles.themeSelect}
              options={themeOptions}
              selectedValue={theme}
              onSelect={handleThemeSelect}
            />
          </Item>
          <Item text="Open source license" onClick={goToOpenSourceLicense} />
        </ul>
      </div>
    </OutsideClickDetector>
  );
};

export default RightAside;
