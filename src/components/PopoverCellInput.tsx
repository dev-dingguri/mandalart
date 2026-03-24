import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';
import { useCellInput, type CellInputConfig } from '@/hooks/useCellInput';

type PopoverCellInputProps = CellInputConfig & {
  cellPosition: string;
};

const PopoverCellInput = (props: PopoverCellInputProps) => {
  const { cellPosition, onSaveAndPrev, onSaveAndNext, onSaveAndClose } = props;
  const { text, inputRef, isLimitReached, handleChange, handleKeyDown } =
    useCellInput(props);
  const { t } = useTranslation();

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
