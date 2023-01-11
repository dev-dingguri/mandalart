import React from 'react';
import styles from './MandalartViewType.module.css';
import Button from 'components/Button/Button';
import { BsGrid3X3 } from 'react-icons/bs';

type MandalartViewTypeProps = {
  isAllView: boolean;
  onChange: (isAllView: boolean) => void;
};

const MandalartViewType = ({ isAllView, onChange }: MandalartViewTypeProps) => {
  return (
    <div className={styles.toggle}>
      <Button
        className={`${styles.allViewButton} ${isAllView && styles.selected}`}
        onClick={() => onChange(true)}
      >
        <BsGrid3X3 />
      </Button>
      <Button
        className={`${styles.partViewButton} ${!isAllView && styles.selected}`}
        onClick={() => onChange(false)}
      >
        <div className={styles.crop}>
          <BsGrid3X3 className={styles.partViewIco} />
        </div>
      </Button>
    </div>
  );
};

export default MandalartViewType;
