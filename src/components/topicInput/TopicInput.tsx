import styles from './TopicInput.module.css';

type TopicInputProps = {
  topic: string;
  onClick: () => void;
};

const TopicInput = ({ topic, onClick }: TopicInputProps) => {
  return (
    <input
      className={styles.topicInput}
      type="text"
      value={topic}
      onChange={() => {}}
      onClick={onClick}
    ></input>
  );
};

export default TopicInput;
