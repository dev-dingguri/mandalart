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
  onShowLeftDrawer: () => void;
  onShowRightDrawer: () => void;
};

const Header = ({
  user,
  onShowSignInUI,
  onSignOut,
  onShowLeftDrawer,
  onShowRightDrawer,
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
          onClick={onShowLeftDrawer}
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
          onClick={onShowRightDrawer}
        >
          <BsThreeDots />
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
