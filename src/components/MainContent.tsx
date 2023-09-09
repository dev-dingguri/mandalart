import {
  useMemo,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
  useLayoutEffect,
} from 'react';
import Header from 'components/Header';
import SignInModal from 'components/SignInModal';
import MandalartView from 'components/MandalartView';
import LeftDrawer from 'components/LeftDrawer';
import { EMPTY_SNIPPET, EMPTY_TOPIC_TREE } from 'constants/constants';
import RightDrawer from 'components/RightDrawer';
import { useAlert } from 'contexts/AlertContext';
import { Snippet } from '../types/Snippet';
import { TopicNode } from '../types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import useAuth from 'hooks/useAuth';
import useSignInSession from 'hooks/useSignInSession';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { BsPlus } from 'react-icons/bs';
import { useBoolean } from 'usehooks-ts';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

export type MandalartsHandlers = {
  snippetMap: Map<string, Snippet>;
  currentMandalartId: string | null;
  currentTopicTree: TopicNode | null;
  error?: Error | null;
  selectMandalartId: Dispatch<SetStateAction<string | null>>;
  createMandalart: (snippet: Snippet, topicTree: TopicNode) => Promise<void>;
  deleteMandalart: (mandalartId: string | null) => Promise<void>;
  saveSnippet: (mandalartId: string | null, snippet: Snippet) => Promise<void>;
  saveTopicTree: (
    mandalartId: string | null,
    topicTree: TopicNode
  ) => Promise<void>;
  uploadTemp?: () => Promise<void>;
};

type MainContentProps = {
  userHandlers: UserHandlers;
  mandalartsHandlers: MandalartsHandlers;
};

const MainContent = ({
  userHandlers: { user = null, error: userError = null },
  mandalartsHandlers: {
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    error: mandalartsError = null,
    selectMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopicTree,
    uploadTemp,
  },
}: MainContentProps) => {
  const { signIn, signOut } = useAuth();
  const { getShouldUploadTemp, setShouldUploadTemp } = useSignInSession();

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
  const { Alert, open: openAlert } = useAlert();

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
    const shouldUploadTemp = !!user && getShouldUploadTemp(user);
    if (!shouldUploadTemp) return;
    if (!uploadTemp) return;
    setShouldUploadTemp(user, false);
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
        onSelectMandalart={(mandalartId) => selectMandalartId(mandalartId)}
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
          createMandalart(EMPTY_SNIPPET, EMPTY_TOPIC_TREE).catch((e: Error) =>
            openAlert(e.message)
          );
        }}
        onClose={closeLeftDrawer}
      />
      <RightDrawer isOpen={isOpenRightDrawer} onClose={closeRightDrawer} />
      <SignInModal
        isOpen={isOpenSignInModal}
        onClose={closeSignInModal}
        onSignIn={signIn}
      />
      <Alert />
    </Box>
  );
};

export default MainContent;
