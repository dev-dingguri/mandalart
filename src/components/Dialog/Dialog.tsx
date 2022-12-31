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
    const dialog = ref.current!;
    if (!dialog.open) {
      if (isModal) {
        dialog.showModal();
        // mobile 환경에서 모달과 함께 키보드가 노출되었을 때
        // 키보드 바로 위에 다이얼로그가 위치하게 처리
        // 개선 필요. MutationObserver를 사용한 방법 시도하였으나 동작하지 않음
        const intervalId = setInterval(() => {
          dialog.scrollIntoView({
            behavior: 'auto',
            block: 'end',
          });
        }, 10);
        setTimeout(() => {
          clearInterval(intervalId);
        }, 300);
      } else {
        dialog.show();
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
