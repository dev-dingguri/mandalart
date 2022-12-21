import { useState, useEffect } from 'react';
import Dialog from 'components/Dialog/Dialog';
import Button from 'components/Button/Button';
import styles from './TextEditor.module.css';

type TextEditorProps = {
  isShown: boolean;
  title?: string;
  value: string;
  placeholder?: string;
  maxText?: number;
  onClose: () => void;
  onEnter: (value: string) => void;
};

const TextEditor = ({
  isShown,
  title = 'Mandalart',
  value = '',
  placeholder,
  maxText,
  onClose,
  onEnter,
}: TextEditorProps) => {
  const [text, setText] = useState(value);
  const shouldValidations = maxText !== undefined;
  const isLimitReached = shouldValidations && maxText < text.length;

  const handleEnter = () => {
    if (isLimitReached) return;
    onEnter(text);
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value);
  };

  useEffect(() => {
    setText(value);
  }, [isShown, value]);

  return (
    <Dialog
      isShown={isShown}
      className={styles.dialog}
      onClose={onClose}
      onEnter={handleEnter}
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
          onClick={handleEnter}
          disabled={isLimitReached}
        >
          Save
        </Button>
      </div>
    </Dialog>
  );
};

export default TextEditor;
