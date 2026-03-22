import { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';

type PopoverCellInputProps = {
  initialText: string;
  cellKey: string;
  cellPosition: string;
  onTextChange: (text: string) => void;
  onSaveAndPrev: () => void;
  onSaveAndNext: () => void;
  onSaveAndUp: () => void;
  onSaveAndDown: () => void;
  onSaveAndClose: () => void;
};

const PopoverCellInput = ({
  initialText,
  cellKey,
  cellPosition,
  onTextChange,
  onSaveAndPrev,
  onSaveAndNext,
  onSaveAndUp,
  onSaveAndDown,
  onSaveAndClose,
}: PopoverCellInputProps) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

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
    [onTextChange]
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
    [onSaveAndNext, onSaveAndPrev, onSaveAndUp, onSaveAndDown, onSaveAndClose]
  );

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onSaveAndPrev}
        aria-label={t('topic.prevCell')}
      >
        <ChevronLeft />
      </Button>
      <div className="min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t('topic.placeholder')}
          enterKeyHint="next"
          autoComplete="off"
          aria-invalid={isLimitReached || undefined}
          className={cn(
            'w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20'
          )}
        />
        <div className="mt-0.5 flex justify-between px-0.5 text-[0.65rem] leading-tight text-muted-foreground">
          <span className={cn(isLimitReached && 'text-destructive')}>
            {isLimitReached ? t('topic.maxLengthReached') : '\u00A0'}
          </span>
          <span className={cn(isLimitReached && 'text-destructive')}>
            {text.length}/{MAX_TOPIC_TEXT_SIZE} · {cellPosition}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onSaveAndNext}
        aria-label={t('topic.nextCell')}
      >
        <ChevronRight />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onSaveAndClose}
        aria-label={t('global.save')}
      >
        <Check />
      </Button>
    </div>
  );
};

export default PopoverCellInput;
