import {
  useMemo,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
} from 'react';
import styles from './MainContents.module.css';
import Header from 'components/Header/Header';
import SignInModal from 'components/SignInModal/SignInModal';
import MandalartView from 'components/MandalartView/MandalartView';
import LeftAside from 'components/LeftAside/LeftAside';
import { DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE } from 'constants/constants';
import EmptyMandalarts from 'components/EmptyMandalarts/EmptyMandalarts';
import RightAside from 'components/RightAside/RightAside';
import useBoolean from 'hooks/useBoolean';
import { useAlert } from 'contexts/AlertContext';
import { Snippet } from '../../types/Snippet';
import { TopicNode } from '../../types/TopicNode';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import useAuth from 'hooks/useAuth';

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
  saveTopics: (
    mandalartId: string | null,
    topicTree: TopicNode
  ) => Promise<void>;
  uploadDraft?: () => Promise<void>;
};

type MainContentsProps = {
  userHandlers: UserHandlers;
  mandalartsHandlers: MandalartsHandlers;
};

const MainContents = ({
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
    saveTopics,
    uploadDraft,
  },
}: MainContentsProps) => {
  const [isShownLeftAside, { on: showLeftAside, off: closeLeftAside }] =
    useBoolean(false);
  const [isShownRightAside, { on: showRightAside, off: closeRightAside }] =
    useBoolean(false);
  const [isShownSignInModal, { on: showSignInModal, off: closeSignInModal }] =
    useBoolean(false);
  const { Alert, show: showAlert } = useAlert();

  const { t } = useTranslation();

  const { signIn, signOut } = useAuth();

  const handleSnippetChange = useCallback(
    (snippet: Snippet) => {
      saveSnippet(currentMandalartId, snippet);
    },
    [currentMandalartId, saveSnippet]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopics(currentMandalartId, topicTree);
    },
    [currentMandalartId, saveTopics]
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

    showAlert(t('auth.errors.signIn.default', { detail: userError.message }));
  }, [userError, showAlert, t]);

  useEffect(() => {
    if (!mandalartsError) return;

    showAlert(t('mandalart.errors.sync.default'));
    signOut();
  }, [mandalartsError, showAlert, signOut, t]);

  useEffect(() => {
    if (!uploadDraft) return;
    uploadDraft().catch((e: Error) => {
      e && showAlert(e.message);
    });
  }, [uploadDraft, showAlert]);

  return (
    <section className={styles.mainCommon}>
      <div className={styles.header}>
        <Header
          user={user}
          onShowSignInUI={showSignInModal}
          onSignOut={signOut}
          onShowLeftAside={showLeftAside}
          onShowRightAside={showRightAside}
        />
      </div>
      <div className={styles.scrollArea}>
        <div className={styles.container}>
          {hasMandalart ? (
            <MandalartView
              mandalartId={currentMandalartId}
              snippet={currentSnippet}
              topicTree={currentTopicTree}
              onSnippetChange={handleSnippetChange}
              onTopicTreeChange={handleTopicTreeChange}
            />
          ) : (
            <EmptyMandalarts
              onCreateMandalart={() => {
                createMandalart(DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE).catch(
                  (e: Error) => {
                    showAlert(e.message);
                  }
                );
              }}
            />
          )}
        </div>
      </div>
      <LeftAside
        isShown={isShownLeftAside}
        snippetMap={snippetMap}
        selectedMandalartId={currentMandalartId}
        onSelectMandalart={(mandalartId) => selectMandalartId(mandalartId)}
        onDeleteMandalart={(mandalartId) => {
          deleteMandalart(mandalartId);
        }}
        onRenameMandalart={(mandalartId, name) => {
          saveSnippet(mandalartId, {
            title: name,
          });
        }}
        onResetMandalart={(mandalartId) => {
          saveSnippet(mandalartId, DEFAULT_SNIPPET);
          saveTopics(mandalartId, DEFAULT_TOPIC_TREE);
        }}
        onCreateMandalart={() => {
          createMandalart(DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE).catch(
            (e: Error) => {
              showAlert(e.message);
            }
          );
        }}
        onClose={closeLeftAside}
      />
      <RightAside isShown={isShownRightAside} onClose={closeRightAside} />
      <SignInModal
        isShown={isShownSignInModal}
        onClose={closeSignInModal}
        onSignIn={signIn}
      />
      <Alert />
    </section>
  );
};

export default MainContents;
