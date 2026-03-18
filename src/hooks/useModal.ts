import { ReactNode, useCallback, useState } from 'react';

/**
 * open/close 토글 + 선택적 content를 관리하는 범용 상태 훅.
 *
 * "Modal"이라는 이름이지만 Drawer, Dialog, Alert 등 open/close가 필요한 모든 UI에
 * 동일하게 사용된다. 이름을 useDisclosure 등으로 바꿀 수 있지만, 이미 프로젝트 전반에서
 * 표준 패턴으로 자리잡았으므로 현행 이름을 유지한다.
 *
 * content를 사용하지 않는 호출처(Drawer, SignInDialog)에서도 동일하게 사용하여
 * 프로젝트 내 토글 상태 패턴을 통일한다.
 */
export const useModal = <T = ReactNode>() => {
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

