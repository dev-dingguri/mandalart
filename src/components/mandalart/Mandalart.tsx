import { useEffect, useState } from 'react';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import Header from '../header/Header';
import TopicsViewTypeToggle from '../topicsViewTypeToggle/TopicsViewTypeToggle';

const Mandalart = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllView, setIsAllView] = useState(true);

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
        <section className={styles.mandalart}>
          <div className={styles.header}>
            <Header user={user} />
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
        </section>
      )}
    </>
  );
};

export default Mandalart;
