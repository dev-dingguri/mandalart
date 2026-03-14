import { useTranslation } from 'react-i18next';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export type AlertDialogProps = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
};

const AlertDialog = ({ isOpen, message, onClose }: AlertDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="gap-3 p-6 w-max">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('global.app')}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line break-keep">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center">
          <AlertDialogAction className="w-full">{t('global.ok')}</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
