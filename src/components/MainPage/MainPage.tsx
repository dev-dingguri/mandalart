import styles from './MainPage.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import useUser from 'hooks/useUser';
import MainUserPage from 'components/MainUserPage/MainUserPage';
import MainGuestPage from 'components/MainGuestPage/MainGuestPage';
import { useMemo } from 'react';
import { useAddLoadingCondition, useIsLoading } from 'contexts/LoadingContext';

const MainPage = () => {
  const { user, isLoading: isUserLoading, error: userError } = useUser();
  const isLoading = useIsLoading();
  useAddLoadingCondition('user', isUserLoading);

  const MainContents = useMemo(() => {
    if (isUserLoading) return null;

    return user ? (
      <MainUserPage user={user} userError={userError} />
    ) : (
      <MainGuestPage userError={userError} />
    );
  }, [isUserLoading, user, userError]);

  return (
    <>
      <div className={`${styles.loading} ${isLoading && styles.shown}`}>
        <CircularProgress />
      </div>
      {MainContents}
    </>
  );
};

export default MainPage;
