import { useEffect, useRef } from 'react';
import Dialog from '../dialog/Dialog';
import styles from './TopicInputDialog.module.css';

type TopicInputDialogProps = {
  isShow: boolean;
  text: string;
  onClose: () => void;
  onEnter: (text: string) => void;
};

const TopicInputDialog = ({
  isShow,
  text,
  onClose,
  onEnter,
}: TopicInputDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnter = () => {
    onEnter(inputRef.current?.value ? inputRef.current?.value : '');
  };

  useEffect(() => {
    if (isShow && inputRef.current) {
      inputRef.current.value = text;
    }
  }, [isShow, text]);

  return (
    <Dialog
      isShow={isShow}
      className={styles.dialog}
      onClose={onClose}
      onEnter={handleEnter}
    >
      <div className={styles.dialogContents}>
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

export default TopicInputDialog;
