import { ProviderId } from 'firebase/auth';
import googleIco from '@/assets/images/google.svg';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type SignInDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInDialog = ({ isOpen, onClose, onSignIn }: SignInDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-3 p-6 w-max min-w-xs">
        <DialogHeader>
          <DialogTitle>{t('global.app')}</DialogTitle>
          <DialogDescription className="whitespace-pre-line break-keep text-center">
            {t('auth.signInPrompt')}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          <img src={googleIco} alt="google" width={16} height={16} className="size-4" />
          {t('auth.signInWithGoogle')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
