import { Snippet } from '../../types/Snippet';
import MainCommon from 'components/MainCommon/MainCommon';
import useGuestMandalarts from 'hooks/useGuestMandalarts';

type MainGuestPageProps = {
  signinError?: Error;
};

const MainGuestPage = ({ signinError }: MainGuestPageProps) => {
  const { ...mandalartsHandlers } = useGuestMandalarts(
    new Map<string, Snippet>(),
    null,
    null
  );

  return (
    <MainCommon
      userHandlers={{ error: signinError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainGuestPage;
