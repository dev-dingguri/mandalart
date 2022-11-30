import React from 'react';
import Button from 'components/Button/Button';
import Dialog from 'components/Dialog/Dialog';
import styles from './Alert.module.css';

type AlertProps = {
  isShown: boolean;
  message: string;
  onClose: () => void;
};

const Alert = ({ isShown, message, onClose }: AlertProps) => {
  return (
    <Dialog
      className={styles.alert}
      isShown={isShown}
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