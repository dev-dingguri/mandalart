import { Plus } from 'lucide-react';
import { Button } from 'components/ui/button';
import MandalartList from 'components/MandalartList';
import { Snippet } from 'types/Snippet';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent } from 'components/ui/drawer';
import { Separator } from 'components/ui/separator';

type MandalartListDrawerProps = {
  isOpen: boolean;
  snippetMap: Map<string, Snippet>;
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
  snippetMap,
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
      <DrawerContent>
        <MandalartList
          snippetMap={snippetMap}
          selectedId={selectedMandalartId}
          onItemSelect={onSelectMandalart}
          onItemDelete={onDeleteMandalart}
          onItemRename={onRenameMandalart}
          onItemReset={onResetMandalart}
          className="overflow-auto p-2 pt-4 [scrollbar-gutter:stable_both-edges]"
        />
        <div className="flex flex-col px-[var(--size-scrollbar-width)]">
          <Separator />
          <Button
            variant="ghost"
            size="lg"
            className="m-2 justify-start gap-2 bg-muted text-base"
            onClick={onCreateMandalart}
          >
            <Plus className="size-5" />
            {t('mandalart.new')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MandalartListDrawer;
