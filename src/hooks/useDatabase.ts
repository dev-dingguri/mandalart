import { useFirebaseDatabase } from 'contexts/FirebaseSdksContext';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { useMemo } from 'react';

const useDatabase = <T>(parent: string) => {
  const db = useFirebaseDatabase();

  return useMemo(
    () => ({
      push: (value: T) => push(ref(db, parent), value),
      set: (key: string, value: T) => set(ref(db, `${parent}/${key}`), value),
      remove: (key: string) => remove(ref(db, `${parent}/${key}`)),
      subscribe: (
        key: string,
        updateCallback: (value: T) => void,
        cancelCallback?: (error: Error) => void
      ) => {
        return onValue(
          ref(db, `${parent}/${key}`),
          (snapshot) => {
            const value: T | null = snapshot.val();
            value && updateCallback(value);
          },
          cancelCallback
        );
      },
      subscribeList: (
        updateCallback: (list: Map<string, T>) => void,
        cancelCallback?: (error: Error) => void
      ) => {
        return onValue(
          ref(db, `${parent}`),
          (snapshot) => {
            const map = new Map<string, T>();
            snapshot.forEach((child) => {
              const key = child.key;
              const val: T | null = child.val();
              if (key && val) {
                map.set(key, val);
              }
            });
            updateCallback(map);
          },
          cancelCallback
        );
      },
    }),
    [parent, db]
  );
};

export default useDatabase;
