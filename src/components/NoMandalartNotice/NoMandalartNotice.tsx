import React from 'react';
import Button from 'components/Button/Button';
import { BsPlus } from 'react-icons/bs';
import styles from './NoMandalartNotice.module.css';

type NoMandalartNoticeProps = {
  onNewMandalart: () => void;
};

const NoMandalartNotice = ({ onNewMandalart }: NoMandalartNoticeProps) => {
  return (
    <div className={styles.notice}>
      <p className={styles.message}>No Mandalart</p>
      <Button className={styles.newButton} onClick={onNewMandalart}>
        <BsPlus />
        <p>New</p>
      </Button>
    </div>
  );
};

export default NoMandalartNotice;
