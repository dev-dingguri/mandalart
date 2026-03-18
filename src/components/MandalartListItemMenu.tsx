import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TMP_MANDALART_ID } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type MandalartListItemMenuProps = {
  mandalartId: string;
  onDelete: (mandalartId: string) => void;
  onReset: (mandalartId: string) => void;
  onRename: () => void;
};

const MandalartListItemMenu = ({
  mandalartId,
  onDelete,
  onReset,
  onRename,
}: MandalartListItemMenuProps) => {
  const { t } = useTranslation();

  return (
    // vaul Drawer 안에서 modal DropdownMenu가 닫히면 Drawer도 함께 닫히는 Radix 중첩 모달 충돌 방지
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t('global.more')}
          // 부모 리스트 아이템의 onSelect 클릭 이벤트 전파 방지
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
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
        <DropdownMenuItem onClick={onRename}>
          {t('mandalart.rename')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MandalartListItemMenu;
