import { useEffect, useRef } from 'react';
import Button from 'components/button/Button';
import Dialog from 'components/dialog/Dialog';
import styles from './TopicEditor.module.css';
import { BsFillCaretDownFill } from 'react-icons/bs';

type TopicEditorProps = {
  isShown: boolean;
  text: string;
  onClose: () => void;
  onEnter: (text: string) => void;
};

const TopicEditor = ({ isShown, text, onClose, onEnter }: TopicEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnter = () => {
    const input = inputRef.current!;
    onEnter(input.value);
  };

  useEffect(() => {
    if (isShown) {
      const input = inputRef.current!;
      input.value = text;
    }
  }, [isShown, text]);

  return (
    <Dialog
      isShown={isShown}
      className={styles.dialog}
      onClose={onClose}
      onEnter={handleEnter}
    >
      <h1 className={styles.title}>Topic</h1>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder="Please enter your content."
      />
      <button className={styles.combo}>
        <span>doing </span>
        <BsFillCaretDownFill />
      </button>
      <div className={styles.buttons}>
        <Button className={styles.button} onClick={onClose}>
          cancel
        </Button>
        <Button className={styles.button} onClick={handleEnter}>
          save
        </Button>
      </div>
    </Dialog>
  );
};

export default TopicEditor;
