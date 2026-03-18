import { useTranslation } from 'react-i18next';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ConfirmDialogProps = {
  isOpen: boolean;
  message: string | null;
  confirmText: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

// AlertDialog와 달리 Cancel 버튼을 제공하여 사용자가 파괴적 작업을 취소할 수 있음
const ConfirmDialog = ({ isOpen, message, confirmText, onConfirm, onClose }: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogRoot open={isOpen}>
      <AlertDialogContent className="gap-3 p-6 w-max">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('global.app')}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line break-keep">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {t('global.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default ConfirmDialog;
