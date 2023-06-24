import { Snippet } from '../../types/Snippet';
import MainContents from 'components/MainContents/MainContents';
import useGuestMandalarts from 'hooks/useGuestMandalarts';

type MainGuestPageProps = {
  userError: Error | null;
};

const MainGuestPage = ({ userError }: MainGuestPageProps) => {
  const { ...mandalartsHandlers } = useGuestMandalarts(
    new Map<string, Snippet>(),
    null,
    null
  );

  return (
    <MainContents userHandlers={{}} mandalartsHandlers={mandalartsHandlers} />
  );
};

export default MainGuestPage;
