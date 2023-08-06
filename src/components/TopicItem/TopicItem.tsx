import TextEditor from 'components/TextEditor/TextEditor';
import { MAX_TOPIC_TEXT_SIZE } from 'constants/constants';
import useBoolean from 'hooks/useBoolean';
import { useTranslation } from 'react-i18next';
import SquareBox from 'components/SquareBox/SquareBox';
import { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import MaxLinesTypography from 'components/MaxLinesTypography/MaxLinesTypography';
import { useMediaQuery } from 'usehooks-ts';

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
  const isMinWidthReached = useMediaQuery('screen and (min-width: 30rem)');
  const { t } = useTranslation();
  return (
    <>
      <TopicItemBox
        accented={isAccented}
        onClick={() => {
          onUpdateFocuse && onUpdateFocuse();
          canEdit && showEditor();
        }}
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
