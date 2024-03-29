import React from 'react';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export type AlertProps = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
};

const Alert = ({ isOpen, message, onClose }: AlertProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('global.app')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('global.ok')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Alert;
