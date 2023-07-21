import React from 'react';
import styles from './SignInModal.module.css';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CenterBox from 'components/CenterBox/CenterBox';
import IconButton from '@mui/material/IconButton';
import { BsXLg } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

type SignInModalProps = {
  isShown: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShown, onClose, onSignIn }: SignInModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal open={isShown} onClose={onClose}>
      <CenterBox className={styles.dialog}>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <BsXLg />
        </IconButton>
        <div className={styles.container}>
          <Typography variant="h3">{t('global.app')}</Typography>
          <Typography variant="body1" className={styles.message}>
            {t('signInModal.message')}
          </Typography>
          <Button
            className={styles.signInButton}
            onClick={() => onSignIn(ProviderId.GOOGLE)}
          >
            <img className={styles.logo} src={googleIco} alt="google" />
            <span>{t('signInModal.signIn.google')}</span>
          </Button>
        </div>
      </CenterBox>
    </Modal>
  );
};

export default SignInModal;
