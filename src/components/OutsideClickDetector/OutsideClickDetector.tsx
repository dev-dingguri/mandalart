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
  const stopPropagation = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.stopPropagation();
  };

  return (
    <div
      className={`${styles.detector} ${className}`}
      onClick={onOutsideLClick}
      onContextMenu={onOutsideRClick}
    >
      <div onClick={stopPropagation} onContextMenu={stopPropagation}>
        {children}
      </div>
    </div>
  );
};

export default OutsideClickDetector;
