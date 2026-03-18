import { memo } from 'react';
import { shallow } from 'zustand/shallow';
import { MandalartMeta } from '@/types';
import { LayoutGrid } from 'lucide-react';
import TextInputDialog from '@/components/TextInputDialog';
import MandalartListItemMenu from '@/components/MandalartListItemMenu';
import { MAX_MANDALART_TITLE_SIZE } from '@/constants';
import { useTranslation } from 'react-i18next';
import { useModal } from '@/hooks/useModal';
import { cn } from '@/lib/utils';

type MandalartListItemProps = {
  mandalartId: string;
  meta: MandalartMeta;
  isSelected: boolean;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onReset: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

// Firebase onValue가 매 snapshot마다 새 MandalartMeta 객체를 생성하므로
// meta 비교에 shallow를 사용하여 내용이 같으면 리렌더 방지
const MandalartListItem = memo(({
  mandalartId,
  meta,
  isSelected,
  onSelect,
  onDelete,
  onReset,
  onRename,
}: MandalartListItemProps) => {
  const { isOpen: isOpenEditor, open: openEditor, close: closeEditor } = useModal();
  const { t } = useTranslation();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(mandalartId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(mandalartId);
          }
        }}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-sm',
          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
        )}
      >
        <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          {meta.title || t('mandalart.untitled')}
        </span>
        <MandalartListItemMenu
          mandalartId={mandalartId}
          onDelete={onDelete}
          onReset={onReset}
          onRename={openEditor}
        />
      </div>
      <TextInputDialog
        isOpen={isOpenEditor}
        initialText={meta.title}
        textLimit={MAX_MANDALART_TITLE_SIZE}
        onClose={closeEditor}
        onConfirm={(name) => {
          onRename(mandalartId, name);
        }}
      />
    </>
  );
}, (prev, next) =>
  prev.mandalartId === next.mandalartId &&
  prev.isSelected === next.isSelected &&
  shallow(prev.meta, next.meta) &&
  prev.onSelect === next.onSelect &&
  prev.onDelete === next.onDelete &&
  prev.onReset === next.onReset &&
  prev.onRename === next.onRename
);

export default MandalartListItem;
