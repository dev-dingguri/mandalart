import { useState } from 'react';
import TextInputDialog from '@/components/TextInputDialog';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants/constants';
import { useTranslation } from 'react-i18next';
import AspectSquare from '@/components/AspectSquare';
import { cn } from '@/lib/utils';

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
  const [isOpenEditor, setIsOpenEditor] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <AspectSquare
        className={cn(
          'flex cursor-pointer select-none items-center justify-center',
          isAccented
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground'
        )}
        onClick={() => isEditable && setIsOpenEditor(true)}
      >
        <p className="line-clamp-2 overflow-hidden break-words text-center text-[0.7rem] leading-[1.2em] min-[30rem]:line-clamp-3 min-[30rem]:text-[0.9rem]">
          {topic}
        </p>
      </AspectSquare>
      <TextInputDialog
        isOpen={isOpenEditor}
        title={t('global.topic')}
        initialText={topic}
        placeholder={t('topic.placeholder')}
        textLimit={MAX_TOPIC_TEXT_SIZE}
        onClose={() => setIsOpenEditor(false)}
        onConfirm={onUpdateTopic}
      />
    </>
  );
};

export default TopicItem;
