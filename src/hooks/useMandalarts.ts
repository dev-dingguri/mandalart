import { useEffect, useState } from 'react';
import { MandalartMetadata } from 'types/MandalartMetadata';
import { User } from 'firebase/auth';
import repository from 'services/mandalartRepository';
import useBoolean from 'hooks/useBoolean';

const useMandalarts = (
  initialMandalarts: Map<string, MandalartMetadata>,
  user: User | null
) => {
  const [mandalarts, setMandalarts] = useState(initialMandalarts);
  const [isLoading, { on: startLoading, off: endLoading }] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    startLoading();
    setError(null);
    const stopSync = repository.syncMetadata(
      user.uid,
      (mandalarts) => {
        setMandalarts(mandalarts);
        endLoading();
      },
      (e) => {
        setError(e);
        endLoading();
      }
    );
    return () => stopSync();
  }, [user, startLoading, endLoading]);

  // tuple로 고정
  return [mandalarts, setMandalarts, isLoading, error] as const;
};

export default useMandalarts;
