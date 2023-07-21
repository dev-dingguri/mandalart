import React from 'react';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import Typography from '@mui/material/Typography';
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
        <Typography variant="h1">{t('global.app')}</Typography>
      </div>
      <div className={styles.right}>
        <Typography variant="body1" className={styles.name}>
          {user && user.displayName}
        </Typography>
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
