import { Snippet } from '../../types/Snippet';
import MainCommon from 'components/MainCommon/MainCommon';
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
    <MainCommon userHandlers={{}} mandalartsHandlers={mandalartsHandlers} />
  );
};

export default MainGuestPage;
