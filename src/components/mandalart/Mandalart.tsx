import { useEffect, useState } from 'react';
import AuthService from '../../service/authService';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User, ProviderId } from 'firebase/auth';
import SignInModal from '../signInModal/SignInModal';

const authService = new AuthService();

const Mandalart = () => {
  const [isViewAll, setIsViewAll] = useState(true);
  const [isShowSignInModal, setIsShowSignInModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleSignIn = (providerid: string) => {
    authService.signIn(providerid).then((userCred) => {
      userCred.user && console.log(userCred.user.email);
      setIsShowSignInModal(false);
    });
  };
  const handleSignOut = () => {
    authService.signOut();
  };

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      user && console.log(user.email);
      setUser(user);
    });
  }, []);

  return (
    <>
      <SignInModal
        isShow={isShowSignInModal}
        onClose={() => setIsShowSignInModal(false)}
        onSignIn={handleSignIn}
      />
      <section className={styles.mandalart}>
        <div className={styles.header}>
          <h1>Mandalart</h1>
          {user ? (
            <button onClick={handleSignOut}>sign out</button>
          ) : (
            <button
              onClick={() => {
                setIsShowSignInModal(true);
              }}
            >
              sign in
            </button>
          )}
        </div>
        <TopicsView isViewAll={isViewAll} />
        <div className="viewType">
          <button
            className={styles.viewTypeButton}
            onClick={() => setIsViewAll(true)}
          >
            all
          </button>
          <button
            className={styles.viewTypeButton}
            onClick={() => setIsViewAll(false)}
          >
            part
          </button>
        </div>
      </section>
    </>
  );
};

export default Mandalart;
