import MainContents from 'components/MainContents/MainContents';
import useGuestMandalarts from 'hooks/useGuestMandalarts';
import { useEffect } from 'react';

type MainGuestPageProps = {
  userError: Error | null;
  setIsLoading: (isLoading: boolean) => void;
};

const MainGuestPage = ({ userError, setIsLoading }: MainGuestPageProps) => {
  const { ...mandalartsHandlers } = useGuestMandalarts();
  const { isLoading } = mandalartsHandlers;

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  if (isLoading) return null;

  return (
    <MainContents
      userHandlers={{ error: userError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainGuestPage;
