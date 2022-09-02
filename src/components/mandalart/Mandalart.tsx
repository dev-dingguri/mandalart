import { useEffect, useState } from 'react';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import Header from '../header/Header';

const Mandalart = () => {
  const [isViewAll, setIsViewAll] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      user && console.log(user.email);
      setUser(user);
    });
  }, []);

  return (
    <section className={styles.mandalart}>
      <Header user={user} onUserChange={(user: User | null) => setUser(user)} />
      <TopicsView isViewAll={isViewAll} user={user} />
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
  );
};

export default Mandalart;
