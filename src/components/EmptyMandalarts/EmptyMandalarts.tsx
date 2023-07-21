import React from 'react';
import Button from '@mui/material/Button';
import { BsPlus } from 'react-icons/bs';
import styles from './EmptyMandalarts.module.css';
import { useTranslation } from 'react-i18next';

type EmptyMandalartsProps = {
  onCreateMandalart: () => void;
};

const EmptyMandalarts = ({ onCreateMandalart }: EmptyMandalartsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.notice}>
      <Button className={styles.newButton} onClick={onCreateMandalart}>
        <BsPlus />
        {t('mandalart.new')}
      </Button>
    </div>
  );
};

export default EmptyMandalarts;
