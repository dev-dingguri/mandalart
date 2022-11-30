import React from 'react';
import Dialog from 'components/Dialog/Dialog';
import styles from './SignInModal.module.css';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Button from 'components/Button/Button';
import { BsXLg } from 'react-icons/bs';

type SignInModalProps = {
  isShown: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShown, onClose, onSignIn }: SignInModalProps) => {
  return (
    <Dialog className={styles.dialog} isShown={isShown} onClose={onClose}>
      <Button className={styles.closeButton} onClick={onClose}>
        <BsXLg />
      </Button>
      <div className={styles.container}>
        <h1 className={styles.title}>Mandalart</h1>
        <p className={styles.message}>
          With sign in, you can now access your Mandalart, from wherever you
          are.
        </p>
        <Button
          className={styles.signInButton}
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          <img className={styles.logo} src={googleIco} alt="google" />
          <span>Sign in with Google</span>
        </Button>
      </div>
    </Dialog>
  );
};

export default SignInModal;
