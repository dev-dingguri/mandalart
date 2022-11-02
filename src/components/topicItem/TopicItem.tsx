import styles from './TopicItem.module.css';

type TopicItemProps = {
  topic: string;
  isAccented: boolean;
  onShowTopicEditor: () => void;
};

const TopicItem = ({
  topic,
  isAccented,
  onShowTopicEditor,
}: TopicItemProps) => {
  return (
    <div
      className={`${styles.topicItem} ${isAccented && styles.accented}`}
      onClick={onShowTopicEditor}
    >
      <p className={styles.text}>{topic}</p>
    </div>
  );
};

export default TopicItem;
