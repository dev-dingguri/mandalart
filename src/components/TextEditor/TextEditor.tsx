import { useState, useEffect } from 'react';
import Dialog from 'components/Dialog/Dialog';
import Button from 'components/Button/Button';
import styles from './TextEditor.module.css';

type TextEditorProps = {
  isShown: boolean;
  title?: string;
  initialText: string;
  placeholder?: string;
  maxText?: number;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

const TextEditor = ({
  isShown,
  title = 'Mandalart',
  initialText = '',
  placeholder,
  maxText,
  onClose,
  onSubmit,
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const shouldValidations = maxText !== undefined;
  const isLimitReached = shouldValidations && maxText < text.length;

  const handleSubmit = () => {
    if (isLimitReached) return;
    onSubmit(text);
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
      onSubmit={handleSubmit}
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
          <p>{isLimitReached && 'Character limit reached'}</p>
          <p>{`${text.length}/${maxText}`}</p>
        </div>
      )}
      <div className={styles.buttons}>
        <Button className={styles.button} onClick={onClose}>
          Cancel
        </Button>
        <Button
          className={styles.button}
          onClick={handleSubmit}
          disabled={isLimitReached}
        >
          Save
        </Button>
      </div>
    </Dialog>
  );
};

export default TextEditor;
