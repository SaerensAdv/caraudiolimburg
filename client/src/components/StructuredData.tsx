import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://caraudiolimburg.com';

interface JsonLdProps {
  data: object;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Car Audio Limburg',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-transparent.png`,
    description: 'Specialist in premium car audio systemen, professionele installatie en dashcam systemen.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Geleen',
      addressRegion: 'Limburg',
      addressCountry: 'NL',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Dutch', 'English'],
    },
  };

  return <JsonLd data={data} />;
}

interface LocalBusinessSchemaProps {
  openingHours?: string[];
}

export function LocalBusinessSchema({ openingHours }: LocalBusinessSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'Car Audio Limburg',
    image: `${SITE_URL}/logo-transparent.png`,
    url: SITE_URL,
    description: 'Specialist in premium car audio systemen, professionele installatie en dashcam systemen. Alpine, Audison, OEM upgrades en meer.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Geleen',
      addressRegion: 'Limburg',
      postalCode: '',
      addressCountry: 'NL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.9739,
      longitude: 5.8294,
    },
    priceRange: '€€',
    openingHoursSpecification: openingHours || [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 50.9739,
        longitude: 5.8294,
      },
      geoRadius: '50000',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Car Audio Producten & Services',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Car Audio Systemen',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Installatie Services',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Dashcam Systemen',
        },
      ],
    },
  };

  return <JsonLd data={data} />;
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  reviewCount?: number;
  ratingValue?: number;
  url?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'EUR',
  availability = 'InStock',
  brand,
  sku,
  reviewCount,
  ratingValue,
  url,
  condition = 'NewCondition',
}: ProductSchemaProps) {
  const availabilityMap = {
    InStock: 'https://schema.org/InStock',
    OutOfStock: 'https://schema.org/OutOfStock',
    PreOrder: 'https://schema.org/PreOrder',
  };

  const conditionMap = {
    NewCondition: 'https://schema.org/NewCondition',
    UsedCondition: 'https://schema.org/UsedCondition',
    RefurbishedCondition: 'https://schema.org/RefurbishedCondition',
  };

  const productUrl = url?.startsWith('http') ? url : `${SITE_URL}${url || ''}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image.map(img => img.startsWith('http') ? img : `${SITE_URL}${img}`) : (image.startsWith('http') ? image : `${SITE_URL}${image}`),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: availabilityMap[availability],
      itemCondition: conditionMap[condition],
      url: productUrl,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Car Audio Limburg',
        url: SITE_URL,
      },
    },
  };

  if (brand) {
    data.brand = {
      '@type': 'Brand',
      name: brand,
    };
  }

  if (sku) {
    data.sku = sku;
  }

  if (reviewCount && ratingValue) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return <JsonLd data={data} />;
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName = 'Car Audio Limburg',
  url,
}: ArticleSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Car Audio Limburg',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-transparent.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || SITE_URL,
    },
  };

  return <JsonLd data={data} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function WebSiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Car Audio Limburg',
    url: SITE_URL,
    description: 'Specialist in premium car audio systemen, professionele installatie en dashcam systemen.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Car Audio Limburg',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-transparent.png`,
      },
    },
  };

  return <JsonLd data={data} />;
}
