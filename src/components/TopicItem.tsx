import TextEditor from 'components/TextEditor';
import { MAX_TOPIC_TEXT_SIZE } from 'constants/constants';
import { useTranslation } from 'react-i18next';
import SquareBox from 'components/SquareBox';
import { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import MaxLinesTypography from 'components/MaxLinesTypography';
import { useBoolean, useMediaQuery } from 'usehooks-ts';

const TopicItemBox = styled(SquareBox, {
  shouldForwardProp: (prop) => prop !== 'accented',
})<BoxProps & { accented?: boolean }>(({ theme, accented }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: accented
    ? theme.palette.secondary.main
    : theme.palette.primary.main,
}));

type TopicItemProps = {
  topic: string;
  isAccented: boolean;
  isEditable: boolean;
  onUpdateTopic: (text: string) => void;
};

const TopicItem = ({
  topic,
  isAccented,
  isEditable,
  onUpdateTopic,
}: TopicItemProps) => {
  const {
    value: isOpenEditor,
    setTrue: openEditor,
    setFalse: closeEditor,
  } = useBoolean(false);
  const isMinWidthReached = useMediaQuery('screen and (min-width: 30rem)');
  const { t } = useTranslation();
  return (
    <>
      <TopicItemBox
        accented={isAccented}
        onClick={() => isEditable && openEditor()}
      >
        <MaxLinesTypography
          variant="body1"
          maxLines={isMinWidthReached ? 3 : 2}
          sx={{
            textAlign: 'center',
            lineHeight: '1.2em',
            fontSize: '0.7rem',
            // todo: 컴포넌트 크기에 따라서 폰트 사이즈 다르게
            '@media screen and (min-width: 30rem)': {
              fontSize: '0.9rem',
            },
          }}
        >
          {topic}
        </MaxLinesTypography>
      </TopicItemBox>
      <TextEditor
        isOpen={isOpenEditor}
        title={`${t('global.topic')}`}
        initialText={topic}
        placeholder={`${t('textEditor.placeholder')}`}
        textLimit={MAX_TOPIC_TEXT_SIZE}
        onClose={closeEditor}
        onConfirm={onUpdateTopic}
      />
    </>
  );
};

export default TopicItem;
