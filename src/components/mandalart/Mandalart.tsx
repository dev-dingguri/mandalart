import { useEffect, useState } from 'react';
import TopicsView from '../topicsView/TopicsView';
import styles from './Mandalart.module.css';
import { User } from 'firebase/auth';
import authService from '../../service/authService';
import Header from '../header/Header';
import TopicsViewTypeToggle from '../topicsViewTypeToggle/TopicsViewTypeToggle';
import SignInModal from '../signInModal/SignInModal';
import Aside from '../aside/Aside';
import mandalartRepository from '../../service/mandalartRepository';
import { MandalartMetadata } from '../../type/MandalartMetadata';

const Mandalart = () => {
  const [user, setUser] = useState<User | null>(null);
  const [metadataMap, setMetadataMap] = useState(
    new Map<string, MandalartMetadata>()
  );
  const [selectedMandalartId, setSelectedMandalartId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAllView, setIsAllView] = useState(true);
  const [isShowAside, setIsShowAside] = useState(false);
  const [isShowSignInModal, setIsShowSignInModal] = useState(false);

  const showAside = () => setIsShowAside(true);
  const hideAside = () => setIsShowAside(false);

  const showSignInModal = () => setIsShowSignInModal(true);
  const hideSignInModal = () => setIsShowSignInModal(false);
  const handleSignIn = (providerid: string) => authService.signIn(providerid);
  const handleSignOut = () => authService.signOut();

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
        if (userCred?.user) {
          console.log('login success');
        }
      })
      .catch((e) => {
        console.log(`errorCode=${e.code} errorMessage=${e.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
              <div className={styles.container}>
                {/* mandalart title */}
                <TopicsView
                  isAllView={isAllView}
                  user={user}
                  mandalartId={selectedMandalartId} // todo: 유효하지 않은(e.g. 삭제) mandalartId가 입력될때 처리
                />
                <div className={styles.bottom}>
                  <TopicsViewTypeToggle
                    isAllView={isAllView}
                    onToggle={(isAllView) => setIsAllView(isAllView)}
                  />
                </div>
              </div>
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
                const mandalartId = user
                  ? mandalartRepository.newMandalart(user.uid)
                  : null;
                mandalartId && setSelectedMandalartId(mandalartId);
              }}
              onClose={hideAside}
            />
          </section>
          <SignInModal
            isShow={isShowSignInModal}
            onClose={hideSignInModal}
            onSignIn={handleSignIn}
          />
        </>
      )}
    </>
  );
};

export default Mandalart;
