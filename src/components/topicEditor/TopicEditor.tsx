import { useEffect, useRef } from 'react';
import Dialog from '../dialog/Dialog';
import styles from './TopicEditor.module.css';

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
        <p>내용을 입력하세요.</p>
        <input ref={inputRef} type="text" />
        <div className={styles.buttons}>
          <button className={styles.button} onClick={handleEnter}>
            확인
          </button>
          <button className={styles.button} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default TopicEditor;
