import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { createContext, useContext, PropsWithChildren, useMemo } from 'react';

type FirebaseSdksContextType = {
  firebaseAuth: Auth;
  firebaseDatabase: Database;
};

const FirebaseSdksContext = createContext<FirebaseSdksContextType | null>(null);

type FirebaseAppProviderProps = {
  firebaseConfig: FirebaseOptions;
};

export const FirebaseSdksProvider = ({
  firebaseConfig,
  children,
}: PropsWithChildren<FirebaseAppProviderProps>) => {
  const sdks = useMemo(() => {
    const firebaseApp = initializeApp(firebaseConfig);
    return {
      firebaseAuth: getAuth(firebaseApp),
      firebaseDatabase: getDatabase(firebaseApp),
    };
  }, [firebaseConfig]);

  return (
    <FirebaseSdksContext.Provider value={{ ...sdks }}>
      {children}
    </FirebaseSdksContext.Provider>
  );
};

const useFirebaseSdks = () => {
  const context = useContext(FirebaseSdksContext);
  if (!context) {
    throw new Error(
      'Cannot use firebase SDK. Must be used within a FirebaseSdksProvider.'
    );
  }
  return context;
};

export const useFirebaseAuth = () => useFirebaseSdks().firebaseAuth;
export const useFirebaseDatabase = () => useFirebaseSdks().firebaseDatabase;
