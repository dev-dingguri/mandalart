import { ReactNode, useCallback, useState } from 'react';

const useModal = <T extends ReactNode = ReactNode>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<T | null>(null);

  const open = useCallback((content: T | null = null) => {
    setContent(content);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    // 모달이 닫힐 때 애니메이션이 있는 경우가 있어서 닫힐 때 내용을 제거하지 않음
    // setContent(null);
  }, []);

  return {
    isOpen,
    open,
    close,
    content,
  };
};

export default useModal;
