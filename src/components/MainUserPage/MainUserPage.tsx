import useUserMandalarts from '../../hooks/useUserMandalarts';
import MainCommon from 'components/MainCommon/MainCommon';
import { User } from 'firebase/auth';
import { useEffect } from 'react';

// todo: 유저는 여기서 땡겨도 될거같은데.. 파이어 쓰면

type MainUserPageProps = {
  user: User;
  userError: Error | null;
  setIsLoading: (isLoading: boolean) => void;
};

const MainUserPage = ({ user, userError, setIsLoading }: MainUserPageProps) => {
  const { ...mandalartsHandlers } = useUserMandalarts(user);
  const { isLoading } = mandalartsHandlers;

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  if (isLoading) return null;

  return (
    <MainCommon
      userHandlers={{ user, error: userError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainUserPage;
