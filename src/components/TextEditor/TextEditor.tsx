import { useState, useEffect } from 'react';
import Dialog from 'components/Dialog/Dialog';
import Button from '@mui/material/Button';
import styles from './TextEditor.module.css';
import { useTranslation } from 'react-i18next';
import i18n from 'locales/i18n';

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
    <Dialog
      isShown={isShown}
      className={styles.dialog}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <h1 className={styles.title}>{title}</h1>
      <input
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
          <p>{isLimitReached && t('textEditor.maxTextReached')}</p>
          <p>{`${text.length}/${maxText}`}</p>
        </div>
      )}
      <div className={styles.buttons}>
        <Button className={styles.button} onClick={onClose}>
          {t('global.cancel')}
        </Button>
        <Button
          className={styles.button}
          onClick={handleConfirm}
          disabled={isLimitReached}
        >
          {t('global.save')}
        </Button>
      </div>
    </Dialog>
  );
};

export default TextEditor;
