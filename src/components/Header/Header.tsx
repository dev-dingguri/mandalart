import React from 'react';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { BsList, BsThreeDots } from 'react-icons/bs';

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
    <Button
      className={styles.signButton}
      variant="outlined"
      onClick={onSignOut}
    >
      {t('auth.signOut')}
    </Button>
  ) : (
    <Button
      className={styles.signButton}
      variant="outlined"
      onClick={onShowSignInUI}
    >
      {t('auth.signIn')}
    </Button>
  );
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <IconButton
          className={styles.leftDrawerButton}
          size="small"
          onClick={onShowLeftAside}
        >
          <BsList />
        </IconButton>
        <h1 className={styles.title}>{t('global.app')}</h1>
      </div>
      <div className={styles.right}>
        <p className={styles.name}>{user && user.displayName}</p>
        {signButton}
        <IconButton
          className={styles.rightDrawerButton}
          size="small"
          onClick={onShowRightAside}
        >
          <BsThreeDots />
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
