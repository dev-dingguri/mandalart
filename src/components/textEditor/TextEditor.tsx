import { useEffect, useRef } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import styles from './TextEditor.module.css';

type TextEditorProps = {
  isShow: boolean;
  title?: string;
  value: string;
  placeholder?: string;
  onClose: () => void;
  onEnter: (value: string) => void;
};

const TextEditor = ({
  isShow,
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
    if (isShow) {
      const input = inputRef.current!;
      input.value = value;
    }
  }, [isShow, value]);

  return (
    <Dialog
      isShow={isShow}
      className={styles.dialog}
      onClose={onClose}
      onEnter={handleEnter}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder={placeholder}
        />
        <div className={styles.buttons}>
          <Button className={styles.button} onClick={onClose}>
            cancel
          </Button>
          <Button className={styles.button} onClick={handleEnter}>
            save
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default TextEditor;