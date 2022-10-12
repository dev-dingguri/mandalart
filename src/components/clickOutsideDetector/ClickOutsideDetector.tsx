import React from 'react';
import styles from './ClickOutsideDetector.module.css';

type ClickOutsideDetectorProps = {
  className?: string;
  children?: React.ReactNode;
  onClickOutside?: (ev: React.MouseEvent<Element, MouseEvent>) => void;
  onRightClickOutside?: (ev: React.MouseEvent<Element, MouseEvent>) => void;
};

const ClickOutsideDetector = ({
  className,
  children,
  onClickOutside,
  onRightClickOutside,
}: ClickOutsideDetectorProps) => {
  return (
    <div className={`${styles.detector} ${className}`}>
      {children}
      <div
        className={styles.outside}
        onClick={onClickOutside}
        onContextMenu={onRightClickOutside}
      />
    </div>
  );
};

export default ClickOutsideDetector;
