import { useEffect, useState } from 'react';
import TopicsView from 'components/topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from 'service/authService';
import Header from 'components/header/Header';
import TopicsViewTypeToggle from 'components/topicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from 'components/signInModal/SignInModal';
import Aside from 'components/aside/Aside';
import mandalartRepository from 'service/mandalartRepository';
import { MandalartMetadata } from 'types/MandalartMetadata';
import { TopicNode, parseTopicNode, cloneTopicNode } from 'types/TopicNode';
import {
  TABLE_SIZE,
  TABLE_CENTER_IDX,
  STORAGE_KEY_TOPIC_TREE,
} from 'common/const';
import NoContentNotice from 'components/noContentNotice/NoContentNotice';
import TextEditor from 'components/textEditor/TextEditor';
import Alert from 'components/alert/Alert';

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
  const [user, setUser] = useState<User | null>(null);
  const [metadataMap, setMetadataMap] = useState(
    new Map<string, MandalartMetadata>()
  );
  const [selectedMandalartId, setSelectedMandalartId] = useState('');
  const [topicTree, setTopicTree] = useState(initialTopicTree);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllView, setIsAllView] = useState(true);
  const [isShowAside, setIsShowAside] = useState(false);
  const [isShowSignInModal, setIsShowSignInModal] = useState(false);
  const [isShowTitleEditor, setIsShowTitleEditor] = useState(false);
  const [isShowAlert, setIsShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAside = () => setIsShowAside(true);
  const hideAside = () => setIsShowAside(false);

  const showSignInModal = () => setIsShowSignInModal(true);
  const hideSignInModal = () => setIsShowSignInModal(false);
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

  const showTitleEditor = () => setIsShowTitleEditor(true);
  const hideTitleEditor = () => setIsShowTitleEditor(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsShowAlert(true);
  };
  const hideAlert = () => {
    setAlertMessage('');
    setIsShowAlert(false);
  };

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    authService
      .getRedirectResult()
      .then((userCred) => {
        const user = userCred?.user;
        if (user) {
          console.log('login success');
          if (isAnyTopicChanged(topicTree)) {
            const mandalartId = mandalartRepository.newMandalart(user.uid);
            if (mandalartId) {
              mandalartRepository.saveTopics(user.uid, mandalartId, topicTree);
              setSelectedMandalartId(mandalartId);
            }
          }
        }
      })
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [topicTree]);

  useEffect(() => {
    if (user) {
      const stopSync = mandalartRepository.syncMetadata(
        user.uid,
        (metadataMap) => {
          setMetadataMap(metadataMap);
          if (!metadataMap.has(selectedMandalartId)) {
            const lastId = Array.from(metadataMap.keys()).pop();
            console.log(lastId);
            setSelectedMandalartId(lastId ? lastId : '');
          }
        }
      );
      return () => {
        stopSync();
      };
    }
  }, [user, selectedMandalartId]);

  useEffect(() => {
    if (user && selectedMandalartId.length) {
      const stopSync = mandalartRepository.syncTopics(
        user.uid,
        selectedMandalartId,
        (topicTree: TopicNode) => {
          setTopicTree(topicTree);
        }
      );
      return () => {
        stopSync();
      };
    }
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
                isSignIn={user !== null}
                onSignInClick={showSignInModal}
                onSignOutClick={handleSignOut}
                onAsideClick={showAside}
                onEtcClick={() => {}}
              />
            </div>
            <div className={styles.scrollArea}>
              {user && metadataMap.size === 0 ? (
                <NoContentNotice
                  onNewMandalart={() => {
                    const mandalartId = user
                      ? mandalartRepository.newMandalart(user.uid)
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
                      if (user) {
                        mandalartRepository.saveTopics(
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
            <Aside
              isShow={isShowAside}
              mandalartMetadataMap={metadataMap}
              selectedMandalartId={selectedMandalartId}
              onSelectMandalart={(mandalartId) =>
                setSelectedMandalartId(mandalartId)
              }
              onDeleteMandalart={(mandalartId) => {
                user &&
                  mandalartRepository.removeMandalart(user.uid, mandalartId);
              }}
              onRenameMandalart={(mandalartId, name) => {
                user &&
                  mandalartRepository.saveMetadata(user.uid, mandalartId, {
                    title: name,
                  });
              }}
              onNewMandalart={() => {
                if (user) {
                  const mandalartId = mandalartRepository.newMandalart(
                    user.uid
                  );
                  mandalartId && setSelectedMandalartId(mandalartId);
                } else {
                  showAlert('Login is required to add a new mandalart.');
                }
              }}
              onClose={hideAside}
            />
          </section>
          <SignInModal
            isShow={isShowSignInModal}
            onClose={hideSignInModal}
            onSignIn={handleSignIn}
          />
          <TextEditor
            isShow={isShowTitleEditor}
            value={title ? title : ''}
            onClose={hideTitleEditor}
            onEnter={(name) => {
              user &&
                mandalartRepository.saveMetadata(
                  user.uid,
                  selectedMandalartId,
                  {
                    title: name,
                  }
                );
              hideTitleEditor();
            }}
          />
          <Alert
            isShow={isShowAlert}
            message={alertMessage}
            onClose={hideAlert}
          />
        </>
      )}
    </>
  );
};

export default Mandalart;
