import { useEffect, useRef } from 'react';
import Button from '../button/Button';
import Dialog from '../dialog/Dialog';
import styles from './TopicEditor.module.css';
import { BsFillCaretDownFill } from 'react-icons/bs';

type TopicEditorProps = {
  isShow: boolean;
  text: string;
  onClose: () => void;
  onEnter: (text: string) => void;
};

const TopicEditor = ({ isShow, text, onClose, onEnter }: TopicEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnter = () => {
    const input = inputRef.current!;
    onEnter(input.value);
  };

  useEffect(() => {
    if (isShow) {
      const input = inputRef.current!;
      input.value = text;
    }
  }, [isShow, text]);

  return (
    <Dialog
      isShow={isShow}
      className={styles.dialog}
      onClose={onClose}
      onEnter={handleEnter}
    >
      <div className={styles.container}>
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
      </div>
    </Dialog>
  );
};

export default TopicEditor;
