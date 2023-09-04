import React from 'react';
import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ModalContent from 'components/ModalContent/ModalContent';
import { BsXLg } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import CenterModal from 'components/CenterModal/CenterModal';
import { styled } from '@mui/material/styles';

type SignInModalProps = {
  isShown: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isShown, onClose, onSignIn }: SignInModalProps) => {
  const { t } = useTranslation();

  return (
    <CenterModal open={isShown} onClose={onClose}>
      <ModalContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '18em',
          position: 'relative',
        }}
      >
        <IconButton
          sx={{ position: 'absolute', top: '0.5em', right: '0.5em' }}
          size="small"
          onClick={onClose}
        >
          <BsXLg />
        </IconButton>
        <Typography variant="h3">{t('global.app')}</Typography>
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            marginTop: '0.5em',
            marginBottom: '1em',
          }}
        >
          {t('signInModal.message')}
        </Typography>
        <Button
          startIcon={<SignInLogo src={googleIco} alt="google" />}
          size="large"
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          {t('signInModal.signIn.google')}
        </Button>
      </ModalContent>
    </CenterModal>
  );
};

const SignInLogo = styled('img')({
  width: '1em',
});

export default SignInModal;
