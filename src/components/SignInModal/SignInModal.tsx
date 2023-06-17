import React from 'react';
import Dialog from 'components/Dialog/Dialog';
import styles from './SignInModal.module.css';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Button from 'components/Button/Button';
import { BsXLg } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import useAuthWrapper from 'hooks/useAuthWrapper';

type SignInModalProps = {
  isShown: boolean;
  onClose: () => void;
};

const SignInModal = ({ isShown, onClose }: SignInModalProps) => {
  const { signIn } = useAuthWrapper();
  const { t } = useTranslation();

  return (
    <Dialog className={styles.dialog} isShown={isShown} onClose={onClose}>
      <Button className={styles.closeButton} onClick={onClose}>
        <BsXLg />
      </Button>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('global.app')}</h1>
        <p className={styles.message}>{t('signInModal.message')}</p>
        <Button
          className={styles.signInButton}
          onClick={() => signIn(ProviderId.GOOGLE)}
        >
          <img className={styles.logo} src={googleIco} alt="google" />
          <span>{t('signInModal.signIn.google')}</span>
        </Button>
      </div>
    </Dialog>
  );
};

export default SignInModal;
