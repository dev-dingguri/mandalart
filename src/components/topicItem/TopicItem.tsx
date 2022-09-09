import styles from './TopicItem.module.css';

type TopicItemProps = {
  topic: string;
  isAccent: boolean;
  onClick: () => void;
};

const TopicItem = ({ topic, isAccent, onClick }: TopicItemProps) => {
  return (
    <div
      className={`${styles.topicItem} ${isAccent && styles.accent}`}
      onClick={onClick}
    >
      <p className={styles.text}>{topic}</p>
    </div>
  );
};

export default TopicItem;
