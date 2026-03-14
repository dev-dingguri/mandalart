import { ProviderId } from 'firebase/auth';
import googleIco from 'assets/images/google.svg';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (providerId: string) => void;
};

const SignInModal = ({ isOpen, onClose, onSignIn }: SignInModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-3 p-6 w-max">
        <DialogHeader>
          <DialogTitle>{t('global.app')}</DialogTitle>
          <DialogDescription className="whitespace-pre-line break-keep text-center">
            {t('signInModal.message')}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSignIn(ProviderId.GOOGLE)}
        >
          <img src={googleIco} alt="google" className="size-4" />
          {t('signInModal.signIn.google')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
