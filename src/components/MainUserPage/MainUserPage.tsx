import useUserMandalarts from '../../hooks/useUserMandalarts';
import { Snippet } from '../../types/Snippet';
import MainCommon from 'components/MainCommon/MainCommon';
import { User } from 'firebase/auth';
import { useEffect } from 'react';

// todo: 유저는 여기서 땡겨도 될거같은데.. 파이어 쓰면

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
  const { ...mandalartsHandlers } = useUserMandalarts(
    user,
    new Map<string, Snippet>(),
    null,
    null
  );
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
