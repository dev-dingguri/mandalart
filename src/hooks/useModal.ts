import { ReactNode, useCallback, useState } from 'react';

const useModal = <T extends ReactNode = ReactNode>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<T | null>(null);

  const open = useCallback((content: T | null = null) => {
    setContent(content);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setContent(null);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    content,
  };
};

export default useModal;
