import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  keywords?: string;
  noindex?: boolean;
  children?: React.ReactNode;
}

const DEFAULT_TITLE = 'Car Audio Limburg';
const DEFAULT_DESCRIPTION = 'Specialist in premium car audio systemen, professionele installatie en dashcam systemen. Alpine, Audison, OEM upgrades en meer. Gevestigd in Geleen, Limburg.';
const DEFAULT_IMAGE = 'https://caraudiolimburg.com/og-image.jpg';
const SITE_URL = 'https://caraudiolimburg.com';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  keywords,
  noindex = false,
  children,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : `${DEFAULT_TITLE} | Premium Autoradio & Installatie Service`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content={DEFAULT_TITLE} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {children}
    </Helmet>
  );
}

export default SEO;
