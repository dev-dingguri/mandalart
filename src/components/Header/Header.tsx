import React from 'react';
import styles from './Header.module.css';
import Button from 'components/Button/Button';
import { BsList, BsThreeDots, BsPersonCircle } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';

type HeaderProps = {
  user: User | null;
  onShowSignInUI: () => void;
  onSignOut: () => void;
  onShowLeftAside: () => void;
  onShowRightAside: () => void;
};

const Header = ({
  user,
  onShowSignInUI,
  onSignOut,
  onShowLeftAside,
  onShowRightAside,
}: HeaderProps) => {
  const { t } = useTranslation();

  const signButton = user ? (
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
        <p className={styles.name}>{user && user.displayName}</p>
        {signButton}
        <Button className={styles.etcButton} onClick={onShowRightAside}>
          <BsThreeDots />
        </Button>
      </div>
    </header>
  );
};

export default Header;
