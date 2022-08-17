import React, { useCallback, useEffect, useRef } from 'react';

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
    if (!modalRef.current?.open) {
      if (isModal) {
        modalRef.current?.showModal();
      } else {
        modalRef.current?.show();
      }
    }
  }, [isModal]);

  const hide = useCallback(() => {
    if (modalRef.current?.open) {
      modalRef.current?.close();
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
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  return (
    <dialog className={className} ref={modalRef}>
      {children}
    </dialog>
  );
};

export default Dialog;
