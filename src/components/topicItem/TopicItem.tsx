import styles from './TopicItem.module.css';

type TopicItemProps = {
  topic: string;
  isAccented: boolean;
  onClick: () => void;
};

const TopicItem = ({ topic, isAccented, onClick }: TopicItemProps) => {
  return (
    <div
      className={`${styles.topicItem} ${isAccented && styles.accented}`}
      onClick={onClick}
    >
      <p className={styles.text}>{topic}</p>
    </div>
  );
};

export default TopicItem;
