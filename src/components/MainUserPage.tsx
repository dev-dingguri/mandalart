import AppLayout from 'components/AppLayout';
import { useAddLoadingCondition } from 'stores/useLoadingStore';
import { useMandalartInit, useMandalartStore } from 'stores/useMandalartStore';
import { User } from 'firebase/auth';

type MainUserPageProps = {
  user: User;
  userError: Error | null;
};

const MainUserPage = ({ user, userError }: MainUserPageProps) => {
  useMandalartInit(user);
  const isLoading = useMandalartStore((s) => s.isLoading);

  useAddLoadingCondition('user-mandalarts', isLoading);

  if (isLoading) return null;

  return (
    <AppLayout
      userHandlers={{ user, error: userError }}
    />
  );
};

export default MainUserPage;
