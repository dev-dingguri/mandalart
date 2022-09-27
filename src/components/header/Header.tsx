import React from 'react';
import styles from './Header.module.css';
import Button from '../button/Button';
import { BsList, BsThreeDots } from 'react-icons/bs';

type HeaderProps = {
  isSignIn: boolean;
  onSignInClick: () => void;
  onSignOutClick: () => void;
};

const Header = ({ isSignIn, onSignInClick, onSignOutClick }: HeaderProps) => {
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
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <Button className={styles.listButton}>
            <BsList />
          </Button>
          <h1 className={styles.title}>Mandalart</h1>
        </div>
        <div className={styles.right}>
          {signButton}
          <Button className={styles.etcButton}>
            <BsThreeDots />
          </Button>
        </div>
      </header>
    </>
  );
};

export default Header;
