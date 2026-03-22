import { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import MandalartView from '@/components/MandalartView';

const MandalartListDrawer = lazy(() => import('@/components/MandalartListDrawer'));
const SettingsDrawer = lazy(() => import('@/components/SettingsDrawer'));
const SignInDialog = lazy(() => import('@/components/SignInDialog'));
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAppLayoutState } from '@/hooks/useAppLayoutState';
import type { UserHandlers } from '@/hooks/useAppLayoutState';
import AlertDialog from '@/components/AlertDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import TextInputDialog from '@/components/TextInputDialog';
import { MAX_MANDALART_TITLE_SIZE } from '@/constants';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

type AppLayoutProps = {
  userHandlers: UserHandlers;
};

const AppLayout = ({ userHandlers }: AppLayoutProps) => {
  const { t } = useTranslation();
  const { user, onSignOut, mandalart, leftDrawer, rightDrawer, signInDialog, alert, confirmDialog, renameDialog } =
    useAppLayoutState(userHandlers);

  return (
    // TooltipProvider — Header 내 Tooltip에 필요, App 전역이 아닌 도구 페이지에서만 로드
    <TooltipProvider>
    <div className="flex h-full w-full flex-col items-center">
      <Header
        user={user}
        onOpenSignInUI={signInDialog.open}
        onSignOut={onSignOut}
        onOpenLeftDrawer={leftDrawer.open}
        onOpenRightDrawer={rightDrawer.open}
        className="w-[calc(var(--size-content-width)+1em)] min-w-[calc(var(--size-content-min-width)+1em)]"
      />
      <Separator />
      <div className="flex h-full w-full flex-col overflow-auto [scrollbar-gutter:stable_both-edges]">
        {!mandalart.hasMandalarts ? (
          <Button
            variant="ghost"
            className="m-auto gap-2 text-2xl"
            onClick={mandalart.onCreate}
          >
            {/* text-2xl 버튼에서 기본 아이콘 크기(16px)가 너무 작으므로 명시적 크기 지정 */}
            <Plus className="size-8" data-icon="inline-start" />
            {t('mandalart.new')}
          </Button>
        ) : mandalart.currentId && mandalart.currentMeta && mandalart.currentTopicTree ? (
          <MandalartView
            mandalartId={mandalart.currentId}
            meta={mandalart.currentMeta}
            topicTree={mandalart.currentTopicTree}
            onMandalartMetaChange={mandalart.onMetaChange}
            onTopicTreeChange={mandalart.onTopicTreeChange}
            className="mx-auto my-auto w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] py-2"
          />
        ) : null}
      </div>
      <Suspense fallback={null}>
        <MandalartListDrawer
          isOpen={leftDrawer.isOpen}
          onSelectMandalart={leftDrawer.onSelect}
          onDeleteMandalart={leftDrawer.onDelete}
          onRenameMandalart={leftDrawer.onRename}
          onResetMandalart={leftDrawer.onReset}
          onCreateMandalart={leftDrawer.onCreate}
          onClose={leftDrawer.close}
        />
        <SettingsDrawer isOpen={rightDrawer.isOpen} onClose={rightDrawer.close} />
        <SignInDialog
          isOpen={signInDialog.isOpen}
          onClose={signInDialog.close}
          onSignIn={signInDialog.onSignIn}
        />
      </Suspense>
      <AlertDialog isOpen={alert.isOpen} message={alert.content} onClose={alert.close} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onClose={confirmDialog.close}
      />
      <TextInputDialog
        isOpen={renameDialog.isOpen}
        initialText={renameDialog.initialTitle}
        textLimit={MAX_MANDALART_TITLE_SIZE}
        onClose={renameDialog.close}
        onConfirm={renameDialog.onConfirm}
      />
    </div>
    </TooltipProvider>
  );
};

export default AppLayout;
