import React from 'react';
import styles from './Header.module.css';
import Button from 'components/Button/Button';
import { BsList, BsThreeDots } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  isSignedIn: boolean;
  onShowSignInUI: () => void;
  onSignOut: () => void;
  onShowLeftAside: () => void;
  onShowRightAside: () => void;
};

const Header = ({
  isSignedIn,
  onShowSignInUI,
  onSignOut,
  onShowLeftAside,
  onShowRightAside,
}: HeaderProps) => {
  const { t } = useTranslation();

  const signButton = isSignedIn ? (
    <Button className={styles.signButton} onClick={onSignOut}>
      {t('auth.signOut')}
    </Button>
  ) : (
    <Button className={styles.signButton} onClick={onShowSignInUI}>
      {t('auth.signIn')}
    </Button>
  );
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Button className={styles.asideButton} onClick={onShowLeftAside}>
          <BsList />
        </Button>
        <h1 className={styles.title}>{t('global.app')}</h1>
      </div>
      <div className={styles.right}>
        {signButton}
        <Button className={styles.etcButton} onClick={onShowRightAside}>
          <BsThreeDots />
        </Button>
      </div>
    </header>
  );
};

export default Header;
