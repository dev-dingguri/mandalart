import { useMemo, useEffect, useCallback } from 'react';
import styles from './Main.module.css';
import authService from 'services/authService';
import Header from 'components/Header/Header';
import SignInModal from 'components/SignInModal/SignInModal';
import MandalartView from 'components/MandalartView/MandalartView';
import LeftAside from 'components/LeftAside/LeftAside';
import { DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE } from 'constants/constants';
import EmptyMandalarts from 'components/EmptyMandalarts/EmptyMandalarts';
import RightAside from 'components/RightAside/RightAside';
import useUser from 'hooks/useUser';
import useBoolean from 'hooks/useBoolean';
import { useAlert } from 'contexts/AlertContext';
import useMandalarts from '../../hooks/useMandalarts';
import { Snippet } from '../../types/Snippet';
import Spinner from 'components/Spinner/Spinner';
import signInSessionStorage from '../../services/signInSessionStorage';
import { TopicNode } from '../../types/TopicNode';
import { useTranslation } from 'react-i18next';

const Main = () => {
  const { user, isLoading: isUserLoading, error: userError } = useUser(null);
  const [
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    isMandalartsLoading,
    mandalartsError,
    updateMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
    uploadDraft,
  ] = useMandalarts(user, new Map<string, Snippet>(), null, null);

  const [isShownLeftAside, { on: showLeftAside, off: closeLeftAside }] =
    useBoolean(false);
  const [isShownRightAside, { on: showRightAside, off: closeRightAside }] =
    useBoolean(false);
  const [isShownSignInModal, { on: showSignInModal, off: closeSignInModal }] =
    useBoolean(false);
  const { Alert, show: showAlert } = useAlert();

  const { t } = useTranslation();

  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => authService.signOut();

  const handleSnippetChange = useCallback(
    (snippet: Snippet) => {
      saveSnippet(user, currentMandalartId, snippet);
    },
    [user, currentMandalartId, saveSnippet]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopics(user, currentMandalartId, topicTree);
    },
    [user, currentMandalartId, saveTopics]
  );

  const isLoading = isUserLoading || isMandalartsLoading;

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
    authService.signOut();
  }, [mandalartsError, showAlert, t]);

  useEffect(() => {
    if (!user || isLoading) return;
    const data = signInSessionStorage.read(user);
    if (!data || data.isTriedUploadDraft) return;

    uploadDraft(user).catch((e: Error) => {
      e && showAlert(e.message);
    });
    data.isTriedUploadDraft = true;
    signInSessionStorage.save(user, data);
  }, [user, isLoading, uploadDraft, showAlert]);

  return isLoading ? (
    <div className={styles.loading}>
      <Spinner className={styles.spinner} />
    </div>
  ) : (
    <section className={styles.main}>
      <div className={styles.header}>
        <Header
          user={user}
          onShowSignInUI={showSignInModal}
          onSignOut={handleSignOut}
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
                createMandalart(
                  user,
                  DEFAULT_SNIPPET,
                  DEFAULT_TOPIC_TREE
                ).catch((e: Error) => {
                  showAlert(e.message);
                });
              }}
            />
          )}
        </div>
      </div>
      <LeftAside
        isShown={isShownLeftAside}
        snippetMap={snippetMap}
        selectedMandalartId={currentMandalartId}
        onSelectMandalart={(mandalartId) => updateMandalartId(mandalartId)}
        onDeleteMandalart={(mandalartId) => {
          deleteMandalart(user, mandalartId);
        }}
        onRenameMandalart={(mandalartId, name) => {
          saveSnippet(user, mandalartId, {
            title: name,
          });
        }}
        onResetMandalart={(mandalartId) => {
          saveSnippet(user, mandalartId, DEFAULT_SNIPPET);
          saveTopics(user, mandalartId, DEFAULT_TOPIC_TREE);
        }}
        onCreateMandalart={() => {
          createMandalart(user, DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE).catch(
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
        onSignIn={handleSignIn}
      />
      <Alert />
    </section>
  );
};

export default Main;
