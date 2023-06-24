import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { createContext, useContext, PropsWithChildren, useMemo } from 'react';

type FirebaseSdks = {
  firebaseAuth: Auth;
  firebaseDatabase: Database;
};

const FirebaseSdksContext = createContext<FirebaseSdks | null>(null);

type FirebaseAppProviderProps = {
  firebaseConfig: FirebaseOptions;
};

export const FirebaseSdksProvider = ({
  firebaseConfig,
  children,
}: PropsWithChildren<FirebaseAppProviderProps>) => {
  const firebaseApp = useMemo(
    () => initializeApp(firebaseConfig),
    [firebaseConfig]
  );
  const sdks = useMemo(
    () => ({
      firebaseAuth: getAuth(firebaseApp),
      firebaseDatabase: getDatabase(firebaseApp),
    }),
    [firebaseApp]
  );

  return (
    <FirebaseSdksContext.Provider value={{ ...sdks }}>
      {children}
    </FirebaseSdksContext.Provider>
  );
};

const useFirebaseSdks = () => {
  const firebaseSdks = useContext(FirebaseSdksContext);
  if (!firebaseSdks) {
    throw new Error(
      'Cannot use firebase SDK. Please ensure the component is wrapped in a FirebaseSdksProvider.'
    );
  }
  return { ...firebaseSdks };
};

export const useFirebaseAuth = () => useFirebaseSdks().firebaseAuth;
export const useFirebaseDatabase = () => useFirebaseSdks().firebaseDatabase;
