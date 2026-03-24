import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { MAX_MANDALART_TITLE_SIZE } from '@/constants';

type UseTitleEditParams = {
  mandalartId: string;
  metaTitle: string;
  onMandalartMetaChange: (meta: { title: string }) => void;
};

export function useTitleEdit({
  mandalartId,
  metaTitle,
  onMandalartMetaChange,
}: UseTitleEditParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(metaTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // 만다라트 전환 시 편집 취소
  useEffect(() => {
    setIsEditing(false);
  }, [mandalartId]);

  // 외부에서 title이 바뀌면(Firebase 실시간 구독 등) 편집 중이 아닐 때만 동기화
  useEffect(() => {
    if (!isEditing) setTitleText(metaTitle);
  }, [metaTitle, isEditing]);

  // 편집 모드 진입 시 input 포커스 + 전체 선택
  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [isEditing]);

  const start = useCallback(() => {
    setTitleText(metaTitle);
    setIsEditing(true);
  }, [metaTitle]);

  const save = useCallback(() => {
    setIsEditing(false);
    if (
      titleText !== metaTitle &&
      titleText.length <= MAX_MANDALART_TITLE_SIZE
    ) {
      onMandalartMetaChange({ title: titleText });
    }
  }, [titleText, metaTitle, onMandalartMetaChange]);

  const cancel = useCallback(() => {
    setIsEditing(false);
    setTitleText(metaTitle);
  }, [metaTitle]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitleText(e.target.value);
  }, []);

  const isLimitReached = titleText.length > MAX_MANDALART_TITLE_SIZE;

  return {
    isEditing,
    titleText,
    inputRef,
    isLimitReached,
    start,
    save,
    cancel,
    handleKeyDown,
    handleChange,
  };
}
