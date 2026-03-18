import { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import MandalartView from '@/components/MandalartView';

const MandalartListDrawer = lazy(() => import('@/components/MandalartListDrawer'));
const SettingsDrawer = lazy(() => import('@/components/SettingsDrawer'));
const SignInDialog = lazy(() => import('@/components/SignInDialog'));
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import useAppLayoutState from '@/hooks/useAppLayoutState';
import type { UserHandlers } from '@/hooks/useAppLayoutState';
import AlertDialog from '@/components/AlertDialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type AppLayoutProps = {
  userHandlers: UserHandlers;
};

const AppLayout = ({ userHandlers }: AppLayoutProps) => {
  const { t } = useTranslation();
  const {
    user,
    metaMap,
    currentMandalartId,
    currentMandalartMeta,
    currentTopicTree,
    handleMandalartMetaChange,
    handleTopicTreeChange,
    handleCreateMandalart,
    isOpenLeftDrawer,
    openLeftDrawer,
    closeLeftDrawer,
    handleSelectMandalart,
    handleDeleteMandalart,
    handleRenameMandalart,
    handleResetMandalart,
    handleCreateMandalartFromDrawer,
    isOpenRightDrawer,
    openRightDrawer,
    closeRightDrawer,
    isOpenSignInDialog,
    openSignInDialog,
    closeSignInDialog,
    handleSignIn,
    handleSignOut,
    isOpenAlert,
    alertContent,
    closeAlert,
  } = useAppLayoutState(userHandlers);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <Header
        user={user}
        onOpenSignInUI={openSignInDialog}
        onSignOut={handleSignOut}
        onOpenLeftDrawer={openLeftDrawer}
        onOpenRightDrawer={openRightDrawer}
        className="w-[calc(var(--size-content-width)+1em)] min-w-[calc(var(--size-content-min-width)+1em)]"
      />
      <Separator />
      <div className="flex h-full w-full flex-col overflow-auto [scrollbar-gutter:stable_both-edges]">
        {metaMap.size === 0 ? (
          <Button
            variant="ghost"
            className="m-auto gap-2 text-2xl"
            onClick={handleCreateMandalart}
          >
            {/* text-2xl 버튼에서 기본 아이콘 크기(16px)가 너무 작으므로 명시적 크기 지정 */}
            <Plus className="size-8" data-icon="inline-start" />
            {t('mandalart.new')}
          </Button>
        ) : currentMandalartId && currentMandalartMeta && currentTopicTree ? (
          <MandalartView
            mandalartId={currentMandalartId}
            meta={currentMandalartMeta}
            topicTree={currentTopicTree}
            onMandalartMetaChange={handleMandalartMetaChange}
            onTopicTreeChange={handleTopicTreeChange}
            className="mx-auto my-auto w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] py-2"
          />
        ) : null}
      </div>
      <Suspense fallback={null}>
        <MandalartListDrawer
          isOpen={isOpenLeftDrawer}
          metaMap={metaMap}
          selectedMandalartId={currentMandalartId}
          onSelectMandalart={handleSelectMandalart}
          onDeleteMandalart={handleDeleteMandalart}
          onRenameMandalart={handleRenameMandalart}
          onResetMandalart={handleResetMandalart}
          onCreateMandalart={handleCreateMandalartFromDrawer}
          onClose={closeLeftDrawer}
        />
        <SettingsDrawer isOpen={isOpenRightDrawer} onClose={closeRightDrawer} />
        <SignInDialog
          isOpen={isOpenSignInDialog}
          onClose={closeSignInDialog}
          onSignIn={handleSignIn}
        />
      </Suspense>
      <AlertDialog isOpen={isOpenAlert} message={alertContent} onClose={closeAlert} />
    </div>
  );
};

export default AppLayout;
