import { useState, useCallback, useMemo } from 'react';
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
import { TMP_MANDALART_ID } from '../../constants/constants';

const Mandalart = () => {
  const [user, isLoading] = useUser(null);
  const [
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    updateMandalartId,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
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
  const { Alert, showAlert } = useAlert();

  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => authService.signOut();

  const title = useMemo(() => {
    if (!currentMandalartId) return '';
    const title = snippetMap.get(currentMandalartId)?.title;
    return title ? title : '';
  }, [snippetMap, currentMandalartId]);

  return (
    <>
      {isLoading ? (
        <h1 className={styles.loading}>Loading...</h1>
      ) : (
        <>
          <section className={styles.mandalart}>
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
                    onTopicTreeChange={(topicTree) => {
                      saveTopics(user, currentMandalartId, topicTree);
                    }}
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
              onSelectMandalart={(mandalartId) =>
                updateMandalartId(mandalartId)
              }
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
                createMandalart(
                  user,
                  DEFAULT_SNIPPET,
                  DEFAULT_TOPIC_TREE
                ).catch((e: Error) => {
                  showAlert(e.message);
                });
              }}
              onClose={closeLeftAside}
            />
            <RightAside isShown={isShownRightAside} onClose={closeRightAside} />
          </section>
          <SignInModal
            isShown={isShownSignInModal}
            onClose={closeSignInModal}
            onSignIn={handleSignIn}
          />
          <TextEditor
            isShown={isShownTitleEditor}
            value={title}
            onClose={closeTitleEditor}
            onEnter={(name) => {
              saveSnippet(user, currentMandalartId, {
                title: name,
              });
              closeTitleEditor();
            }}
          />
          <Alert />
        </>
      )}
    </>
  );
};

export default Mandalart;
