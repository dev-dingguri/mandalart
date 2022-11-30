import { useEffect, useState } from 'react';
import TopicsView from 'components/topicsView/TopicsView';
import styles from './Mandalart.module.css';
import authService from 'services/authService';
import Header from 'components/header/Header';
import TopicsViewTypeToggle from 'components/topicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from 'components/signInModal/SignInModal';
import LeftAside from 'components/leftAside/LeftAside';
import repository from 'services/mandalartRepository';
import { Snippet } from 'types/Snippet';
import { TopicNode, parseTopicNode } from 'types/TopicNode';
import { TABLE_SIZE, STORAGE_KEY_TOPIC_TREE } from 'constants/constants';
import NoMandalartNotice from 'components/noMandalartNotice/NoMandalartNotice';
import TextEditor from 'components/textEditor/TextEditor';
import RightAside from 'components/rightAside/RightAside';
import useUser from 'hooks/useUser';
import useSnippets from 'hooks/useSnippets';
import useTopics from 'hooks/useTopics';
import useBoolean from 'hooks/useBoolean';
import { useAlert } from 'contexts/AlertContext';
import { isEqual } from 'lodash';

const emptyTopicTree = {
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
  const [snippetMap, setSnippetMap] = useSnippets(
    new Map<string, Snippet>(),
    user
  );
  const [selectedMandalartId, setSelectedMandalartId] = useState<string | null>(
    null
  );
  const [topicTree, setTopicTree] = useTopics(
    emptyTopicTree,
    user,
    selectedMandalartId
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
  const handleSignOut = () => {
    authService.signOut();
    setSnippetMap(new Map<string, Snippet>());
    setSelectedMandalartId(null);
    setTopicTree(emptyTopicTree);
  };

  useEffect(() => {
    if (!user) return;

    if (!selectedMandalartId || !snippetMap.has(selectedMandalartId)) {
      const lastId = Array.from(snippetMap.keys()).pop();
      console.log(lastId);
      setSelectedMandalartId(lastId ? lastId : null);
    }
  }, [snippetMap, user, selectedMandalartId]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
    if (!saved) return;

    const topicTree = parseTopicNode(saved) as TopicNode;
    if (!isAnyTopicChanged(topicTree)) return;

    if (user) {
      localStorage.removeItem(STORAGE_KEY_TOPIC_TREE);
      repository
        .newMandalart(user.uid, topicTree)
        .then((mandalartId) => {
          mandalartId && setSelectedMandalartId(mandalartId);
        })
        .catch(() => {
          localStorage.setItem(STORAGE_KEY_TOPIC_TREE, saved);
        });
    } else {
      setTopicTree(topicTree);
    }
  }, [user, setTopicTree]);

  useEffect(() => {
    if (user) return;
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [user, topicTree]);

  const title = selectedMandalartId
    ? snippetMap.get(selectedMandalartId)?.title
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
                  onNewMandalart={() => {
                    if (!user) return;

                    repository
                      .newMandalart(user.uid, emptyTopicTree)
                      .then((mandalartId) => {
                        mandalartId && setSelectedMandalartId(mandalartId);
                      });
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
                    topicTree={topicTree}
                    onTopicTreeChange={(topicTree) => {
                      setTopicTree(topicTree);
                      // todo: useEffect(() => {...}, [topicTree, user]); 에서 처리 검토
                      if (user && selectedMandalartId) {
                        repository.saveTopics(
                          user.uid,
                          selectedMandalartId,
                          topicTree
                        );
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
              selectedMandalartId={selectedMandalartId}
              onSelectMandalart={(mandalartId) =>
                setSelectedMandalartId(mandalartId)
              }
              onDeleteMandalart={(mandalartId) => {
                user && repository.removeMandalart(user.uid, mandalartId);
              }}
              onRenameMandalart={(mandalartId, name) => {
                user &&
                  repository.saveSnippets(user.uid, mandalartId, {
                    title: name,
                  });
              }}
              onNewMandalart={() => {
                if (!user) {
                  showAlert('Sign in is required to add a new Mandalart.');
                  return;
                }
                repository
                  .newMandalart(user.uid, emptyTopicTree)
                  .then((mandalartId) => {
                    mandalartId && setSelectedMandalartId(mandalartId);
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
            value={title ? title : ''}
            onClose={closeTitleEditor}
            onEnter={(name) => {
              if (user && selectedMandalartId) {
                repository.saveSnippets(user.uid, selectedMandalartId, {
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

const isAnyTopicChanged = (topicTree: TopicNode) => {
  return !isEqual(topicTree, emptyTopicTree);
};

export default Mandalart;
