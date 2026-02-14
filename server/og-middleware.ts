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

function generateOGTags(meta: OGMetaTags): string {
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
  return html.replace('</head>', `${metaTags}\n  </head>`);
}

async function getMetaTagsForUrl(url: string): Promise<OGMetaTags> {
  const productMatch = url.match(/^\/product\/([^/?]+)/);
  
  if (productMatch) {
    const slug = productMatch[1];
    try {
      const product = await storage.getProductBySlug(slug);
      if (product) {
        const imageUrl = product.images && product.images[0] 
          ? (product.images[0].startsWith('http') ? product.images[0] : `${SITE_URL}${product.images[0]}`)
          : `${SITE_URL}/favicon.png`;
        
        const description = product.shortDescription || product.description || `${product.name} - Premium car audio bij Car Audio Limburg`;
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 160).replace(/"/g, '&quot;');
        
        return {
          title: `${product.name} | Car Audio Limburg`,
          description: cleanDescription,
          image: imageUrl,
          url: `${SITE_URL}/product/${slug}`,
          type: "product",
          siteName: "Car Audio Limburg"
        };
      }
    } catch (error) {
      console.error("Error fetching product for OG tags:", error);
    }
  }
  
  return {
    title: "Car Audio Limburg | Premium Car Audio & Installatie",
    description: "Specialist in premium car audio systemen, dashcams en professionele installatie. Alpine, Audison, BlackVue en meer. Bezoek onze showroom in Sittard.",
    image: `${SITE_URL}/favicon.png`,
    url: SITE_URL,
    type: "website",
    siteName: "Car Audio Limburg"
  };
}

function isSocialMediaBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const bots = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Googlebot',
    'bingbot'
  ];
  return bots.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

export async function ogMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.get('User-Agent');
  
  if (!isSocialMediaBot(userAgent)) {
    return next();
  }

  const url = req.path;
  
  if (!url.startsWith('/product/')) {
    return next();
  }

  try {
    const meta = await getMetaTagsForUrl(url);
    const metaTags = generateOGTags(meta);
    
    const htmlPath = path.resolve(process.cwd(), 'client', 'index.html');
    let html = await fs.promises.readFile(htmlPath, 'utf-8');
    html = injectMetaTags(html, metaTags);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    console.error("Error in OG middleware:", error);
    next();
  }
}
