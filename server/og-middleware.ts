import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

const SITE_URL = process.env.SITE_URL 
  ? process.env.SITE_URL.replace(/\/$/, '')
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
    title: 'Car Audio Webshop - Autoradio, Speakers & Versterkers Kopen | Car Audio Limburg',
    description: 'Ontdek ons complete assortiment autoradio\'s, versterkers, subwoofers en speakers van Alpine, Kenwood en Audison. Gratis verzending vanaf €50 en professioneel advies.',
  },
  '/contact': {
    title: 'Contact Opnemen voor Advies of Afspraak Maken | Car Audio Limburg',
    description: 'Neem contact op met Car Audio Limburg voor persoonlijk advies, offertes of een afspraak in onze showroom. Bezoek ons in Sittard, Limburg of bel 085-27 33 625.',
  },
  '/over-ons': {
    title: 'Over Ons - Specialist in Car Audio & Installatie | Car Audio Limburg',
    description: 'Maak kennis met Car Audio Limburg, specialist in premium car audio en professionele installatie. Vakkundige monteurs en eerlijk advies in Sittard.',
  },
  '/montage': {
    title: 'Professionele Montage & Installatie | Car Audio Limburg',
    description: 'Professionele car audio installatie door ervaren monteurs. Van autoradio inbouw tot complete audio upgrades in onze werkplaats in Sittard.',
  },
  '/blog': {
    title: 'Blog & Kenniscentrum - Car Audio Tips & Handleidingen | Car Audio Limburg',
    description: 'Tips, handleidingen en het laatste nieuws over car audio. Lees onze artikelen over autoradio installatie, speakers kiezen, versterkers aansluiten en meer.',
  },
  '/kenniscentrum': {
    title: 'Kenniscentrum - Handleidingen & Car Audio Gidsen | Car Audio Limburg',
    description: 'Uitgebreide handleidingen en gidsen over car audio. Van het kiezen van de juiste speakers tot het installeren van een complete audio setup in uw auto.',
  },
  '/veelgestelde-vragen': {
    title: 'Veelgestelde Vragen over Car Audio & Installatie | Car Audio Limburg',
    description: 'Antwoorden op veelgestelde vragen over car audio producten, professionele installatie, verzending, retourneren en garantie bij Car Audio Limburg.',
  },
  '/portfolio': {
    title: 'Portfolio - Onze Car Audio Installaties & Projecten | Car Audio Limburg',
    description: 'Bekijk onze eerdere projecten en installaties. Van premium audio systemen tot complete multimedia upgrades voor BMW, Audi, Mercedes en meer.',
  },
  '/privacy-policy': {
    title: 'Privacybeleid - Uw Privacy bij Car Audio Limburg',
    description: 'Lees ons privacybeleid over hoe Car Audio Limburg omgaat met uw persoonsgegevens, cookies en privacy conform de AVG/GDPR wetgeving.',
  },
  '/algemene-voorwaarden': {
    title: 'Algemene Voorwaarden - Car Audio Limburg Webshop & Services',
    description: 'Lees de algemene voorwaarden van Car Audio Limburg voor bestellingen in onze webshop, professionele installaties en overige diensten.',
  },
  '/apple-carplay-voor-uw-bmw': {
    title: 'Apple CarPlay Inbouw voor BMW & MINI | Car Audio Limburg',
    description: 'Upgrade uw BMW of MINI met draadloos Apple CarPlay. Professionele inbouw zonder uw originele systeem te wijzigen. Maak vandaag een afspraak.',
  },
};

function generateMetaTagsHtml(meta: OGMetaTags): string {
  return `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${meta.url}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:site_name" content="${meta.siteName}" />
    <meta property="og:locale" content="nl_NL" />
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
  result = result.replace(/<link rel="canonical"[^>]*\/>/g, '');
  result = result.replace(/<meta property="og:[^"]*"[^>]*\/>/g, '');
  result = result.replace(/<meta name="twitter:[^"]*"[^>]*\/>/g, '');
  result = result.replace('</head>', `${metaTags}\n  </head>`);
  return result;
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  'multimedia-navigatie': {
    title: 'Multimedia & Navigatie Systemen Kopen | Car Audio Limburg',
    description: 'Ontdek ons assortiment multimedia en navigatie systemen. Apple CarPlay, Android Auto, touchscreens en meer van Alpine, Kenwood en andere topmerken.',
  },
  'speakers-subwoofers': {
    title: 'Autospeakers & Subwoofers Kopen | Car Audio Limburg',
    description: 'Premium autospeakers en subwoofers van Alpine, Audison, Hertz en meer. Componentsets, coaxiaal speakers en subwoofers voor elke auto en elk budget.',
  },
  'versterkers-dsp': {
    title: 'Versterkers & DSP Processors Kopen | Car Audio Limburg',
    description: 'Hoogwaardige autoversterkers en DSP processors van Audison, Alpine en Hertz. Mono, 2-kanaals, 4-kanaals versterkers voor een perfecte geluidsinstallatie.',
  },
  'cameras-veiligheid': {
    title: 'Achteruitrijcamera\'s & Veiligheid | Car Audio Limburg',
    description: 'Achteruitrijcamera\'s, dashcams en veiligheidssystemen voor uw auto. Professionele montage en integratie met uw bestaande multimedia systeem.',
  },
};

async function getMetaTagsForUrl(url: string): Promise<OGMetaTags> {
  const [urlPath, queryString] = url.split('?');
  const params = new URLSearchParams(queryString || '');

  const category = params.get('category');
  const brand = params.get('brand');

  if (urlPath === '/webshop' && (category || brand)) {
    if (category && CATEGORY_META[category]) {
      const catMeta = CATEGORY_META[category];
      return {
        title: catMeta.title,
        description: catMeta.description,
        image: `${SITE_URL}/favicon.png`,
        url: `${SITE_URL}/webshop?category=${category}`,
        type: "website",
        siteName: "Car Audio Limburg"
      };
    }
    if (brand) {
      const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
      return {
        title: `${brandName} Car Audio Producten Kopen | Car Audio Limburg`,
        description: `Bekijk alle ${brandName} car audio producten bij Car Audio Limburg. Autoradio's, speakers, versterkers en meer. Gratis verzending vanaf €50 en professionele installatie.`,
        image: `${SITE_URL}/favicon.png`,
        url: `${SITE_URL}/webshop?brand=${brand}`,
        type: "website",
        siteName: "Car Audio Limburg"
      };
    }
  }

  const productMatch = urlPath.match(/^\/webshop\/([^/?]+)/);

  if (productMatch) {
    const slug = productMatch[1];
    try {
      const product = await storage.getProductBySlug(slug);
      if (product) {
        const imageUrl = product.images && product.images[0] 
          ? (product.images[0].startsWith('http') ? product.images[0] : `${SITE_URL}${product.images[0]}`)
          : `${SITE_URL}/favicon.png`;

        let description = product.shortDescription || product.description || '';
        let cleanDescription = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (cleanDescription.length < 120) {
          cleanDescription = `${product.name} - ${cleanDescription}${cleanDescription ? '. ' : ''}Bestel online bij Car Audio Limburg met gratis verzending vanaf €50.`;
        }
        cleanDescription = cleanDescription.substring(0, 160).replace(/"/g, '&quot;');

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

  const blogMatch = urlPath.match(/^\/blog\/([^/?]+)/);
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

  const staticMeta = STATIC_PAGE_META[urlPath];
  if (staticMeta) {
    return {
      title: staticMeta.title,
      description: staticMeta.description,
      image: `${SITE_URL}/favicon.png`,
      url: `${SITE_URL}${urlPath}`,
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

  if (req.path === '/' && !isCrawlerOrBot(req.headers['user-agent'])) {
    return next();
  }

  try {
    const fullUrl = req.originalUrl || req.path;
    const meta = await getMetaTagsForUrl(fullUrl);
    const metaTags = generateMetaTagsHtml(meta);

    const htmlPath = path.resolve(process.cwd(), 'client', 'index.html');
    let html = await fs.promises.readFile(htmlPath, 'utf-8');
    html = injectMetaTags(html, metaTags);

    const seoContent = generateSeoContent(req.path, meta);
    if (seoContent) {
      html = html.replace(
        '<noscript>',
        `<div class="sr-only">${seoContent}</div>\n      <noscript>`
      );
    }

    html = html.replace(
      '<noscript>',
      `<nav class="sr-only" aria-label="Footer navigatie"><a href="/privacy-policy">Privacybeleid</a> | <a href="/algemene-voorwaarden">Algemene Voorwaarden</a> | <a href="/over-ons">Over Car Audio Limburg</a> | <a href="/contact">Contact</a></nav>\n      <noscript>`
    );

    res.status(200).set({ 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300, s-maxage=600' }).end(html);
  } catch (error) {
    console.error("Error in OG middleware:", error);
    next();
  }
}

function generateSeoContent(urlPath: string, meta: OGMetaTags): string {
  const staticContent: Record<string, string> = {
    '/': `<h2>Premium Car Audio Specialist in Limburg</h2><p>Welkom bij Car Audio Limburg, uw specialist in premium car audio systemen en professionele installatie in Sittard, Limburg. Wij bieden een uitgebreid assortiment autoradio's, speakers, subwoofers, versterkers en multimedia systemen van topmerken als Alpine, Kenwood, Audison en Hertz. Of u nu een eenvoudige speaker upgrade wilt of een complete audio transformatie — onze vakkundige monteurs zorgen voor een perfecte installatie met oog voor detail. Bezoek onze showroom, bekijk onze webshop of maak een afspraak voor professionele montage. Gratis verzending vanaf €50 en deskundig advies bij elk product.</p>`,
    '/webshop': `<h2>Car Audio Producten</h2><p>Welkom bij de webshop van Car Audio Limburg, uw specialist in premium car audio producten. Ontdek ons uitgebreide assortiment autoradio's, speakers, subwoofers, versterkers en DSP-systemen van topmerken als Alpine, Kenwood, Audison en Hertz. Wij bieden gratis verzending vanaf €50 en professionele installatie in onze werkplaats in Sittard, Limburg. Of u nu op zoek bent naar een complete multimedia upgrade, een krachtige subwoofer setup, of een OEM-integratie voor uw BMW, Mercedes of Audi — bij Car Audio Limburg vindt u altijd het juiste product met persoonlijk advies van onze experts.</p>`,
    '/contact': `<h2>Contact Car Audio Limburg</h2><p>Neem contact op met Car Audio Limburg voor persoonlijk advies over car audio producten en installatie. Ons team van ervaren specialisten staat voor u klaar. Bezoek onze showroom en werkplaats aan Dr. Nolenslaan 157c, 6136 GM Sittard. Bel ons op 085-27 33 625 of mail naar info@caraudiolimburg.nl. Wij zijn geopend maandag tot en met vrijdag van 08:30 tot 17:30 op afspraak. Wij helpen u graag bij het kiezen van de perfecte audio-oplossing voor uw voertuig, van advies tot professionele montage.</p>`,
    '/over-ons': `<h2>Over Car Audio Limburg</h2><p>Car Audio Limburg is de specialist in premium car audio systemen en professionele installatie in Zuid-Limburg. Vanuit onze werkplaats in Sittard bieden wij een breed assortiment aan car audio producten van topmerken als Alpine, Audison, Kenwood en Hertz. Ons team van vakkundige monteurs heeft jarenlange ervaring in het inbouwen van autoradio's, versterkers, speakers en complete multimedia systemen. Wij geloven in kwaliteit, eerlijk advies en maatwerk. Elke installatie wordt met de grootste zorg uitgevoerd om het beste geluid en een perfecte integratie in uw voertuig te garanderen.</p>`,
    '/montage': `<h2>Professionele Car Audio Montage</h2><p>Bij Car Audio Limburg verzorgen wij professionele installatie van alle car audio systemen. Onze ervaren monteurs bouwen autoradio's, versterkers, speakers, subwoofers, achteruitrijcamera's en complete multimedia systemen in met oog voor detail en kwaliteit. Van een eenvoudige speaker upgrade tot een volledig custom audio systeem — wij maken het mogelijk. Onze werkplaats in Sittard beschikt over professioneel gereedschap en kennis van alle voertuigmerken. Wij werken met OEM-kwaliteit kabels en accessoires voor een naadloze integratie. Maak vandaag nog een afspraak voor uw installatie.</p>`,
    '/blog': `<h2>Car Audio Blog & Kenniscentrum</h2><p>Welkom bij het Car Audio Limburg kenniscentrum. Hier vindt u handige tips, uitgebreide handleidingen en het laatste nieuws over car audio. Lees onze artikelen over het kiezen van de juiste speakers, het aansluiten van versterkers, het installeren van een subwoofer, en nog veel meer. Ons kenniscentrum is bedoeld voor zowel beginners als ervaren audio-liefhebbers die het beste uit hun autosysteem willen halen. Ontdek hoe u uw rijervaring kunt verbeteren met premium audioapparatuur en professionele installatietips.</p>`,
    '/kenniscentrum': `<h2>Car Audio Kenniscentrum</h2><p>Welkom bij het kenniscentrum van Car Audio Limburg. Hier vindt u uitgebreide handleidingen, gidsen en tips over car audio. Van het kiezen van de juiste autoradio tot het installeren van een complete audio setup — wij helpen u op weg. Leer alles over speakers, subwoofers, versterkers, DSP-systemen en meer. Onze artikelen zijn geschreven door ervaren car audio specialisten die hun kennis graag delen met u.</p>`,
    '/veelgestelde-vragen': `<h2>Veelgestelde Vragen</h2><p>Hier vindt u antwoorden op veelgestelde vragen over car audio producten, professionele installatie, verzending, retourneren en garantie bij Car Audio Limburg. Wij begrijpen dat u vragen kunt hebben over de juiste keuze van audio-apparatuur, installatiekosten, levertijden en onze service. Onze FAQ-pagina biedt uitgebreide antwoorden op de meest gestelde vragen. Staat uw vraag er niet bij? Neem dan gerust contact met ons op via telefoon of e-mail — ons team helpt u graag verder.</p>`,
    '/portfolio': `<h2>Car Audio Limburg Portfolio</h2><p>Bekijk onze eerdere projecten en installaties bij Car Audio Limburg. Van premium audio systemen in BMW's en Audi's tot complete multimedia upgrades in campers en bedrijfsvoertuigen. Elk project wordt door onze vakkundige monteurs uitgevoerd met oog voor detail, kwaliteit en perfecte integratie. Ontdek hoe wij autoradio's, versterkers, speakers en achteruitrijcamera's inbouwen in diverse voertuigmerken en modellen. Laat u inspireren door onze eerdere werkzaamheden.</p>`,
    '/privacy-policy': `<h2>Privacybeleid Car Audio Limburg</h2><p>Bij Car Audio Limburg hechten wij veel waarde aan de bescherming van uw persoonsgegevens. In ons privacybeleid leest u hoe wij omgaan met uw gegevens wanneer u onze website bezoekt, een bestelling plaatst of contact met ons opneemt. Wij verwerken uw gegevens conform de Algemene Verordening Gegevensbescherming (AVG/GDPR). Uw gegevens worden uitsluitend gebruikt voor het afhandelen van bestellingen, het verlenen van service en het verbeteren van onze dienstverlening.</p>`,
    '/algemene-voorwaarden': `<h2>Algemene Voorwaarden</h2><p>Op deze pagina vindt u de algemene voorwaarden van Car Audio Limburg. Deze voorwaarden zijn van toepassing op alle bestellingen via onze webshop, professionele installaties en overige diensten. Lees deze voorwaarden zorgvuldig door voordat u een bestelling plaatst. Bij vragen over onze voorwaarden kunt u contact opnemen met ons team.</p>`,
    '/apple-carplay-voor-uw-bmw': `<h2>Apple CarPlay voor BMW & MINI</h2><p>Upgrade uw BMW of MINI met draadloos Apple CarPlay. Car Audio Limburg is specialist in het inbouwen van Apple CarPlay in BMW-voertuigen, zonder het originele iDrive-systeem te wijzigen. Geniet van naadloze iPhone-integratie, navigatie met Apple Maps of Google Maps, en handsfree bellen en berichten. Onze professionele installatie behoudt alle originele functies van uw BMW, inclusief stuurwielbediening en parkeerassistent. Geschikt voor diverse BMW-modellen en bouwjaren. Maak vandaag een afspraak voor uw CarPlay upgrade.</p>`,
  };

  if (staticContent[urlPath]) {
    return staticContent[urlPath];
  }

  if (urlPath.startsWith('/webshop/') && meta.type === 'product') {
    return `<h2>${meta.title.replace(' | Car Audio Limburg', '')}</h2><p>${meta.description} Bekijk dit product bij Car Audio Limburg. Wij bieden professionele installatie en deskundig advies bij al onze car audio producten. Bestel online met gratis verzending vanaf €50 of bezoek onze showroom in Sittard voor een persoonlijke demonstratie.</p>`;
  }

  if (urlPath.startsWith('/blog/') && meta.type === 'article') {
    return `<h2>${meta.title.replace(' | Car Audio Limburg Blog', '')}</h2><p>Door <span class="author">Dennis Geenen</span> — ${meta.description} Lees dit artikel op het Car Audio Limburg blog. Ontdek tips, handleidingen en nieuws over car audio producten en installatie.</p>`;
  }

  return '';
}
