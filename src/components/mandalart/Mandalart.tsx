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

const initialTopicTree = () => {
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
};

const Mandalart = () => {
  const [user, isLoading] = useUser(null);
  //const [user, setUser] = useState<User | null>(null);
  const [metadataMap, setMetadataMap] = useMandalarts(
    new Map<string, MandalartMetadata>(),
    user
  );
  // const [metadataMap, setMetadataMap] = useState(
  //   new Map<string, MandalartMetadata>()
  // );
  const [selectedMandalartId, setSelectedMandalartId] = useState('');
  const [topicTree, setTopicTree] = useState(initialTopicTree);
  //const [isLoading, setIsLoading] = useState(false);
  const [isAllView, setIsAllView] = useState(true);
  const [isShownLeftAside, setIsShownLeftAside] = useState(false);
  const [isShownRightAside, setIsShownRightAside] = useState(false);
  const [isShownSignInModal, setIsShownSignInModal] = useState(false);
  const [isShownTitleEditor, setIsShownTitleEditor] = useState(false);
  const [isShownAlert, setIsShownAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleShowLeftAside = () => setIsShownLeftAside(true);
  const handleCloseLeftAside = () => setIsShownLeftAside(false);
  const handleShowRightAside = () => setIsShownRightAside(true);
  const handleCloseRightAside = () => setIsShownRightAside(false);

  const handleShowSignInModal = () => setIsShownSignInModal(true);
  const handleCloseSignInModal = () => setIsShownSignInModal(false);
  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => {
    authService.signOut();
    setMetadataMap(new Map<string, MandalartMetadata>());
    setSelectedMandalartId('');
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

  const handleShowTitleEditor = () => setIsShownTitleEditor(true);
  const handleCloseTitleEditor = () => setIsShownTitleEditor(false);

  const handleShowAlert = (message: string) => {
    setAlertMessage(message);
    setIsShownAlert(true);
  };
  const handleCloseAlert = () => {
    setAlertMessage('');
    setIsShownAlert(false);
  };

  // useEffect(() => {
  //   authService.onAuthStateChange((user) => {
  //     setUser(user);
  //   });
  // }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   authService
  //     .getRedirectResult()
  //     .then((userCred) => {
  //       const user = userCred?.user;
  //       // 살려야함
  //       if (user) {
  //         console.log('login success');
  //         if (isAnyTopicChanged(topicTree)) {
  //           const mandalartId = repository.newMandalart(user.uid);
  //           if (mandalartId) {
  //             repository.saveTopics(user.uid, mandalartId, topicTree);
  //             setSelectedMandalartId(mandalartId);
  //           }
  //         }
  //       }
  //     })
  //     .catch((e) => {
  //       console.log(`errorCode=${e.code} errorMessage=${e.message}`);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, [topicTree]);

  // useEffect(() => {
  //   if (!user) {
  //     return;
  //   }
  //   const stopSync = repository.syncMetadata(user.uid, (metadataMap) => {
  //     setMetadataMap(metadataMap);
  //     // 살려야함
  //     // if (!metadataMap.has(selectedMandalartId)) {
  //     //   const lastId = Array.from(metadataMap.keys()).pop();
  //     //   console.log(lastId);
  //     //   setSelectedMandalartId(lastId ? lastId : '');
  //     // }
  //   });
  //   return () => stopSync();
  // }, [user, selectedMandalartId]);

  useEffect(() => {
    if (!user || selectedMandalartId.length === 0) {
      return;
    }
    const stopSync = repository.syncTopics(
      user.uid,
      selectedMandalartId,
      (topicTree: TopicNode) => {
        setTopicTree(topicTree);
      }
    );
    return () => stopSync();
  }, [user, selectedMandalartId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIC_TREE, JSON.stringify(topicTree));
  }, [topicTree]);

  const title = metadataMap.get(selectedMandalartId)?.title;

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
                onShowSignInUI={handleShowSignInModal}
                onSignOut={handleSignOut}
                onShowLeftAside={handleShowLeftAside}
                onShowRightAside={handleShowRightAside}
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
                    <h1
                      className={styles.title}
                      onClick={handleShowTitleEditor}
                    >
                      {title}
                    </h1>
                  )}
                  <TopicsView
                    isAllView={isAllView}
                    topicTree={topicTree}
                    onTopicTreeChange={(topicTree) => {
                      setTopicTree(topicTree);
                      // todo: useEffect(() => {...}, [topicTree, user]); 에서 처리 검토
                      if (user) {
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
              onClose={handleCloseLeftAside}
            />
            <RightAside
              isShown={isShownRightAside}
              onClose={handleCloseRightAside}
            />
          </section>
          <SignInModal
            isShown={isShownSignInModal}
            onClose={handleCloseSignInModal}
            onSignIn={handleSignIn}
          />
          <TextEditor
            isShown={isShownTitleEditor}
            value={title ? title : ''}
            onClose={handleCloseTitleEditor}
            onEnter={(name) => {
              user &&
                repository.saveMetadata(user.uid, selectedMandalartId, {
                  title: name,
                });
              handleCloseTitleEditor();
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
