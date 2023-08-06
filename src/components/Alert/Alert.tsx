import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ModalContent from 'components/ModalContent/ModalContent';
import { useTranslation } from 'react-i18next';
import CenterModal from 'components/CenterModal/CenterModal';

export type AlertProps = {
  isShown: boolean;
  message: string;
  onClose: () => void;
};

const Alert = ({ isShown, message, onClose }: AlertProps) => {
  const { t } = useTranslation();

  return (
    <CenterModal open={isShown} onClose={onClose}>
      <ModalContent
        sx={{ display: 'flex', flexDirection: 'column', width: '20em' }}
      >
        <Typography variant="h3">{t('global.app')}</Typography>
        {/* todo: 주요 내용, 세부 내용 나눠서 2줄로 출력 검토 */}
        <Typography variant="body1" marginTop={'0.5em'} marginBottom={'0.5em'}>
          {message}
        </Typography>
        <Button sx={{ alignSelf: 'flex-end' }} onClick={onClose}>
          {t('global.ok')}
        </Button>
      </ModalContent>
    </CenterModal>
  );
};

export default Alert;
