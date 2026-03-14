import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { BsList, BsThreeDots } from 'react-icons/bs';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';

type HeaderProps = {
  user: User | null;
  onOpenSignInUI: () => void;
  onSignOut: () => void;
  onOpenLeftDrawer: () => void;
  onOpenRightDrawer: () => void;
  className?: string;
};

const Header = ({
  user,
  onOpenSignInUI,
  onSignOut,
  onOpenLeftDrawer,
  onOpenRightDrawer,
  className,
}: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className={cn('bg-app-bg', className)}>
      <nav className="flex min-h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenLeftDrawer}
          className="mr-1"
        >
          <BsList className="size-5" />
        </Button>
        <h1 className="flex-1 text-[1.3rem] font-bold">{t('global.app')}</h1>
        <span className="mx-2 text-sm">{user && user.displayName}</span>
        {user ? (
          <Button variant="ghost" onClick={onSignOut}>
            {t('auth.signOut')}
          </Button>
        ) : (
          <Button variant="ghost" onClick={onOpenSignInUI}>
            {t('auth.signIn')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenRightDrawer}
          className="ml-1"
        >
          <BsThreeDots className="size-5" />
        </Button>
      </nav>
    </header>
  );
};

export default Header;
