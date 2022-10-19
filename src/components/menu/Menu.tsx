import React from 'react';
import styles from './Menu.module.css';
import OutsideClickDetector from 'components/outsideClickDetector/OutsideClickDetector';

export type MenuProps = {
  isShown: boolean;
  left: number;
  top: number;
  children?: React.ReactNode;
  onClose: (ev: React.MouseEvent<Element, MouseEvent>) => void;
};

const Menu = ({ isShown, left, top, children, onClose }: MenuProps) => {
  return isShown ? (
    <OutsideClickDetector onOutsideLClick={onClose} onOutsideRClick={onClose}>
      <div className={styles.menu} style={{ left: left, top: top }}>
        {children}
      </div>
    </OutsideClickDetector>
  ) : null;
};

export default Menu;
