import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { Menu, MoreHorizontal, LogOut } from 'lucide-react';
import { Button } from 'components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from 'components/ui/dropdown-menu';
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

  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <header className={cn('bg-background', className)}>
      <nav className="flex min-h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.currentTarget.blur(); onOpenLeftDrawer(); }}
          className="mr-1"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="flex-1 text-[1.3rem] font-bold">{t('global.app')}</h1>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary hover:opacity-90 select-none">
                <span className="text-sm font-semibold text-primary-foreground">{initial}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    {user.displayName && (
                      <span className="text-sm font-medium">{user.displayName}</span>
                    )}
                    {user.email && (
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut />
                {t('auth.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" onClick={(e) => { e.currentTarget.blur(); onOpenSignInUI(); }}>
            {t('auth.signIn')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.currentTarget.blur(); onOpenRightDrawer(); }}
          className="ml-1"
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </nav>
    </header>
  );
};

export default Header;
