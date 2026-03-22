import { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';

type BottomInputBarProps = {
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

const BottomInputBar = ({
  initialText,
  cellKey,
  cellPosition,
  onTextChange,
  onSaveAndPrev,
  onSaveAndNext,
  onSaveAndUp,
  onSaveAndDown,
  onSaveAndClose,
}: BottomInputBarProps) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const isLimitReached = text.length > MAX_TOPIC_TEXT_SIZE;

  const barRef = useRef<HTMLDivElement>(null);

  // cellKey 변경 시 텍스트 초기화 + 입력 포커스
  // initialText를 deps에서 제외: cellKey가 같은데 외부 동기화로 initialText만 바뀔 때
  // 사용자의 편집 중인 텍스트를 덮어쓰지 않기 위함
  useEffect(() => {
    setText(initialText);
    onTextChange(initialText);
    inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey]);

  // iOS Safari에서 키보드가 올라오면 visual viewport만 축소되고
  // layout viewport는 그대로이므로 fixed bottom:0이 키보드 뒤에 숨겨짐.
  // visualViewport API로 키보드 높이를 계산하여 bottom을 동적으로 설정.
  // Android(resizes-content)에서는 innerHeight도 함께 줄어들어 offset ≈ 0 → no-op.
  const updateBarPosition = useCallback(() => {
    const bar = barRef.current;
    const vv = window.visualViewport;
    if (!bar || !vv) return;

    const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop;
    bar.style.bottom = keyboardOffset > 0 ? `${keyboardOffset}px` : '0px';
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    vv.addEventListener('resize', updateBarPosition);
    vv.addEventListener('scroll', updateBarPosition);

    return () => {
      vv.removeEventListener('resize', updateBarPosition);
      vv.removeEventListener('scroll', updateBarPosition);
    };
  }, [updateBarPosition]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
  };

  return (
    <div ref={barRef} data-bottom-input className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--size-content-width)] items-center gap-1.5 px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 shrink-0"
          onClick={onSaveAndPrev}
          aria-label={t('topic.prevCell')}
        >
          <ChevronLeft className="size-4" />
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
          className="size-10 shrink-0"
          onClick={onSaveAndNext}
          aria-label={t('topic.nextCell')}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 shrink-0"
          onClick={onSaveAndClose}
          aria-label={t('global.save')}
        >
          <Check className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default BottomInputBar;
