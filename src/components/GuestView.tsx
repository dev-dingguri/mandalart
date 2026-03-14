import AppLayout from 'components/AppLayout';
import { useAddLoadingCondition } from 'stores/useLoadingStore';
import { useMandalartInit, useMandalartStore } from 'stores/useMandalartStore';

type GuestViewProps = {
  userError: Error | null;
};

const GuestView = ({ userError }: GuestViewProps) => {
  useMandalartInit(null);
  const isLoading = useMandalartStore((s) => s.isLoading);

  useAddLoadingCondition('guest-mandalarts', isLoading);

  if (isLoading) return null;

  return (
    <AppLayout userHandlers={{ error: userError }} />
  );
};

export default GuestView;
