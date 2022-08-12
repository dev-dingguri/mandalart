import styles from './TopicInput.module.css';

type TopicInputProps = {
  topic: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onClick: () => void;
};

const TopicInput = ({ topic, onChange, onClick }: TopicInputProps) => {
  return (
    <input
      className={styles.topicInput}
      type="text"
      value={topic}
      onChange={(ev) => onChange(ev)}
      onClick={onClick}
    ></input>
  );
};

export default TopicInput;
