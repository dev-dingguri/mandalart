import React from 'react';
import Dialog from 'components/Dialog/Dialog';
import styles from './SignInModal.module.css';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { BsXLg } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

type SignInModalProps = {
  isShown: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShown, onClose, onSignIn }: SignInModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog className={styles.dialog} isShown={isShown} onClose={onClose}>
      <IconButton className={styles.closeButton} onClick={onClose}>
        <BsXLg />
      </IconButton>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('global.app')}</h1>
        <p className={styles.message}>{t('signInModal.message')}</p>
        <Button
          className={styles.signInButton}
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          <img className={styles.logo} src={googleIco} alt="google" />
          <span>{t('signInModal.signIn.google')}</span>
        </Button>
      </div>
    </Dialog>
  );
};

export default SignInModal;
