import { Helmet } from 'react-helmet-async';

type SEOHeadProps = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
};

const SITE_URL = 'https://mandalart.me';

const SEOHead = ({ title, description, path, ogImage = '/image.png' }: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={`${SITE_URL}${path}`} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={`${SITE_URL}${path}`} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:site_name" content="Mandalart" />
  </Helmet>
);

export default SEOHead;
