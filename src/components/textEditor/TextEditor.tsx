import { useEffect, useRef } from 'react';
import Dialog from 'components/dialog/Dialog';
import Button from 'components/button/Button';
import styles from './TextEditor.module.css';

type TextEditorProps = {
  isShown: boolean;
  title?: string;
  value: string;
  placeholder?: string;
  onClose: () => void;
  onEnter: (value: string) => void;
};

const TextEditor = ({
  isShown,
  title = 'Mandalart',
  value = '',
  placeholder,
  onClose,
  onEnter,
}: TextEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnter = () => {
    const input = inputRef.current!;
    onEnter(input.value);
  };

  useEffect(() => {
    if (isShown) {
      const input = inputRef.current!;
      input.value = value;
    }
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
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder={placeholder}
      />
      <div className={styles.buttons}>
        <Button className={styles.button} onClick={onClose}>
          Cancel
        </Button>
        <Button className={styles.button} onClick={handleEnter}>
          Save
        </Button>
      </div>
    </Dialog>
  );
};

export default TextEditor;
