import React from 'react';
import Dialog from '../dialog/Dialog';
import styles from './SignInModal.module.css';
import { ProviderId } from 'firebase/auth';
import googleIco from '../../assets/images/google.svg';
import Button from '../button/Button';
import { BsXLg } from 'react-icons/bs';

type SignInModalProps = {
  isShow: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShow, onClose, onSignIn }: SignInModalProps) => {
  const handleSignIn = (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const target = ev.currentTarget as HTMLButtonElement;
    const providerid = target.dataset.providerid;
    if (providerid) {
      onSignIn(providerid);
    } else {
      throw new Error('no provider id');
    }
  };

  return (
    <Dialog className={styles.dialog} isShow={isShow} onClose={onClose}>
      <div className={styles.container}>
        <Button className={styles.closeButton} onClick={onClose}>
          <BsXLg />
        </Button>
        <div className={styles.contents}>
          <h1 className={styles.title}>Mandalart</h1>
          <p className={styles.message}>
            With sign in, you can now access your Mandalart, from wherever you
            are.
          </p>
          <Button
            className={styles.signInButton}
            data-providerid={ProviderId.GOOGLE}
            onClick={handleSignIn}
          >
            <img className={styles.logo} src={googleIco} alt="google" />
            <span>Sign in with Google</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default SignInModal;
