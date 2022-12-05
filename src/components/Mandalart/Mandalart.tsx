import { useState } from 'react';
import styles from './Mandalart.module.css';
import authService from 'services/authService';
import Header from 'components/Header/Header';
import TopicsViewTypeToggle from 'components/TopicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from 'components/SignInModal/SignInModal';
import TopicsView from 'components/TopicsView/TopicsView';
import LeftAside from 'components/LeftAside/LeftAside';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import { TABLE_SIZE } from 'constants/constants';
import NoMandalartNotice from 'components/NoMandalartNotice/NoMandalartNotice';
import TextEditor from 'components/TextEditor/TextEditor';
import RightAside from 'components/RightAside/RightAside';
import useUser from 'hooks/useUser';
import useBoolean from 'hooks/useBoolean';
import { useAlert } from 'contexts/AlertContext';
import useMandalarts from '../../hooks/useMandalarts';

export const DEFAULT_SNIPPET: Snippet = {
  title: 'Untitled',
};

export const EMPTY_TOPIC_TREE: TopicNode = {
  text: '',
  children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
    text: '',
    children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
      text: '',
      children: [],
    })),
  })),
};

const Mandalart = () => {
  const [user, isLoading] = useUser(null);
  const [
    snippetMap,
    currentMandalartId,
    currentTopicTree,
    updateSnippetMap,
    updateMandalartId,
    updateTopicTree,
    createMandalart,
    deleteMandalart,
    saveSnippet,
    saveTopics,
  ] = useMandalarts(
    user,
    new Map<string, Snippet>(),
    null,
    EMPTY_TOPIC_TREE,
    DEFAULT_SNIPPET,
    EMPTY_TOPIC_TREE
  );

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

  const title = currentMandalartId
    ? snippetMap.get(currentMandalartId)?.title
    : '';

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
              {user && snippetMap.size === 0 ? (
                <NoMandalartNotice
                  onCreateMandalart={() => {
                    if (!user) return;

                    createMandalart(
                      user.uid,
                      DEFAULT_SNIPPET,
                      EMPTY_TOPIC_TREE
                    );
                  }}
                />
              ) : (
                <div className={styles.container}>
                  {title && (
                    <h1 className={styles.title} onClick={showTitleEditor}>
                      {title}
                    </h1>
                  )}
                  <TopicsView
                    isAllView={isAllView}
                    topicTree={currentTopicTree}
                    onTopicTreeChange={(topicTree) => {
                      updateTopicTree(topicTree);
                      // todo: useEffect(() => {...}, [topicTree, user]); 에서 처리 검토
                      if (user && currentMandalartId) {
                        saveTopics(user.uid, currentMandalartId, topicTree);
                      }
                    }}
                  />
                  <div className={styles.bottom}>
                    <TopicsViewTypeToggle
                      isAllView={isAllView}
                      onToggle={(isAllView) => setIsAllView(isAllView)}
                    />
                  </div>
                </div>
              )}
            </div>
            <LeftAside
              isShown={isShownLeftAside}
              snippetMap={snippetMap}
              selectedMandalartId={currentMandalartId}
              onSelectMandalart={(mandalartId) =>
                updateMandalartId(mandalartId)
              }
              onDeleteMandalart={(mandalartId) => {
                user && deleteMandalart(user.uid, mandalartId);
              }}
              onRenameMandalart={(mandalartId, name) => {
                user &&
                  saveSnippet(user.uid, mandalartId, {
                    title: name,
                  });
              }}
              onCreateMandalart={() => {
                if (!user) {
                  showAlert('Sign in is required to add a new Mandalart.');
                  return;
                }
                createMandalart(user.uid, DEFAULT_SNIPPET, EMPTY_TOPIC_TREE);
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
            value={title ? title : ''}
            onClose={closeTitleEditor}
            onEnter={(name) => {
              if (user && currentMandalartId) {
                saveSnippet(user.uid, currentMandalartId, {
                  title: name,
                });
              }
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
