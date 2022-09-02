import React, { useState } from 'react';
import SignInModal from '../signInModal/SignInModal';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import styles from './Header.module.css';

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
        <h3>Mandalart</h3>
        {user ? (
          <button onClick={signOut}>sign out</button>
        ) : (
          <button onClick={showSignInModal}>sign in</button>
        )}
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
