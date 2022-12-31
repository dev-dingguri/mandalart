import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import styles from './Spinner.module.css';

type SpinnerProps = {
  className?: string;
};

const Spinner = ({ className }: SpinnerProps) => {
  return <CgSpinner className={`${styles.spinner} ${className}`} />;
};

export default Spinner;
