import React from 'react';
import Dialog from '../dialog/Dialog';
import styles from './SignInModal.module.css';
import { User, ProviderId } from 'firebase/auth';

type SignInModalProps = {
  isShow: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShow, onClose, onSignIn }: SignInModalProps) => {
  const handleSignIn = (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const target = ev.target as HTMLButtonElement;
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
        <button className={styles.close} onClick={onClose}>
          &times;
        </button>
        <button data-providerid={ProviderId.GOOGLE} onClick={handleSignIn}>
          google
        </button>
      </div>
    </Dialog>
  );
};

export default SignInModal;
