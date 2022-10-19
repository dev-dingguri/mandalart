import React from 'react';
import styles from './OutsideClickDetector.module.css';

type OutsideClickDetectorProps = {
  className?: string;
  children?: React.ReactNode;
  onOutsideLClick?: (ev: React.MouseEvent<Element, MouseEvent>) => void;
  onOutsideRClick?: (ev: React.MouseEvent<Element, MouseEvent>) => void;
};

const OutsideClickDetector = ({
  className,
  children,
  onOutsideLClick,
  onOutsideRClick,
}: OutsideClickDetectorProps) => {
  return (
    <div className={`${styles.detector} ${className}`}>
      {children}
      <div
        className={styles.outside}
        onClick={onOutsideLClick}
        onContextMenu={onOutsideRClick}
      />
    </div>
  );
};

export default OutsideClickDetector;
