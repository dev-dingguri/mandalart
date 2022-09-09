import React from 'react';
import styles from './TopicsViewTypeToggle.module.css';
import Button from '../button/Button';
import { BsGrid3X3 } from 'react-icons/bs';

type TopicsViewTypeToggleProps = {
  isAllView: boolean;
  onToggle: (isAllView: boolean) => void;
};

const TopicsViewTypeToggle = ({
  isAllView,
  onToggle,
}: TopicsViewTypeToggleProps) => {
  return (
    <div className={styles.toggle}>
      <Button
        className={`${styles.allViewButton} ${isAllView && styles.selected}`}
        onClick={() => onToggle(true)}
      >
        <BsGrid3X3 />
      </Button>
      <Button
        className={`${styles.partViewButton} ${!isAllView && styles.selected}`}
        onClick={() => onToggle(false)}
      >
        <div className={styles.crop}>
          <BsGrid3X3 className={styles.partViewIco} />
        </div>
      </Button>
    </div>
  );
};

export default TopicsViewTypeToggle;
