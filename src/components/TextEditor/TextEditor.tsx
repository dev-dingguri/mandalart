import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import i18n from 'locales/i18n';
import Typography, { TypographyProps } from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import ModalContent from 'components/ModalContent/ModalContent';
import CenterModal from 'components/CenterModal/CenterModal';
import { styled } from '@mui/material/styles';

type TextEditorProps = {
  isOpen: boolean;
  title?: string;
  initialText: string;
  placeholder?: string;
  maxText?: number;
  onClose: () => void;
  onConfirm: (text: string) => void;
};

const TextEditor = ({
  isOpen,
  title = `${i18n.t('global.app')}`,
  initialText = '',
  placeholder,
  maxText,
  onClose,
  onConfirm,
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const shouldValidations = maxText !== undefined;
  const isLimitReached = shouldValidations && maxText < text.length;
  const { t } = useTranslation();

  const handleConfirm = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (isLimitReached) return;
    onConfirm(text);
    onClose();
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value);
  };

  useEffect(() => {
    setText(initialText);
  }, [isOpen, initialText]);

  return (
    <CenterModal open={isOpen} onClose={onClose}>
      <ModalContent sx={{ width: '20em' }}>
        <form onSubmit={handleConfirm}>
          <Typography variant="h3">{title}</Typography>
          <TextField
            id={'mandalart-topic'}
            autoFocus
            autoComplete={'off'}
            type="text"
            placeholder={placeholder}
            onChange={handleInputChange}
            value={text}
            error={isLimitReached}
            sx={{ mt: 1, mb: 1, width: '100%' }}
          />
          {shouldValidations && (
            <Stack direction="row">
              <ErrorableTypography
                variant="body2"
                error={isLimitReached}
                sx={{ flexGrow: 1 }}
              >
                {isLimitReached && t('textEditor.maxTextReached')}
              </ErrorableTypography>
              <ErrorableTypography
                variant="body2"
                error={isLimitReached}
              >{`${text.length}/${maxText}`}</ErrorableTypography>
            </Stack>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button sx={{ mr: '0.5em' }} onClick={onClose}>
              {t('global.cancel')}
            </Button>
            <Button type="submit" disabled={isLimitReached}>
              {t('global.save')}
            </Button>
          </Box>
        </form>
      </ModalContent>
    </CenterModal>
  );
};

const ErrorableTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'error',
})<TypographyProps & { error?: boolean }>(
  ({ theme, error }) =>
    error && {
      color: theme.palette.error.main,
    }
);

export default TextEditor;
