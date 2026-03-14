import {
  useMemo,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import Header from 'components/Header';
import SignInModal from 'components/SignInModal';
import MandalartView from 'components/MandalartView';
import LeftDrawer from 'components/LeftDrawer';
import { EMPTY_SNIPPET, EMPTY_TOPIC_TREE } from 'constants/constants';
import RightDrawer from 'components/RightDrawer';
import { Snippet } from '../types/Snippet';
import { TopicNode } from '../types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useAuthStore } from 'stores/useAuthStore';
import { useMandalartStore } from 'stores/useMandalartStore';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { BsPlus } from 'react-icons/bs';
import { useBoolean } from 'usehooks-ts';
import useModal from 'hooks/useModal';
import Alert from './Alert';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

type MainContentProps = {
  userHandlers: UserHandlers;
};

const MainContent = ({
  userHandlers: { user = null, error: userError = null },
}: MainContentProps) => {
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
    saveSnippet,
    saveTopicTree,
    uploadTemp,
  } = useMandalartStore();

  const {
    value: isOpenLeftDrawer,
    setTrue: openLeftDrawer,
    setFalse: closeLeftDrawer,
  } = useBoolean(false);
  const {
    value: isOpenRightDrawer,
    setTrue: openRightDrawer,
    setFalse: closeRightDrawer,
  } = useBoolean(false);
  const {
    value: isOpenSignInModal,
    setTrue: openSignInModal,
    setFalse: closeSignInModal,
  } = useBoolean(false);
  const {
    isOpen: isOpenAlert,
    open: openAlert,
    close: closeAlert,
    content: alertContent,
  } = useModal<string>();

  const { t } = useTranslation();

  const handleSnippetChange = useCallback(
    (snippet: Snippet) => {
      saveSnippet(currentMandalartId, snippet);
    },
    [currentMandalartId, saveSnippet]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentMandalartId, topicTree);
    },
    [currentMandalartId, saveTopicTree]
  );

  const currentSnippet = useMemo(() => {
    if (!currentMandalartId) return null;
    const snippet = snippetMap.get(currentMandalartId);
    return snippet ? snippet : null;
  }, [snippetMap, currentMandalartId]);

  const hasMandalart =
    snippetMap.size > 0 &&
    currentMandalartId !== null &&
    currentSnippet !== null &&
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Header
        user={user}
        onOpenSignInUI={openSignInModal}
        onSignOut={signOut}
        onOpenLeftDrawer={openLeftDrawer}
        onOpenRightDrawer={openRightDrawer}
        sx={{
          width: 'calc(var(--size-content-width) + 1em)',
          minWidth: 'calc(var(--size-content-min-width) + 1em)',
          '& .MuiToolbar-root': {
            padding: '0',
          },
        }}
      />
      <Divider flexItem />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          scrollbarGutter: 'stable both-edges',
        }}
      >
        {hasMandalart ? (
          <MandalartView
            mandalartId={currentMandalartId}
            snippet={currentSnippet}
            topicTree={currentTopicTree}
            onSnippetChange={handleSnippetChange}
            onTopicTreeChange={handleTopicTreeChange}
            sx={{
              width: 'var(--size-content-width)',
              minWidth: 'var(--size-content-min-width)',
              m: 'auto',
              p: '0.5em 0',
            }}
          />
        ) : (
          <Button
            startIcon={<BsPlus size="2rem" />}
            sx={{ fontSize: '1.5rem', m: 'auto' }}
            onClick={() => {
              createMandalart(EMPTY_SNIPPET, EMPTY_TOPIC_TREE).catch(
                (e: Error) => openAlert(e.message)
              );
            }}
          >
            {t('mandalart.new')}
          </Button>
        )}
        <Box sx={{ height: '4em' }} />
      </Box>
      <LeftDrawer
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
          saveSnippet(mandalartId, { title: name });
        }}
        onResetMandalart={(mandalartId) => {
          saveSnippet(mandalartId, EMPTY_SNIPPET);
          saveTopicTree(mandalartId, EMPTY_TOPIC_TREE);
        }}
        onCreateMandalart={() => {
          createMandalart(EMPTY_SNIPPET, EMPTY_TOPIC_TREE)
            .then(() => closeLeftDrawer())
            .catch((e: Error) => openAlert(e.message));
        }}
        onClose={closeLeftDrawer}
      />
      <RightDrawer isOpen={isOpenRightDrawer} onClose={closeRightDrawer} />
      <SignInModal
        isOpen={isOpenSignInModal}
        onClose={closeSignInModal}
        onSignIn={signIn}
      />
      <Alert isOpen={isOpenAlert} message={alertContent} onClose={closeAlert} />
    </Box>
  );
};

export default MainContent;
