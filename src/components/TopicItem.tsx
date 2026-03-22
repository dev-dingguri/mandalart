import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import AspectSquare from '@/components/AspectSquare';

type TopicItemProps = {
  topic: string;
  isAccented: boolean;
  isEditable: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

const TopicItem = memo(({
  topic,
  isAccented,
  isEditable,
  isSelected,
  onSelect,
}: TopicItemProps) => {
  const { t } = useTranslation();

  return (
    <AspectSquare
      role="button"
      tabIndex={0}
      aria-label={topic || t('topic.placeholder')}
      className={cn(
        'flex cursor-pointer items-center justify-center',
        isAccented
          ? 'bg-primary text-primary-foreground'
          // 라이트 모드에서 흰색 셀과 배경(#f2f2f7) 간 대비 부족을 hairline border로 보완
          : 'bg-card text-card-foreground shadow-[0_0_0_0.5px_var(--color-border)]',
        // 선택 상태 하이라이트 — editable일 때만 표시하여
        // Focus View 스와이프 후 이전 그리드 셀에 잔여 하이라이트 방지
        isSelected && isEditable && 'ring-2 ring-ring'
      )}
      // mousedown의 기본 동작(포커스 이동)을 막아
      // BottomInputBar 입력 중 다른 셀 탭 시 키보드가 닫혔다 열리는 jitter 방지
      onMouseDown={(e) => isEditable && e.preventDefault()}
      onClick={() => isEditable && onSelect()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isEditable) onSelect();
        }
      }}
    >
      <p className="line-clamp-2 overflow-hidden break-words text-center text-[0.7rem] leading-[1.2em] min-[30rem]:line-clamp-3 min-[30rem]:text-[0.9rem]">
        {topic}
      </p>
    </AspectSquare>
  );
});
TopicItem.displayName = 'TopicItem';

export default TopicItem;
