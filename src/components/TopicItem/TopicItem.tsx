import Typography from '@mui/material/Typography';
import styles from './TopicItem.module.css';
import TextEditor from 'components/TextEditor/TextEditor';
import { MAX_TOPIC_TEXT_SIZE } from 'constants/constants';
import useBoolean from 'hooks/useBoolean';
import { useTranslation } from 'react-i18next';
import Square from 'components/Square/Square';

type TopicItemProps = {
  topic: string;
  isAccented: boolean;
  canEdit: boolean;
  onUpdateTopic: (text: string) => void;
  onUpdateFocuse?: () => void;
};

const TopicItem = ({
  topic,
  isAccented,
  canEdit,
  onUpdateTopic,
  onUpdateFocuse,
}: TopicItemProps) => {
  const [isShownEditor, { on: showEditor, off: closeEditor }] =
    useBoolean(false);
  const { t } = useTranslation();

  return (
    <>
      <Square>
        <div
          className={`${styles.topicItem} ${isAccented && styles.accented}`}
          onClick={() => {
            onUpdateFocuse && onUpdateFocuse();
            canEdit && showEditor();
          }}
        >
          <Typography variant="body1" className={styles.text}>
            {topic}
          </Typography>
        </div>
      </Square>
      <TextEditor
        isShown={isShownEditor}
        title={`${t('global.topic')}`}
        initialText={topic}
        placeholder={`${t('textEditor.placeholder')}`}
        maxText={MAX_TOPIC_TEXT_SIZE}
        onClose={closeEditor}
        onConfirm={onUpdateTopic}
      />
    </>
  );
};

export default TopicItem;
