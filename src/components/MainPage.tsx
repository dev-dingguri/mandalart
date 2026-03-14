import AuthenticatedView from 'components/AuthenticatedView';
import GuestView from 'components/GuestView';
import { useAuthStore } from 'stores/useAuthStore';
import { useMandalartStore } from 'stores/useMandalartStore';

const MainPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const userError = useAuthStore((s) => s.error);
  const isMandalartLoading = useMandalartStore((s) => s.isLoading);
  const isLoading = isAuthLoading || (user !== null && isMandalartLoading);

  return (
    <>
      <div className={isLoading ? 'flex h-full' : 'hidden'}>
        <div className="m-auto size-16 animate-spin rounded-full border-4 border-border border-t-foreground" />
      </div>
      {user ? (
        <AuthenticatedView user={user} userError={userError} />
      ) : (
        <GuestView userError={userError} />
      )}
    </>
  );
};

export default MainPage;
