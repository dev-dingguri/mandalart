import styles from './TopicInput.module.css';

type TopicInputProps = {
  topic: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const TopicInput = ({ topic, onChange }: TopicInputProps) => {
  return (
    <input
      className={styles.topicInput}
      type="text"
      value={topic}
      onChange={(ev) => onChange(ev)}
    ></input>
  );
};

export default TopicInput;
