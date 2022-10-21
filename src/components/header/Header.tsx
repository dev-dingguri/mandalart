import React from 'react';
import styles from './Header.module.css';
import Button from 'components/button/Button';
import { BsList, BsThreeDots } from 'react-icons/bs';

type HeaderProps = {
  isSignedIn: boolean;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  onListClick: () => void;
  onEtcClick: () => void;
};

const Header = ({
  isSignedIn,
  onSignInClick,
  onSignOutClick,
  onListClick,
  onEtcClick,
}: HeaderProps) => {
  const signButton = isSignedIn ? (
    <Button className={styles.signButton} onClick={onSignOutClick}>
      Sign out
    </Button>
  ) : (
    <Button className={styles.signButton} onClick={onSignInClick}>
      Sign in
    </Button>
  );
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Button className={styles.asideButton} onClick={onListClick}>
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
