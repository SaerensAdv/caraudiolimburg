import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

const SITE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : "https://caraudiolimburg.replit.app";

interface OGMetaTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
}

const STATIC_PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Car Audio Limburg | Premium Autoradio & Installatie Service',
    description: 'Premium car audio & professionele installatie. Alpine, Audison, OEM upgrades. Gratis verzending vanaf €50. Vakkundige montage in Limburg.',
  },
  '/webshop': {
    title: 'Webshop | Car Audio Limburg',
    description: 'Bekijk ons complete assortiment car audio producten. Autoradio, versterkers, subwoofers, speakers en meer van premium merken.',
  },
  '/contact': {
    title: 'Contact | Car Audio Limburg',
    description: 'Neem contact op met Car Audio Limburg voor advies, offertes of een afspraak. Bezoek onze showroom in Sittard, Limburg.',
  },
  '/over-ons': {
    title: 'Over Ons | Car Audio Limburg',
    description: 'Leer meer over Car Audio Limburg. Specialist in premium car audio systemen en professionele installatie sinds dag één.',
  },
  '/montage': {
    title: 'Montage & Installatie | Car Audio Limburg',
    description: 'Professionele installatie van car audio systemen door ervaren monteurs. Vakkundige montage in onze werkplaats in Limburg.',
  },
  '/blog': {
    title: 'Blog & Kenniscentrum | Car Audio Limburg',
    description: 'Tips, handleidingen en nieuws over car audio. Lees onze artikelen over autoradio, speakers, versterkers en installatie.',
  },
  '/kenniscentrum': {
    title: 'Kenniscentrum | Car Audio Limburg',
    description: 'Tips, handleidingen en nieuws over car audio. Lees onze artikelen over autoradio, speakers, versterkers en installatie.',
  },
  '/veelgestelde-vragen': {
    title: 'Veelgestelde Vragen | Car Audio Limburg',
    description: 'Antwoorden op veelgestelde vragen over car audio, installatie, verzending en garantie bij Car Audio Limburg.',
  },
  '/portfolio': {
    title: 'Portfolio | Car Audio Limburg',
    description: 'Bekijk onze eerdere projecten en installaties. Van premium audio systemen tot complete multimedia upgrades.',
  },
  '/privacy-policy': {
    title: 'Privacybeleid | Car Audio Limburg',
    description: 'Lees ons privacybeleid over hoe wij omgaan met uw persoonsgegevens en privacy.',
  },
  '/algemene-voorwaarden': {
    title: 'Algemene Voorwaarden | Car Audio Limburg',
    description: 'Lees onze algemene voorwaarden voor bestellingen, installaties en diensten.',
  },
  '/apple-carplay-voor-uw-bmw': {
    title: 'Apple CarPlay voor uw BMW | Car Audio Limburg',
    description: 'Upgrade uw BMW met draadloos Apple CarPlay. Professionele installatie door Car Audio Limburg.',
  },
};

function generateMetaTagsHtml(meta: OGMetaTags): string {
  return `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:site_name" content="${meta.siteName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
  `;
}

function injectMetaTags(html: string, metaTags: string): string {
  let result = html;
  result = result.replace(/<title>[^<]*<\/title>/, '');
  result = result.replace(/<meta name="description"[^>]*\/>/g, '');
  result = result.replace(/<meta property="og:[^"]*"[^>]*\/>/g, '');
  result = result.replace(/<meta name="twitter:[^"]*"[^>]*\/>/g, '');
  result = result.replace('</head>', `${metaTags}\n  </head>`);
  return result;
}

async function getMetaTagsForUrl(url: string): Promise<OGMetaTags> {
  const productMatch = url.match(/^\/webshop\/([^/?]+)/);

  if (productMatch) {
    const slug = productMatch[1];
    try {
      const product = await storage.getProductBySlug(slug);
      if (product) {
        const imageUrl = product.images && product.images[0] 
          ? (product.images[0].startsWith('http') ? product.images[0] : `${SITE_URL}${product.images[0]}`)
          : `${SITE_URL}/favicon.png`;

        const description = product.shortDescription || product.description || `${product.name} - Premium car audio bij Car Audio Limburg`;
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 155).replace(/"/g, '&quot;');

        return {
          title: `${product.name} | Car Audio Limburg`,
          description: cleanDescription,
          image: imageUrl,
          url: `${SITE_URL}/webshop/${slug}`,
          type: "product",
          siteName: "Car Audio Limburg"
        };
      }
    } catch (error) {
      console.error("Error fetching product for meta tags:", error);
    }
  }

  const blogMatch = url.match(/^\/blog\/([^/?]+)/);
  if (blogMatch) {
    const slug = blogMatch[1];
    try {
      const post = await storage.getBlogPostBySlug(slug);
      if (post) {
        const cleanExcerpt = (post.excerpt || post.content || '').replace(/<[^>]*>/g, '').substring(0, 155).replace(/"/g, '&quot;');
        return {
          title: `${post.title} | Car Audio Limburg Blog`,
          description: cleanExcerpt || `Lees '${post.title}' op het Car Audio Limburg blog.`,
          image: (post as any).featuredImage || `${SITE_URL}/favicon.png`,
          url: `${SITE_URL}/blog/${slug}`,
          type: "article",
          siteName: "Car Audio Limburg"
        };
      }
    } catch (error) {
      console.error("Error fetching blog post for meta tags:", error);
    }
  }

  const staticMeta = STATIC_PAGE_META[url];
  if (staticMeta) {
    return {
      title: staticMeta.title,
      description: staticMeta.description,
      image: `${SITE_URL}/favicon.png`,
      url: `${SITE_URL}${url}`,
      type: "website",
      siteName: "Car Audio Limburg"
    };
  }

  return {
    title: "Car Audio Limburg | Premium Car Audio & Installatie",
    description: "Specialist in premium car audio systemen en professionele installatie. Alpine, Audison, OEM upgrades en meer.",
    image: `${SITE_URL}/favicon.png`,
    url: SITE_URL,
    type: "website",
    siteName: "Car Audio Limburg"
  };
}

function isCrawlerOrBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const bots = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'WhatsApp',
    'LinkedInBot', 'Pinterest', 'Slackbot', 'TelegramBot', 'Discordbot',
    'Googlebot', 'bingbot', 'YandexBot', 'DuckDuckBot', 'Baiduspider',
    'Sogou', 'Applebot', 'AhrefsBot', 'SemrushBot', 'MJ12bot',
    'DotBot', 'PetalBot', 'ia_archiver', 'crawler', 'spider', 'bot',
    'squirrel',
  ];
  const ua = userAgent.toLowerCase();
  return bots.some(bot => ua.includes(bot.toLowerCase()));
}

export async function ogMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api/') || req.path.startsWith('/@') || req.path.includes('.')) {
    return next();
  }

  if (req.path === '/') {
    return next();
  }

  try {
    const meta = await getMetaTagsForUrl(req.path);
    const metaTags = generateMetaTagsHtml(meta);

    const htmlPath = path.resolve(process.cwd(), 'client', 'index.html');
    let html = await fs.promises.readFile(htmlPath, 'utf-8');
    html = injectMetaTags(html, metaTags);

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    console.error("Error in OG middleware:", error);
    next();
  }
}
