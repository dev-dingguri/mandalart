import React from 'react';
import Button from '../button/Button';
import { BsPlus } from 'react-icons/bs';
import styles from './NoContentNotice.module.css';

type NoContentNoticeProps = {
  onNewMandalart: () => void;
};

const NoContentNotice = ({ onNewMandalart }: NoContentNoticeProps) => {
  return (
    <div className={styles.notice}>
      <p className={styles.message}>No Mandalart</p>
      <Button className={styles.newButton} onClick={onNewMandalart}>
        <BsPlus />
        <p>new</p>
      </Button>
    </div>
  );
};

export default NoContentNotice;
