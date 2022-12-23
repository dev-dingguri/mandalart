import { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './Mandalart.module.css';
import authService from 'services/authService';
import Header from 'components/Header/Header';
import TopicsViewTypeToggle from 'components/TopicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from 'components/SignInModal/SignInModal';
import TopicsView from 'components/TopicsView/TopicsView';
import LeftAside from 'components/LeftAside/LeftAside';
import { DEFAULT_SNIPPET, DEFAULT_TOPIC_TREE } from 'constants/constants';
import NoMandalartNotice from 'components/NoMandalartNotice/NoMandalartNotice';
import TextEditor from 'components/TextEditor/TextEditor';
import RightAside from 'components/RightAside/RightAside';
import useUser from 'hooks/useUser';
import useBoolean from 'hooks/useBoolean';
import { useAlert } from 'contexts/AlertContext';
import useMandalarts from '../../hooks/useMandalarts';
import { Snippet } from '../../types/Snippet';
import {
  TMP_MANDALART_ID,
  MAX_MANDALART_TITLE_SIZE,
} from '../../constants/constants';
import Spinner from 'components/Spinner/Spinner';
import signInSessionStorage from '../../services/signInSessionStorage';
import { TopicNode } from '../../types/TopicNode';

const Mandalart = () => {
  const [user, isUserLoading, userError] = useUser(null);
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

  const [isAllView, setIsAllView] = useState(true);
  const [isShownLeftAside, { on: showLeftAside, off: closeLeftAside }] =
    useBoolean(false);
  const [isShownRightAside, { on: showRightAside, off: closeRightAside }] =
    useBoolean(false);
  const [isShownSignInModal, { on: showSignInModal, off: closeSignInModal }] =
    useBoolean(false);
  const [isShownTitleEditor, { on: showTitleEditor, off: closeTitleEditor }] =
    useBoolean(false);
  const { Alert, show: showAlert } = useAlert();

  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => authService.signOut();

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopics(user, currentMandalartId, topicTree);
    },
    [user, currentMandalartId, saveTopics]
  );

  const isLoading = isUserLoading || isMandalartsLoading;

  const title = useMemo(() => {
    if (!currentMandalartId) return '';
    const title = snippetMap.get(currentMandalartId)?.title;
    return title ? title : '';
  }, [snippetMap, currentMandalartId]);

  useEffect(() => {
    if (!userError) return;

    showAlert(`Couldn't sign in. Error: ${userError.message}`);
  }, [userError, showAlert]);

  useEffect(() => {
    if (!mandalartsError) return;

    showAlert('Failed Syncing cloud storage. You will be signed out');
    authService.signOut();
  }, [mandalartsError, showAlert]);

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

  return (
    <section className={styles.mandalart}>
      {isLoading ? (
        <Spinner className={styles.spinner} />
      ) : (
        <>
          <div className={styles.header}>
            <Header
              isSignedIn={user !== null}
              onShowSignInUI={showSignInModal}
              onSignOut={handleSignOut}
              onShowLeftAside={showLeftAside}
              onShowRightAside={showRightAside}
            />
          </div>
          <div className={styles.scrollArea}>
            {snippetMap.size === 0 ? (
              <NoMandalartNotice
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
            ) : currentTopicTree ? (
              <div className={styles.container}>
                <div className={styles.titleBar}>
                  <p className={styles.draft}>
                    {currentMandalartId === TMP_MANDALART_ID && '(Draft)'}
                  </p>
                  <h1 className={styles.title} onClick={showTitleEditor}>
                    {title}
                  </h1>
                </div>
                <TopicsView
                  isAllView={isAllView}
                  topicTree={currentTopicTree}
                  onTopicTreeChange={handleTopicTreeChange}
                />
                <div className={styles.bottom}>
                  <TopicsViewTypeToggle
                    isAllView={isAllView}
                    onToggle={(isAllView) => setIsAllView(isAllView)}
                  />
                </div>
              </div>
            ) : null}
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
          <TextEditor
            isShown={isShownTitleEditor}
            initialText={title}
            maxText={MAX_MANDALART_TITLE_SIZE}
            onClose={closeTitleEditor}
            onSubmit={(name) => {
              saveSnippet(user, currentMandalartId, {
                title: name,
              });
            }}
          />
          <Alert />
        </>
      )}
    </section>
  );
};

export default Mandalart;
