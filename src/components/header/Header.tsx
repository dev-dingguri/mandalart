import React from 'react';
import styles from './Header.module.css';
import Button from '../button/Button';
import { BsList, BsThreeDots } from 'react-icons/bs';

type HeaderProps = {
  isSignIn: boolean;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  onAsideClick: () => void;
  onEtcClick: () => void;
};

const Header = ({
  isSignIn,
  onSignInClick,
  onSignOutClick,
  onAsideClick,
  onEtcClick,
}: HeaderProps) => {
  const signButton = isSignIn ? (
    <Button className={styles.signButton} onClick={onSignOutClick}>
      sign out
    </Button>
  ) : (
    <Button className={styles.signButton} onClick={onSignInClick}>
      sign in
    </Button>
  );
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Button className={styles.asideButton} onClick={onAsideClick}>
          <BsList />
        </Button>
        <h1 className={styles.title}>Mandalart</h1>
      </div>
      <div className={styles.right}>
        {signButton}
        <Button className={styles.etcButton} onClick={onEtcClick}>
          <BsThreeDots />
        </Button>
      </div>
    </header>
  );
};

export default Header;
