import styles from './MainPage.module.css';
import Spinner from 'components/Spinner/Spinner';
import MainUserPage from 'components/MainUserPage/MainUserPage';
import MainGuestPage from 'components/MainGuestPage/MainGuestPage';
import { useEffect, useMemo } from 'react';
import useBoolean from 'hooks/useBoolean';
import useSigninCheckWrapper from 'hooks/useSigninCheckWrapper';

const MainPage = () => {
  const {
    status,
    data: signInCheckResult,
    error: signinError,
  } = useSigninCheckWrapper();
  const [isShownLoading, { toggle: toggleLoading }] = useBoolean(true);

  const MainCommon = useMemo(() => {
    if (status === 'loading') return null;
    const { signedIn, user } = signInCheckResult;
    if (signedIn && user) {
      return (
        <MainUserPage
          user={user}
          signinError={signinError}
          toggleLoading={toggleLoading}
        />
      );
    } else {
      toggleLoading(false);
      return <MainGuestPage signinError={signinError} />;
    }
  }, [status, signinError, signInCheckResult, toggleLoading]);

  return (
    <>
      <div className={`${styles.loading} ${isShownLoading && styles.shown}`}>
        <Spinner className={styles.spinner} />
      </div>
      {MainCommon}
    </>
  );
};

export default MainPage;
