import React from 'react';
import Button from '@mui/material/Button';
import Dialog from 'components/Dialog/Dialog';
import styles from './Alert.module.css';
import { useTranslation } from 'react-i18next';

export type AlertProps = {
  isShown: boolean;
  message: string;
  onClose: () => void;
};

const Alert = ({ isShown, message, onClose }: AlertProps) => {
  const { t } = useTranslation();

  return (
    <Dialog className={styles.alert} isShown={isShown} onClose={onClose}>
      <h1 className={styles.title}>{t('global.app')}</h1>
      <p>{message}</p>
      <Button className={styles.okButton} onClick={onClose}>
        {t('global.ok')}
      </Button>
    </Dialog>
  );
};

export default Alert;
