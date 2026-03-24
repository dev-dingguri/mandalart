import { useTranslation } from 'react-i18next';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type AlertDialogProps = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
};

// Radix AlertDialog는 외부 클릭/ESC로 닫히지 않아 에러 알림에 적합
const AlertDialog = ({ isOpen, message, onClose }: AlertDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogRoot open={isOpen}>
      <AlertDialogContent className="max-w-xs gap-3 p-6 sm:max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('global.app')}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line break-keep">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full" onClick={onClose}>
            {t('global.ok')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
