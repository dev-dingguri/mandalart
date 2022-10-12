import React, { useCallback, useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

type DialogProps = {
  isShow: boolean;
  isModal?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onEnter?: (ev: KeyboardEvent) => void;
};

const Dialog = ({
  isShow,
  isModal = true,
  className,
  children,
  onClose,
  onEnter,
}: DialogProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const show = useCallback(() => {
    const modal = modalRef.current!;
    if (!modal.open) {
      if (isModal) {
        modal.showModal();
      } else {
        modal.show();
      }
    }
  }, [isModal]);

  const hide = useCallback(() => {
    const modal = modalRef.current!;
    if (modal.open) {
      modal.close();
    }
  }, []);

  useEffect(() => {
    if (isShow) {
      show();
    } else {
      hide();
    }
  }, [isShow, show, hide]);

  const handleKey = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose();
      } else if (ev.key === 'Enter' && onEnter) {
        onEnter(ev);
      }
    },
    [onClose, onEnter]
  );

  useEffect(() => {
    if (isShow) {
      window.addEventListener('keydown', handleKey);
      return () => {
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [isShow, handleKey]);

  return (
    <dialog className={`${styles.dialog} ${className}`} ref={modalRef}>
      {children}
    </dialog>
  );
};

export default Dialog;
