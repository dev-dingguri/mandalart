import { useMemo, useEffect, useCallback, useLayoutEffect, useState } from 'react';
import Header from 'components/Header';
import SignInDialog from 'components/SignInDialog';
import MandalartView from 'components/MandalartView';
import MandalartListDrawer from 'components/MandalartListDrawer';
import { EMPTY_META, EMPTY_TOPIC_TREE } from 'constants/constants';
import SettingsDrawer from 'components/SettingsDrawer';
import { MandalartMeta } from '../types/MandalartMeta';
import { TopicNode } from '../types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useAuthStore } from 'stores/useAuthStore';
import { useMandalartStore } from 'stores/useMandalartStore';
import { Plus } from 'lucide-react';
import useModal from 'hooks/useModal';
import AlertDialog from './AlertDialog';
import { Separator } from 'components/ui/separator';
import { Button } from 'components/ui/button';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

type AppLayoutProps = {
  userHandlers: UserHandlers;
};

const AppLayout = ({
  userHandlers: { user = null, error: userError = null },
}: AppLayoutProps) => {
  const { signIn, signOut, getShouldUploadTemp, setShouldUploadTemp } =
    useAuthStore();
  const {
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    error: mandalartsError,
    selectMandalart: selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveMandalartMeta,
    saveTopicTree,
    uploadTemp,
  } = useMandalartStore();

  const [isOpenLeftDrawer, setIsOpenLeftDrawer] = useState(false);
  const openLeftDrawer = () => setIsOpenLeftDrawer(true);
  const closeLeftDrawer = () => setIsOpenLeftDrawer(false);

  const [isOpenRightDrawer, setIsOpenRightDrawer] = useState(false);
  const openRightDrawer = () => setIsOpenRightDrawer(true);
  const closeRightDrawer = () => setIsOpenRightDrawer(false);

  const [isOpenSignInDialog, setIsOpenSignInDialog] = useState(false);
  const openSignInDialog = () => setIsOpenSignInDialog(true);
  const closeSignInDialog = () => setIsOpenSignInDialog(false);
  const {
    isOpen: isOpenAlert,
    open: openAlert,
    close: closeAlert,
    content: alertContent,
  } = useModal<string>();

  const { t } = useTranslation();

  const handleMandalartMetaChange = useCallback(
    (snippet: MandalartMeta) => {
      saveMandalartMeta(currentMandalartId, snippet);
    },
    [currentMandalartId, saveMandalartMeta]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentMandalartId, topicTree);
    },
    [currentMandalartId, saveTopicTree]
  );

  const currentMandalartMeta = useMemo(() => {
    if (!currentMandalartId) return null;
    const snippet = snippetMap.get(currentMandalartId);
    return snippet ? snippet : null;
  }, [snippetMap, currentMandalartId]);

  const hasMandalart =
    snippetMap.size > 0 &&
    currentMandalartId !== null &&
    currentMandalartMeta !== null &&
    currentTopicTree !== null;

  useEffect(() => {
    if (!userError) return;

    openAlert(t('auth.errors.signIn.default', { detail: userError.message }));
  }, [userError, openAlert, t]);

  useEffect(() => {
    if (!mandalartsError) return;

    openAlert(t('mandalart.errors.sync.default'));
    signOut();
  }, [mandalartsError, openAlert, signOut, t]);

  useLayoutEffect(() => {
    const shouldUploadTemp = !!user && getShouldUploadTemp();
    if (!shouldUploadTemp) return;
    setShouldUploadTemp(false);
    uploadTemp().catch((e: Error) => {
      e && openAlert(e.message);
    });
  }, [user, getShouldUploadTemp, setShouldUploadTemp, uploadTemp, openAlert]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <Header
        user={user}
        onOpenSignInUI={openSignInDialog}
        onSignOut={signOut}
        onOpenLeftDrawer={openLeftDrawer}
        onOpenRightDrawer={openRightDrawer}
        className="w-[calc(var(--size-content-width)+1em)] min-w-[calc(var(--size-content-min-width)+1em)]"
      />
      <Separator />
      <div className="flex h-full w-full flex-col overflow-auto [scrollbar-gutter:stable_both-edges]">
        {hasMandalart ? (
          <MandalartView
            mandalartId={currentMandalartId}
            snippet={currentMandalartMeta}
            topicTree={currentTopicTree}
            onMandalartMetaChange={handleMandalartMetaChange}
            onTopicTreeChange={handleTopicTreeChange}
            className="mx-auto w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] py-2"
          />
        ) : (
          <Button
            variant="ghost"
            className="m-auto gap-2 text-2xl"
            onClick={() => {
              createMandalart(EMPTY_META, EMPTY_TOPIC_TREE).catch(
                (e: Error) => openAlert(e.message)
              );
            }}
          >
            <Plus className="size-8" />
            {t('mandalart.new')}
          </Button>
        )}
        <div className="h-16" />
      </div>
      <MandalartListDrawer
        isOpen={isOpenLeftDrawer}
        snippetMap={snippetMap}
        selectedMandalartId={currentMandalartId}
        onSelectMandalart={(mandalartId) => {
          selectMandalartId(mandalartId);
          closeLeftDrawer();
        }}
        onDeleteMandalart={(mandalartId) => {
          deleteMandalart(mandalartId);
        }}
        onRenameMandalart={(mandalartId, name) => {
          saveMandalartMeta(mandalartId, { title: name });
        }}
        onResetMandalart={(mandalartId) => {
          saveMandalartMeta(mandalartId, EMPTY_META);
          saveTopicTree(mandalartId, EMPTY_TOPIC_TREE);
        }}
        onCreateMandalart={() => {
          createMandalart(EMPTY_META, EMPTY_TOPIC_TREE)
            .then(() => closeLeftDrawer())
            .catch((e: Error) => openAlert(e.message));
        }}
        onClose={closeLeftDrawer}
      />
      <SettingsDrawer isOpen={isOpenRightDrawer} onClose={closeRightDrawer} />
      <SignInDialog
        isOpen={isOpenSignInDialog}
        onClose={closeSignInDialog}
        onSignIn={signIn}
      />
      <AlertDialog isOpen={isOpenAlert} message={alertContent} onClose={closeAlert} />
    </div>
  );
};

export default AppLayout;
