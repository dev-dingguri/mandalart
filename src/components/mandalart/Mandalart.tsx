import { useState } from 'react';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';

const Mandalart = () => {
  const [isViewAll, setIsViewAll] = useState(true);

  return (
    <section className={styles.mandalart}>
      <h1>Mandalart</h1>
      <TopicsView isViewAll={isViewAll} />
      <div>
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
