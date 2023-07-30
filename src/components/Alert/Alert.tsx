import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import AbsoluteCenterBox from 'components/AbsoluteCenterBox/AbsoluteCenterBox';
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
      <AbsoluteCenterBox className={styles.alert}>
        <Typography variant="h3">{t('global.app')}</Typography>
        {/* todo: 주요 내용, 세부 내용 나눠서 2줄로 출력 검토 */}
        <Typography variant="body1">{message}</Typography>
        <Button className={styles.okButton} onClick={onClose}>
          {t('global.ok')}
        </Button>
      </AbsoluteCenterBox>
    </Modal>
  );
};

export default Alert;
