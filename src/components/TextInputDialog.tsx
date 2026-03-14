import { useState, useEffect, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TextInputDialogProps = {
  isOpen: boolean;
  title?: string;
  initialText: string;
  placeholder?: string;
  textLimit?: number;
  onClose: () => void;
  onConfirm: (text: string) => void;
};

const TextInputDialog = ({
  isOpen,
  title = `${i18n.t('global.app')}`,
  initialText = '',
  placeholder,
  textLimit,
  onClose,
  onConfirm,
}: TextInputDialogProps) => {
  const [text, setText] = useState(initialText);
  const hasLimit = textLimit !== undefined;
  const isLimitReached = hasLimit && textLimit < text.length;
  const { t } = useTranslation();

  const handleConfirm = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (isLimitReached) return;
    onConfirm(text);
    onClose();
  };

  const handleInputChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    setText(ev.target.value);
  };

  const handleKeyDown = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      ev.currentTarget.form?.requestSubmit();
    }
  };

  useEffect(() => {
    if (isOpen) setText(initialText);
  }, [isOpen, initialText]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="p-6">
        <form onSubmit={handleConfirm} className="grid gap-3">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div>
            <textarea
              autoFocus
              autoComplete="off"
              rows={2}
              placeholder={placeholder}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              value={text}
              aria-invalid={isLimitReached || undefined}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm resize-none dark:bg-input/30"
            />
            {hasLimit && (
              <div className="mt-1 flex text-xs">
                <span
                  className={`flex-1 ${isLimitReached ? 'text-destructive' : ''}`}
                >
                  {isLimitReached && t('topic.maxLengthReached')}
                </span>
                <span
                  className={
                    isLimitReached
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }
                >
                  {`${text.length}/${textLimit}`}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={onClose}
            >
              {t('global.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLimitReached}
            >
              {t('global.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TextInputDialog;
