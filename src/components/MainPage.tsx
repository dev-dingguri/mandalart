import MainUserPage from 'components/MainUserPage';
import MainGuestPage from 'components/MainGuestPage';
import { useAuthStore } from 'stores/useAuthStore';
import { useIsLoading, useAddLoadingCondition } from 'stores/useLoadingStore';

const MainPage = () => {
  const user = useAuthStore((s) => s.user);
  const isUserLoading = useAuthStore((s) => s.isLoading);
  const userError = useAuthStore((s) => s.error);
  const isLoading = useIsLoading();
  useAddLoadingCondition('user', isUserLoading);

  return (
    <>
      <div className={isLoading ? 'flex h-full' : 'hidden'}>
        <div className="m-auto size-16 animate-spin rounded-full border-4 border-border border-t-foreground" />
      </div>
      {user ? (
        <MainUserPage user={user} userError={userError} />
      ) : (
        <MainGuestPage userError={userError} />
      )}
    </>
  );
};

export default MainPage;
