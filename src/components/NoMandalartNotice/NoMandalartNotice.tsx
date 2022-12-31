import React from 'react';
import Button from 'components/Button/Button';
import { BsPlus } from 'react-icons/bs';
import styles from './NoMandalartNotice.module.css';
import { useTranslation } from 'react-i18next';

type NoMandalartNoticeProps = {
  onCreateMandalart: () => void;
};

const NoMandalartNotice = ({ onCreateMandalart }: NoMandalartNoticeProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.notice}>
      <Button className={styles.newButton} onClick={onCreateMandalart}>
        <BsPlus />
        <p>{t('mandalart.new')}</p>
      </Button>
    </div>
  );
};

export default NoMandalartNotice;
