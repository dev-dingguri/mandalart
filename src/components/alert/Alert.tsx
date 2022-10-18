import React from 'react';
import Button from 'components/button/Button';
import Dialog from 'components/dialog/Dialog';
import styles from './Alert.module.css';

type AlertProps = {
  isShow: boolean;
  message: string;
  onClose: () => void;
};

const Alert = ({ isShow, message, onClose }: AlertProps) => {
  return (
    <Dialog
      className={styles.alert}
      isShow={isShow}
      onClose={onClose}
      onEnter={onClose}
    >
      <h1 className={styles.title}>Mandalart</h1>
      <p>{message}</p>
      <Button className={styles.okButton} onClick={onClose}>
        OK
      </Button>
    </Dialog>
  );
};

export default Alert;
