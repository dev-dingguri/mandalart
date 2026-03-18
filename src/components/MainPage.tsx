import AuthenticatedView from '@/components/AuthenticatedView';
import GuestView from '@/components/GuestView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/useAuthStore';

const MainPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const userError = useAuthStore((s) => s.error);

  // Auth 로딩 중에만 여기서 스피너 표시.
  // 만다라트 데이터 로딩은 각 View 컴포넌트가 자체적으로 처리하여
  // 사용자 전환 시 stale 데이터가 한 프레임 노출되는 문제를 방지.
  if (isAuthLoading) return <LoadingSpinner />;

  return user ? (
    <AuthenticatedView user={user} userError={userError} />
  ) : (
    <GuestView userError={userError} />
  );
};

export default MainPage;
