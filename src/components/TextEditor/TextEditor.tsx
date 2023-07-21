import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CenterBox from 'components/CenterBox/CenterBox';
import styles from './TextEditor.module.css';
import { useTranslation } from 'react-i18next';
import i18n from 'locales/i18n';
import Typography from '@mui/material/Typography';

type TextEditorProps = {
  isShown: boolean;
  title?: string;
  initialText: string;
  placeholder?: string;
  maxText?: number;
  onClose: () => void;
  onConfirm: (text: string) => void;
};

const TextEditor = ({
  isShown,
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

  const handleConfirm = () => {
    if (isLimitReached) return;
    onConfirm(text);
    onClose();
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value);
  };

  useEffect(() => {
    setText(initialText);
  }, [isShown, initialText]);

  return (
    <Modal open={isShown} onClose={onClose}>
      <CenterBox className={styles.dialog}>
        <form onSubmit={handleConfirm}>
          <Typography variant="h3">{title}</Typography>
          <input
            autoFocus
            className={`${styles.input} ${isLimitReached && styles.warning}`}
            type="text"
            placeholder={placeholder}
            onChange={handleInputChange}
            value={text}
          />
          {shouldValidations && (
            <div
              className={`${styles.validations} ${
                isLimitReached && styles.warning
              }`}
            >
              <Typography variant="body2">
                {isLimitReached && t('textEditor.maxTextReached')}
              </Typography>
              <Typography variant="body2">{`${text.length}/${maxText}`}</Typography>
            </div>
          )}
          <div className={styles.buttons}>
            <Button className={styles.button} onClick={onClose}>
              {t('global.cancel')}
            </Button>
            <Button
              type="submit"
              className={styles.button}
              disabled={isLimitReached}
            >
              {t('global.save')}
            </Button>
          </div>
        </form>
      </CenterBox>
    </Modal>
  );
};

export default TextEditor;
