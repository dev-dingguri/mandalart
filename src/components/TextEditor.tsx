import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import i18n from 'locales/i18n';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText, {
  DialogContentTextProps,
} from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type TextEditorProps = {
  isOpen: boolean;
  title?: string;
  initialText: string;
  placeholder?: string;
  textLimit?: number;
  onClose: () => void;
  onConfirm: (text: string) => void;
};

const TextEditor = ({
  isOpen,
  title = `${i18n.t('global.app')}`,
  initialText = '',
  placeholder,
  textLimit,
  onClose,
  onConfirm,
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const hasLimit = textLimit !== undefined;
  const isLimitReached = hasLimit && textLimit < text.length;
  const { t } = useTranslation();

  const handleConfirm = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (isLimitReached) return;
    onConfirm(text);
    onClose();
  };

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value);
  };

  useEffect(() => {
    if (isOpen) setText(initialText);
  }, [isOpen, initialText]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      disableRestoreFocus // https://github.com/mui/material-ui/issues/33004
    >
      <form onSubmit={handleConfirm}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            id={'mandalart-topic'}
            autoFocus
            autoComplete={'off'}
            type="text"
            placeholder={placeholder}
            onChange={handleInputChange}
            value={text}
            error={isLimitReached}
            sx={{ width: '16em' }}
          />
          {hasLimit && (
            <Stack direction="row">
              <DialogContentErrorableText
                error={isLimitReached}
                sx={{ flexGrow: 1 }}
              >
                {isLimitReached && t('textEditor.maxTextReached')}
              </DialogContentErrorableText>
              <DialogContentErrorableText
                error={isLimitReached}
              >{`${text.length}/${textLimit}`}</DialogContentErrorableText>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('global.cancel')}</Button>
          <Button type="submit" disabled={isLimitReached}>
            {t('global.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const DialogContentErrorableText = styled(DialogContentText, {
  shouldForwardProp: (prop) => prop !== 'error',
})<DialogContentTextProps & { error?: boolean }>(
  ({ theme, error }) =>
    error && {
      color: theme.palette.error.main,
    }
);

export default TextEditor;
