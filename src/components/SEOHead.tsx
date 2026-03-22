import { Helmet } from 'react-helmet-async';

type SEOHeadProps = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
};

const SITE_URL = 'https://mandalart.me';
const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'zh-CN'];

// path에서 언어 접두사 뒤의 경로를 추출 (예: "/ko/guide" → "/guide", "/ko" → "")
const extractSubpath = (path: string): string => {
  const match = path.match(/^\/[^/]+(.*)$/);
  return match?.[1] ?? '';
};

const SEOHead = ({ title, description, path, ogImage = '/image.png' }: SEOHeadProps) => {
  const subpath = extractSubpath(path);

  // BreadcrumbList — 홈페이지가 아닌 하위 페이지에서만 생성
  // 홈페이지는 계층 상위가 없으므로 breadcrumb 의미 없음
  const breadcrumbJsonLd = subpath ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Mandalart',
        'item': `${SITE_URL}${path.replace(subpath, '')}`,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': title,
        'item': `${SITE_URL}${path}`,
      },
    ],
  }) : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE_URL}${path}`} />
      {/* hrefLang — 검색엔진에 각 언어별 동일 페이지를 알림 */}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en${subpath}`} />
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${SITE_URL}/${lang}${subpath}`} />
      ))}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}${path}`} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Mandalart" />
      {breadcrumbJsonLd && (
        <script type="application/ld+json">{breadcrumbJsonLd}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
