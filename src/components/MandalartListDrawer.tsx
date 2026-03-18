import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MandalartList from '@/components/MandalartList';
import { MandalartMeta } from '@/types/MandalartMeta';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type MandalartListDrawerProps = {
  isOpen: boolean;
  metaMap: Map<string, MandalartMeta>;
  selectedMandalartId: string | null;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onResetMandalart: (mandalartId: string) => void;
  onCreateMandalart: () => void;
  onClose: () => void;
};

const MandalartListDrawer = ({
  isOpen,
  metaMap,
  selectedMandalartId,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onResetMandalart,
  onCreateMandalart,
  onClose,
}: MandalartListDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="left"
    >
      <DrawerContent aria-describedby={undefined}>
        <DrawerTitle className="sr-only">{t('mandalart.list')}</DrawerTitle>
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
        </ScrollArea>
        <div className="flex flex-col">
          <Separator />
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
      </DrawerContent>
    </Drawer>
  );
};

export default MandalartListDrawer;
