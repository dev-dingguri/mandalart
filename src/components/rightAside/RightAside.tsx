import React, { useState } from 'react';
import styles from './RightAside.module.css';
import OutsideClickDetector from 'components/outsideClickDetector/OutsideClickDetector';
import Select from 'components/select/Select';

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

type RightAsideProps = {
  isShown: boolean;
  onClose: () => void;
};

const RightAside = ({ isShown, onClose }: RightAsideProps) => {
  const themeOptions = [
    { value: 'system', name: 'Use System setting' },
    { value: 'light', name: 'Light' },
    { value: 'dark', name: 'Dark' },
  ];
  const [selectedTheme, setSelectedTheme] = useState(themeOptions[0].value);
  const handleThemeSelect = (value: string) => {
    setSelectedTheme(value);
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
              selectedValue={selectedTheme}
              onSelect={handleThemeSelect}
            />
          </Item>
          <Item
            text="Open source license"
            onClick={() => console.log('open NOTICE')}
          />
        </ul>
      </div>
    </OutsideClickDetector>
  );
};

export default RightAside;
