import React, { useCallback, useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

type DialogProps = {
  isShown: boolean;
  isModal?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onEnter?: (ev: KeyboardEvent) => void;
};

const Dialog = ({
  isShown,
  isModal = true,
  className,
  children,
  onClose,
  onEnter,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  const show = useCallback(() => {
    const modal = ref.current!;
    if (!modal.open) {
      if (isModal) {
        modal.showModal();
      } else {
        modal.show();
      }
    }
  }, [isModal]);

  const hide = useCallback(() => {
    ref.current?.close();
  }, []);

  useEffect(() => {
    if (isShown) {
      show();
    } else {
      hide();
    }
  }, [isShown, show, hide]);

  const handleKey = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose();
      } else if (ev.key === 'Enter') {
        onEnter && onEnter(ev);
      }
    },
    [onClose, onEnter]
  );

  useEffect(() => {
    if (isShown) {
      window.addEventListener('keydown', handleKey);
      return () => {
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [isShown, handleKey]);

  return isShown ? (
    <dialog className={`${styles.dialog} ${className}`} ref={ref}>
      {children}
    </dialog>
  ) : null;
};

export default Dialog;
