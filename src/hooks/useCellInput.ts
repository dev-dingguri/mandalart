import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';

export type CellInputConfig = {
  initialText: string;
  cellKey: string;
  onTextChange: (text: string) => void;
  onSaveAndPrev: () => void;
  onSaveAndNext: () => void;
  onSaveAndUp: () => void;
  onSaveAndDown: () => void;
  onSaveAndClose: () => void;
};

export const useCellInput = ({
  initialText,
  cellKey,
  onTextChange,
  onSaveAndPrev,
  onSaveAndNext,
  onSaveAndUp,
  onSaveAndDown,
  onSaveAndClose,
}: CellInputConfig) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = text.length > MAX_TOPIC_TEXT_SIZE;

  // cellKey 변경 시 텍스트 초기화 + 입력 포커스
  // initialText를 deps에서 제외: cellKey가 같은데 외부 동기화로 initialText만 바뀔 때
  // 사용자의 편집 중인 텍스트를 덮어쓰지 않기 위함
  useEffect(() => {
    setText(initialText);
    onTextChange(initialText);
    inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value;
      setText(newText);
      onTextChange(newText);
    },
    [onTextChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        onSaveAndNext();
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        onSaveAndPrev();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onSaveAndUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onSaveAndDown();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSaveAndClose();
      }
    },
    [onSaveAndNext, onSaveAndPrev, onSaveAndUp, onSaveAndDown, onSaveAndClose],
  );

  return { text, inputRef, isLimitReached, handleChange, handleKeyDown };
};
