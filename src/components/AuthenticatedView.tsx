import AppLayout from 'components/AppLayout';
import { useMandalartInit, useMandalartStore } from 'stores/useMandalartStore';
import { User } from 'firebase/auth';

type AuthenticatedViewProps = {
  user: User;
  userError: Error | null;
};

const AuthenticatedView = ({ user, userError }: AuthenticatedViewProps) => {
  useMandalartInit(user);
  const isLoading = useMandalartStore((s) => s.isLoading);

  if (isLoading) return null;

  return (
    <AppLayout
      userHandlers={{ user, error: userError }}
    />
  );
};

export default AuthenticatedView;
