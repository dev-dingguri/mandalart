import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type AlertProps = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
};

const Alert = ({ isOpen, message, onClose }: AlertProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="gap-3 p-6 w-max">
        <DialogHeader>
          <DialogTitle>{t('global.app')}</DialogTitle>
          <DialogDescription className="whitespace-pre-line break-keep">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button className="w-full" onClick={onClose}>{t('global.ok')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Alert;
