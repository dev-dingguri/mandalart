import styles from './MainPage.module.css';
import Spinner from 'components/Spinner/Spinner';
import MainUserPage from 'components/MainUserPage/MainUserPage';
import MainGuestPage from 'components/MainGuestPage/MainGuestPage';
import { useEffect, useMemo } from 'react';
import { useSigninCheck } from 'reactfire';
import useBoolean from 'hooks/useBoolean';

const MainPage = () => {
  const {
    status,
    data: signInCheckResult,
    error: signinError,
  } = useSigninCheck();
  const signinLoading = status === 'loading';
  const [isShownLoading, { toggle: toggleLoading }] = useBoolean(true);

  useEffect(() => {
    toggleLoading(signinLoading);
  }, [signinLoading, toggleLoading]);

  const MainCommon = useMemo(() => {
    if (signinLoading) return null;
    const { signedIn, user } = signInCheckResult;
    return signedIn && user ? (
      <MainUserPage
        user={user}
        signinError={signinError}
        toggleLoading={toggleLoading}
      />
    ) : (
      <MainGuestPage signinError={signinError} />
    );
  }, [signinLoading, signinError, signInCheckResult, toggleLoading]);

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
