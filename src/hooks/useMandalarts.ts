import { useEffect, useState } from 'react';
import { MandalartMetadata } from 'types/MandalartMetadata';
import { User } from 'firebase/auth';
import repository from 'services/mandalartRepository';

const useMandalarts = (
  initialMandalarts: Map<string, MandalartMetadata>,
  user: User | null
) => {
  const [mandalarts, setMandalarts] = useState(initialMandalarts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    const stopSync = repository.syncMetadata(
      user.uid,
      (mandalarts) => {
        setMandalarts(mandalarts);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      }
    );
    return () => stopSync();
  }, [user]);

  // tuple로 고정
  return [mandalarts, setMandalarts, isLoading, error] as const;
};

export default useMandalarts;
