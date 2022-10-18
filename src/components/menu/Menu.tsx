import React from 'react';
import styles from './Menu.module.css';
import ClickOutsideDetector from 'components/clickOutsideDetector/ClickOutsideDetector';

export type MenuProps = {
  isShow: boolean;
  left: number;
  top: number;
  children?: React.ReactNode;
  onClose: (ev: React.MouseEvent<Element, MouseEvent>) => void;
};

const Menu = ({ isShow, left, top, children, onClose }: MenuProps) => {
  return (
    <ClickOutsideDetector
      className={`${styles.container} ${isShow && styles.show}`}
      onClickOutside={onClose}
      onRightClickOutside={onClose}
    >
      <div className={styles.menu} style={{ left: left, top: top }}>
        {children}
      </div>
    </ClickOutsideDetector>
  );
};

export default Menu;
