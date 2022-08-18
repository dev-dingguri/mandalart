import styles from './TopicItem.module.css';

type TopicItemProps = {
  topic: string;
  onClick: () => void;
};

const TopicItem = ({ topic, onClick }: TopicItemProps) => {
  return (
    <div className={styles.topicItem} onClick={onClick}>
      <p className={styles.text}>{topic}</p>
    </div>
  );
};

export default TopicItem;
