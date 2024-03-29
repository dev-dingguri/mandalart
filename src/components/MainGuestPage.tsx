import MainContent from 'components/MainContent';
import { useAddLoadingCondition } from 'contexts/LoadingContext';
import useGuestMandalarts from 'hooks/useGuestMandalarts';

type MainGuestPageProps = {
  userError: Error | null;
};

const MainGuestPage = ({ userError }: MainGuestPageProps) => {
  const { ...mandalartsHandlers } = useGuestMandalarts();
  const { isLoading } = mandalartsHandlers;

  useAddLoadingCondition('guest-mandalarts', isLoading);

  if (isLoading) return null;

  return (
    <MainContent
      userHandlers={{ error: userError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainGuestPage;
