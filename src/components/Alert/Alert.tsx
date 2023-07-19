import React from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import CenterBox from 'components/CenterBox/CenterBox';
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
    <Modal open={isShown} onClose={onClose}>
      <CenterBox className={styles.alert}>
        <h1 className={styles.title}>{t('global.app')}</h1>
        <p>{message}</p>
        <Button className={styles.okButton} onClick={onClose}>
          {t('global.ok')}
        </Button>
      </CenterBox>
    </Modal>
  );
};

export default Alert;
