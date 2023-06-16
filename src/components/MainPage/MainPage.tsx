import styles from './MainPage.module.css';
import useUser from 'hooks/useUser';
import Spinner from 'components/Spinner/Spinner';
import MainUserPage from 'components/MainUserPage/MainUserPage';
import MainGuestPage from 'components/MainGuestPage/MainGuestPage';
import { useEffect, useMemo, useState } from 'react';

const MainPage = () => {
  const { user, isLoading: isUserLoading, error: userError } = useUser(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isUserLoading);
  }, [isUserLoading, setIsLoading]);

  const Main2 = useMemo(() => {
    if (isUserLoading) return null;

    return user ? (
      <MainUserPage
        user={user}
        userError={userError}
        setIsLoading={setIsLoading}
      />
    ) : (
      <MainGuestPage userError={userError} />
    );
  }, [isUserLoading, user, userError]);

  return (
    <>
      <div className={`${styles.loading} ${isLoading && styles.shown}`}>
        <Spinner className={styles.spinner} />
      </div>
      {Main2}
    </>
  );
};

export default MainPage;
