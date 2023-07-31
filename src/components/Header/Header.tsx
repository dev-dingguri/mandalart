import React, { useMemo } from 'react';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
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

  const SignButton = useMemo(() => user ? (
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
  ), [onShowSignInUI, onSignOut, t, user]);

  return <AppBar position='static' elevation={0} sx={{ backgroundColor: 'lightgray' }}>
    <Toolbar>
      <IconButton
        className={styles.leftDrawerButton}
        size="small"
        onClick={onShowLeftDrawer}
      >
        <BsList />
      </IconButton>
      <Typography variant="h1" sx={{ flexGrow: 1 }}>{t('global.app')}</Typography>
      <Typography variant="body1" className={styles.name}>
        {user && user.displayName}
      </Typography>
      {SignButton}
      <IconButton
        className={styles.rightDrawerButton}
        size="small"
        onClick={onShowRightDrawer}
      >
        <BsThreeDots />
      </IconButton>
    </Toolbar>
  </AppBar>;
};

export default Header;
