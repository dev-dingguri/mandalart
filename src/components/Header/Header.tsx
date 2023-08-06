import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import AppBar, { AppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { BsList, BsThreeDots } from 'react-icons/bs';

type HeaderProps = AppBarProps & {
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
  ...rest
}: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <AppBar position="static" elevation={0} {...rest}>
      <Toolbar>
        <IconButton onClick={onShowLeftDrawer} sx={{ marginRight: '0.25em' }}>
          <BsList />
        </IconButton>
        <Typography variant="h1" sx={{ flexGrow: 1 }}>
          {t('global.app')}
        </Typography>
        <Typography variant="body1" sx={{ margin: '0.5em' }}>
          {user && user.displayName}
        </Typography>
        {user ? (
          <Button sx={{ height: '2.63em' }} onClick={onSignOut}>
            {t('auth.signOut')}
          </Button>
        ) : (
          <Button sx={{ height: '2.63em' }} onClick={onShowSignInUI}>
            {t('auth.signIn')}
          </Button>
        )}
        <IconButton onClick={onShowRightDrawer} sx={{ marginLeft: '0.25em' }}>
          <BsThreeDots />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
