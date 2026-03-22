import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PATH_APP, STORAGE_KEY_HAS_USED_TOOL } from '@/constants';

const LandingPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  // 재방문자는 도구 페이지로 리다이렉트 — 이미 도구를 사용한 적이 있으면 랜딩 스킵
  const hasUsedTool = localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL);
  if (hasUsedTool) {
    return <Navigate to={`/${lang}${PATH_APP}`} replace />;
  }

  return (
    <div className="min-h-dvh">
      <h1>Landing Page (placeholder)</h1>
      <a href={`/${lang}${PATH_APP}`}>도구로 이동</a>
    </div>
  );
};

export default LandingPage;
