import { useEffect, useState } from 'react';
import TopicsView from 'components/topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from 'services/authService';
import Header from 'components/header/Header';
import TopicsViewTypeToggle from 'components/topicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from 'components/signInModal/SignInModal';
import LeftAside from 'components/leftAside/LeftAside';
import repository from 'services/mandalartRepository';
import { MandalartMetadata } from 'types/MandalartMetadata';
import { TopicNode, parseTopicNode } from 'types/TopicNode';
import { TABLE_SIZE, STORAGE_KEY_TOPIC_TREE } from 'constants/constants';
import NoMandalartNotice from 'components/noMandalartNotice/NoMandalartNotice';
import TextEditor from 'components/textEditor/TextEditor';
import Alert from 'components/alert/Alert';
import RightAside from 'components/rightAside/RightAside';
import useUser from 'hooks/useUser';
import useMandalarts from 'hooks/useMandalarts';
import useTopics from 'hooks/useTopics';
import usePrevious from 'hooks/usePrevious';
import useBoolean from 'hooks/useBoolean';

const isAnyTopicChanged = (topicTree: TopicNode): boolean => {
  if (topicTree) {
    if (topicTree.text !== '') {
      return true;
    }
    if (topicTree.children) {
      for (let i = 0; i < topicTree.children.length; ++i) {
        if (isAnyTopicChanged(topicTree.children[i])) {
          return true;
        }
      }
    }
  }
  return false;
};

const initialTopicTree = (() => {
  const saved = localStorage.getItem(STORAGE_KEY_TOPIC_TREE);
  return saved
    ? parseTopicNode(saved)
    : {
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
          text: '',
          children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
            text: '',
            children: [],
          })),
        })),
      };
})();

const Mandalart = () => {
  const [user, isLoading] = useUser(null);
  const prevUser = usePrevious<User | null>(user);
  const [metadataMap, setMetadataMap] = useMandalarts(
    new Map<string, MandalartMetadata>(),
    user
  );
  const [selectedMandalartId, setSelectedMandalartId] = useState<string | null>(
    null
  );
  const [topicTree, setTopicTree] = useTopics(
    initialTopicTree,
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
  const [isShownAlert, setIsShownAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => {
    authService.signOut();
    setMetadataMap(new Map<string, MandalartMetadata>());
    setSelectedMandalartId(null);
    setTopicTree({
      text: '',
      children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
          text: '',
          children: [],
        })),
      })),
    });
  };

  const handleShowAlert = (message: string) => {
    setAlertMessage(message);
    setIsShownAlert(true);
  };
  const handleCloseAlert = () => {
    setAlertMessage('');
    setIsShownAlert(false);
  };

  useEffect(() => {
    if (!user) return;

    if (!selectedMandalartId || !metadataMap.has(selectedMandalartId)) {
      const lastId = Array.from(metadataMap.keys()).pop();
      console.log(lastId);
      setSelectedMandalartId(lastId ? lastId : null);
    }
  }, [metadataMap, user, selectedMandalartId]);

  useEffect(() => {
    if (prevUser || !user) return;

    console.log('first run after sign in');
    if (isAnyTopicChanged(topicTree)) {
      const mandalartId = repository.newMandalart(user.uid);
      if (mandalartId) {
        repository.saveTopics(user.uid, mandalartId, topicTree);
        setSelectedMandalartId(mandalartId);
      }
    }
  }, [prevUser, user, topicTree]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

  const title = selectedMandalartId
    ? metadataMap.get(selectedMandalartId)?.title
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
              {user && metadataMap.size === 0 ? (
                <NoMandalartNotice
                  onNewMandalart={() => {
                    const mandalartId = user
                      ? repository.newMandalart(user.uid)
                      : null;
                    mandalartId && setSelectedMandalartId(mandalartId);
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
              mandalartMetadataMap={metadataMap}
              selectedMandalartId={selectedMandalartId}
              onSelectMandalart={(mandalartId) =>
                setSelectedMandalartId(mandalartId)
              }
              onDeleteMandalart={(mandalartId) => {
                user && repository.removeMandalart(user.uid, mandalartId);
              }}
              onRenameMandalart={(mandalartId, name) => {
                user &&
                  repository.saveMetadata(user.uid, mandalartId, {
                    title: name,
                  });
              }}
              onNewMandalart={() => {
                if (user) {
                  const mandalartId = repository.newMandalart(user.uid);
                  mandalartId && setSelectedMandalartId(mandalartId);
                } else {
                  handleShowAlert(
                    'Sign in is required to add a new Mandalart.'
                  );
                }
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
                repository.saveMetadata(user.uid, selectedMandalartId, {
                  title: name,
                });
              }
              closeTitleEditor();
            }}
          />
          <Alert
            isShown={isShownAlert}
            message={alertMessage}
            onClose={handleCloseAlert}
          />
        </>
      )}
    </>
  );
};

export default Mandalart;
