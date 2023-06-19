import useUserMandalarts from '../../hooks/useUserMandalarts';
import MainCommon from 'components/MainCommon/MainCommon';
import { User } from 'firebase/auth';
import { useEffect } from 'react';

type MainUserPageProps = {
  user: User;
  signinError?: Error;
  toggleLoading: (isLoading: boolean) => void;
};

const MainUserPage = ({
  user,
  signinError,
  toggleLoading,
}: MainUserPageProps) => {
  const { ...mandalartsHandlers } = useUserMandalarts(user, null);
  const { isLoading } = mandalartsHandlers;

  useEffect(() => {
    toggleLoading(isLoading);
  }, [isLoading, toggleLoading]);

  if (isLoading) return null;

  return (
    <MainCommon
      userHandlers={{ user, error: signinError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainUserPage;
