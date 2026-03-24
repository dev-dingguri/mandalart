import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  useMandalartInit,
  useMandalartStore,
} from '@/stores/useMandalartStore';

type GuestViewProps = {
  userError: Error | null;
};

const GuestView = ({ userError }: GuestViewProps) => {
  useMandalartInit(null);
  const isLoading = useMandalartStore((s) => s.isLoading);

  if (isLoading) return <LoadingSpinner />;

  return <AppLayout userHandlers={{ error: userError }} />;
};

export default GuestView;
