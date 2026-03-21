import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MandalartList from '@/components/MandalartList';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMandalartStore } from '@/stores/useMandalartStore';

type MandalartListDrawerProps = {
  isOpen: boolean;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string) => void;
  onResetMandalart: (mandalartId: string) => void;
  onCreateMandalart: () => void;
  onClose: () => void;
};

const MandalartListDrawer = ({
  isOpen,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onResetMandalart,
  onCreateMandalart,
  onClose,
}: MandalartListDrawerProps) => {
  const { t } = useTranslation();
  // store에서 직접 구독하여 AppLayout을 경유하지 않음 → metaMap 변경 시 이 컴포넌트만 리렌더
  const metaMap = useMandalartStore((s) => s.metaMap);
  const selectedMandalartId = useMandalartStore((s) => s.currentMandalartId);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="left" showCloseButton={false} aria-describedby={undefined}>
        <SheetTitle className="sr-only">{t('mandalart.list')}</SheetTitle>
        <ScrollArea className="flex-1">
          <MandalartList
            metaMap={metaMap}
            selectedId={selectedMandalartId}
            onItemSelect={onSelectMandalart}
            onItemDelete={onDeleteMandalart}
            onItemRename={onRenameMandalart}
            onItemReset={onResetMandalart}
            className="p-2 pt-4"
          />
          <Separator />
          {/* flex-col의 stretch 기본값으로 inline-flex 버튼이 전체 너비를 채우도록 */}
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="lg"
              className="m-2 justify-start gap-2 bg-muted text-base"
              onClick={onCreateMandalart}
            >
              <Plus data-icon="inline-start" />
              {t('mandalart.new')}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MandalartListDrawer;
