import { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';
import { useCellInput, type CellInputConfig } from '@/hooks/useCellInput';

type BottomInputBarProps = CellInputConfig & {
  cellPosition: string;
};

const BottomInputBar = (props: BottomInputBarProps) => {
  const { cellPosition, onSaveAndPrev, onSaveAndNext, onSaveAndClose } = props;
  const { text, inputRef, isLimitReached, handleChange, handleKeyDown } =
    useCellInput(props);
  const { t } = useTranslation();

  const barRef = useRef<HTMLDivElement>(null);

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

    vv.addEventListener('resize', updateBarPosition, { passive: true });
    vv.addEventListener('scroll', updateBarPosition, { passive: true });

    return () => {
      vv.removeEventListener('resize', updateBarPosition);
      vv.removeEventListener('scroll', updateBarPosition);
    };
  }, [updateBarPosition]);

  return (
    <div
      ref={barRef}
      data-bottom-input
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm"
    >
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
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
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
