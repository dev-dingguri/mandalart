import React from 'react';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { BsXLg } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isOpen, onClose, onSignIn }: SignInModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('global.app')}</DialogTitle>
      <IconButton
        sx={{ position: 'absolute', top: '0.5em', right: '0.5em' }}
        size="small"
        onClick={onClose}
      >
        <BsXLg />
      </IconButton>
      <DialogContent sx={{ width: '16em' }}>
        <DialogContentText sx={{ textAlign: 'center' }}>
          {t('signInModal.message')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          startIcon={<SignInLogo src={googleIco} alt="google" />}
          size="large"
          fullWidth
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          {t('signInModal.signIn.google')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SignInLogo = styled('img')({
  width: '1em',
});

export default SignInModal;
