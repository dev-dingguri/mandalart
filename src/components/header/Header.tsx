import React, { useState } from 'react';
import SignInModal from '../signInModal/SignInModal';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import styles from './Header.module.css';
import Button from '../button/Button';
import { BsList, BsThreeDots } from 'react-icons/bs';

type HeaderProps = {
  user: User | null; // todo: user 정보를 활용하지 않는다면 isSignIn으로 변경
};

const Header = ({ user }: HeaderProps) => {
  const [isShowSignInModal, setIsShowSignInModal] = useState(false);

  const showSignInModal = () => setIsShowSignInModal(true);
  const hideSignInModal = () => setIsShowSignInModal(false);
  const signIn = (providerid: string) => authService.signIn(providerid);
  const signOut = () => authService.signOut();

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
          {user ? (
            <Button className={styles.signOutButton} onClick={signOut}>
              sign out
            </Button>
          ) : (
            <Button className={styles.signInButton} onClick={showSignInModal}>
              sign in
            </Button>
          )}
          <Button className={styles.etcButton}>
            <BsThreeDots />
          </Button>
        </div>
      </header>
      <SignInModal
        isShow={isShowSignInModal}
        onClose={hideSignInModal}
        onSignIn={signIn}
      />
    </>
  );
};

export default Header;
