import React, { useState } from 'react';
import { Snippet } from 'types/Snippet';
import { LayoutGrid, MoreHorizontal } from 'lucide-react';
import TextEditor from 'components/TextEditor';
import {
  MAX_MANDALART_TITLE_SIZE,
  TMP_MANDALART_ID,
} from 'constants/constants';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';

type MandalartListItemProps = {
  mandalartId: string;
  snippet: Snippet;
  isSelected: boolean;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onReset: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

const MandalartListItem = ({
  mandalartId,
  snippet,
  isSelected,
  onSelect,
  onDelete,
  onReset,
  onRename,
}: MandalartListItemProps) => {
  const [isOpenEditor, setIsOpenEditor] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(mandalartId)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(mandalartId)}
        className={[
          'flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-sm',
          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
        ].join(' ')}
      >
        <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          {snippet.title ? snippet.title : t('mandalart.snippet.untitled')}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {mandalartId !== TMP_MANDALART_ID && (
              <DropdownMenuItem onClick={() => onDelete(mandalartId)}>
                {t('mandalart.delete')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onReset(mandalartId)}>
              {t('mandalart.reset')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsOpenEditor(true)}>
              {t('mandalart.rename')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TextEditor
        isOpen={isOpenEditor}
        initialText={snippet.title}
        textLimit={MAX_MANDALART_TITLE_SIZE}
        onClose={() => setIsOpenEditor(false)}
        onConfirm={(name) => {
          onRename(mandalartId, name);
        }}
      />
    </>
  );
};

export default MandalartListItem;
