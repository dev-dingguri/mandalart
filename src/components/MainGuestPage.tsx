import AppLayout from 'components/AppLayout';
import { useAddLoadingCondition } from 'stores/useLoadingStore';
import { useMandalartInit, useMandalartStore } from 'stores/useMandalartStore';

type MainGuestPageProps = {
  userError: Error | null;
};

const MainGuestPage = ({ userError }: MainGuestPageProps) => {
  useMandalartInit(null);
  const isLoading = useMandalartStore((s) => s.isLoading);

  useAddLoadingCondition('guest-mandalarts', isLoading);

  if (isLoading) return null;

  return (
    <AppLayout userHandlers={{ error: userError }} />
  );
};

export default MainGuestPage;
