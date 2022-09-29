import { useEffect, useState } from 'react';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import Header from '../header/Header';
import TopicsViewTypeToggle from '../topicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from '../signInModal/SignInModal';
import Aside from '../aside/Aside';

const Mandalart = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllView, setIsAllView] = useState(true);
  const [isShowAside, setIsShowAside] = useState(false);
  const [isShowSignInModal, setIsShowSignInModal] = useState(false);

  const showAside = () => setIsShowAside(true);
  const hideAside = () => setIsShowAside(false);

  const showSignInModal = () => setIsShowSignInModal(true);
  const hideSignInModal = () => setIsShowSignInModal(false);
  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => authService.signOut();

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      console.log(`onAuthStateChanged user=${user?.email}`);
      setUser(user);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    authService
      .getRedirectResult()
      .then((userCred) => {
        if (userCred?.user) {
          console.log('login success');
        }
      })
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {isLoading ? (
        <h1 className={styles.loading}>Loading...</h1>
      ) : (
        <>
          <section className={styles.mandalart}>
            <div className={styles.header}>
              <Header
                isSignIn={user !== null}
                onSignInClick={showSignInModal}
                onSignOutClick={handleSignOut}
                onAsideClick={showAside}
                onEtcClick={() => {}}
              />
            </div>
            <div className={styles.scrollArea}>
              <div className={styles.container}>
                <TopicsView isAllView={isAllView} user={user} />
                <div className={styles.bottom}>
                  <TopicsViewTypeToggle
                    isAllView={isAllView}
                    onToggle={(isAllView) => setIsAllView(isAllView)}
                  />
                </div>
              </div>
            </div>
            <Aside isShow={isShowAside} onClose={hideAside} />
          </section>
          <SignInModal
            isShow={isShowSignInModal}
            onClose={hideSignInModal}
            onSignIn={handleSignIn}
          />
        </>
      )}
    </>
  );
};

export default Mandalart;
