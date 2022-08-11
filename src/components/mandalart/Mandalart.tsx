import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';

const Mandalart = () => {
  return (
    <section className={styles.mandalart}>
      <h1>Mandalart</h1>
      <TopicsView />
    </section>
  );
};

export default Mandalart;
