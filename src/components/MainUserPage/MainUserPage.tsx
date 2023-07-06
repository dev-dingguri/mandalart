import useUserMandalarts from '../../hooks/useUserMandalarts';
import MainContents from 'components/MainContents/MainContents';
import { useAddLoadingCondition } from 'contexts/LoadingContext';
import { User } from 'firebase/auth';

type MainUserPageProps = {
  user: User;
  userError: Error | null;
};

const MainUserPage = ({ user, userError }: MainUserPageProps) => {
  const { ...mandalartsHandlers } = useUserMandalarts(user);
  const { isLoading } = mandalartsHandlers;

  useAddLoadingCondition('user-mandalarts', isLoading);

  if (isLoading) return null;

  return (
    <MainContents
      userHandlers={{ user, error: userError }}
      mandalartsHandlers={mandalartsHandlers}
    />
  );
};

export default MainUserPage;
