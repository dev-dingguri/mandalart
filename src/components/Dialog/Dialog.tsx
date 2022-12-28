import { useTheme } from 'contexts/ThemeContext';
import React, { useCallback, useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

type DialogProps = {
  isShown: boolean;
  isModal?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
};

const Dialog = ({
  isShown,
  isModal = true,
  className,
  children,
  onClose,
  onConfirm,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const { isDisplayLightTheme } = useTheme();

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

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  useEffect(() => {
    if (isShown) {
      show();
    } else {
      close();
    }
  }, [isShown, show, close]);

  const handleKey = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose();
      } else if (ev.key === 'Enter') {
        onConfirm && onConfirm();
        onClose();
      }
    },
    [onClose, onConfirm]
  );

  useEffect(() => {
    if (isShown) {
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [isShown, handleKey]);

  const themeClassName = isDisplayLightTheme() && 'light';

  return isShown ? (
    <dialog
      className={`${styles.dialog} ${themeClassName} ${className} `}
      ref={ref}
    >
      {children}
    </dialog>
  ) : null;
};

export default Dialog;
