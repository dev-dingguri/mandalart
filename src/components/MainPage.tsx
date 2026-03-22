import AuthenticatedView from '@/components/AuthenticatedView';
import GuestView from '@/components/GuestView';
import LoadingSpinner from '@/components/LoadingSpinner';
import SEOHead from '@/components/SEOHead';
import { useAuthStore } from '@/stores/useAuthStore';
import { PATH_APP } from '@/constants';
import { useTranslation } from 'react-i18next';

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const userError = useAuthStore((s) => s.error);

  // Auth 로딩 중에만 여기서 스피너 표시.
  // 만다라트 데이터 로딩은 각 View 컴포넌트가 자체적으로 처리하여
  // 사용자 전환 시 stale 데이터가 한 프레임 노출되는 문제를 방지.
  if (isAuthLoading) return <LoadingSpinner />;

  return (
    <>
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        path={`/${i18n.language}${PATH_APP}`}
      />
      {user ? (
        <AuthenticatedView user={user} userError={userError} />
      ) : (
        <GuestView userError={userError} />
      )}
    </>
  );
};

export default MainPage;
