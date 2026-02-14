import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";

const DELAY_MS = 500;

const JUNK_PATTERNS = [
  "logo_mobile", "logo-caraudio", "Asset-7-1", "conversie-montage",
  "ideal-1", "mastercard", "logo-paypal", "pin-1",
  "Bancontact", "sofort-banking", "Retourneringsformulier",
  "anncapictures", "CAR_1765257768308", ".pdf",
  "Schermafbeelding-2020", "favicon", "woocommerce-placeholder",
  "cropped-", "iconen_", "Cookiebot", "cookie",
];

const BMW_PRODUCTS: Record<string, string> = {
  "CAL-BMW-E87": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-1-serie-cic-2/",
  "CAL-BMW-F22": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-bmw-2-serie-nbt-2/",
  "CAL-BMW-E90": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-3-serie-zonder-eigen-scherm-2/",
  "CAL-BMW-F30": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-3-4-serie-nbt/",
  "CAL-BMW-F30-EVO": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-3-4-serie-evo-2/",
  "CAL-BMW-E60": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-5-serie-cic-3/",
  "CAL-BMW-F07": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-5-serie-nbt-3/",
  "CAL-BMW-F10": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-5-serie-evo-2/",
  "CAL-BMW-F06": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-6-serie-nbt-2/",
  "CAL-BMW-E65": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-7-serie-e65-e66-ccc-2/",
  "CAL-BMW-F01": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-7-serie-nbt-2/",
  "CAL-BMW-G11": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-7-serie-cic-2/",
  "CAL-BMW-X1": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-x1-zonder-eigen-scherm-2/",
  "CAL-BMW-X3": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-x3-serie-met-origineel-scherm/",
  "CAL-BMW-X5": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-x5-x6-serie-nbt/",
  "CAL-BMW-Z4": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-z4-e89-cic-of-zonder-origineel-scherm/",
  "CAL-BMW-G30": "https://caraudiolimburg.nl/webshop/bmw-android-13-0-navi-5-serie-nbt-cic/",
};

const MERCEDES_PRODUCTS: Record<string, string> = {
  "13.0CX308FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-glk-klasse-ntg-4-0/",
  "13.0CX309FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-glk-klasse-ntg-4-5/",
  "13.0CX320FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-b-klasse-ntg-5-0/",
  "13.0CX326FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-cls-klasse-ntg-4-5/",
  "13.0CX336FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-cls-klasse-ntg-5-0/",
  "13.0CX337FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-sl-slk-klasse-ntg-4-5/",
  "13.0CX357FHD": "https://caraudiolimburg.nl/webshop/mercedes-android-13-0-navi-sl-slc-klasse-ntg-5-0/",
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeUrl(url: string): string {
  return url.replace("www.caraudiolimburg.nl", "caraudiolimburg.nl");
}

function toFullSizeUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.\w+)$/, "$1");
}

function extractFilename(url: string): string {
  const normalized = normalizeUrl(url);
  const match = normalized.match(/wp-content\/uploads\/(.+)$/);
  if (!match) return "";
  return toFullSizeUrl(match[1]);
}

function isJunkImage(url: string): boolean {
  const lower = url.toLowerCase();
  for (const pattern of JUNK_PATTERNS) {
    if (url.includes(pattern) || lower.includes(pattern.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function hasSmallDimensions(url: string): boolean {
  const dimMatch = url.match(/-(\d+)x(\d+)\.\w+$/);
  if (!dimMatch) return false;
  const w = parseInt(dimMatch[1]);
  const h = parseInt(dimMatch[2]);
  return w <= 150 || h <= 150;
}

function isValidProductImage(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized.includes("caraudiolimburg.nl/wp-content/uploads/")) return false;
  if (isJunkImage(normalized)) return false;
  if (hasSmallDimensions(normalized)) return false;
  return true;
}

async function fetchPageImages(pageUrl: string): Promise<string[]> {
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const imageUrls = new Set<string>();

  $("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    const dataSrc = $(el).attr("data-src") || "";
    const dataLarge = $(el).attr("data-large_image") || "";

    for (const raw of [src, dataSrc, dataLarge]) {
      if (!raw) continue;
      const normalized = normalizeUrl(raw);
      if (isValidProductImage(normalized)) {
        imageUrls.add(toFullSizeUrl(normalized));
      }
    }
  });

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const normalized = normalizeUrl(href);
    if (isValidProductImage(normalized)) {
      imageUrls.add(toFullSizeUrl(normalized));
    }
  });

  $("div[data-thumb]").each((_, el) => {
    const thumb = $(el).attr("data-thumb") || "";
    const normalized = normalizeUrl(thumb);
    if (isValidProductImage(normalized)) {
      imageUrls.add(toFullSizeUrl(normalized));
    }
  });

  return Array.from(imageUrls);
}

async function findMercedesUrls(): Promise<Record<string, string>> {
  console.log("Fetching product sitemap to find Mercedes URLs...");
  try {
    const response = await fetch("https://caraudiolimburg.nl/product-sitemap.xml", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.log(`  Sitemap fetch failed: ${response.status}`);
      return MERCEDES_PRODUCTS;
    }
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const mercedesUrls: string[] = [];
    $("url loc").each((_, el) => {
      const loc = $(el).text().trim();
      if (loc.toLowerCase().includes("mercedes")) {
        mercedesUrls.push(normalizeUrl(loc));
      }
    });

    console.log(`  Found ${mercedesUrls.length} Mercedes URLs in sitemap`);
    for (const url of mercedesUrls) {
      console.log(`    ${url}`);
    }

    const updatedMapping = { ...MERCEDES_PRODUCTS };
    for (const [sku, guessedUrl] of Object.entries(MERCEDES_PRODUCTS)) {
      const guessedSlug = guessedUrl.replace(/\/$/, "").split("/").pop() || "";
      const found = mercedesUrls.find(u => {
        const sitemapSlug = u.replace(/\/$/, "").split("/").pop() || "";
        return sitemapSlug === guessedSlug || sitemapSlug.includes(guessedSlug.replace(/-\d+$/, ""));
      });
      if (found) {
        updatedMapping[sku] = found.endsWith("/") ? found : found + "/";
      }
    }

    return updatedMapping;
  } catch (error) {
    console.log(`  Error fetching sitemap: ${error}`);
    return MERCEDES_PRODUCTS;
  }
}

async function main() {
  console.log("=== Remaining Images Scraper ===\n");

  const mercedesMapping = await findMercedesUrls();
  const allMappings: Record<string, string> = { ...BMW_PRODUCTS, ...mercedesMapping };

  const skus = Object.keys(allMappings);
  console.log(`\nFetching ${skus.length} products from database...\n`);

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      images: products.images,
    })
    .from(products);

  const skuToProduct = new Map<string, typeof allProducts[0]>();
  for (const p of allProducts) {
    if (p.sku) {
      skuToProduct.set(p.sku, p);
    }
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let notFound = 0;

  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i];
    const wpUrl = allMappings[sku];
    const product = skuToProduct.get(sku);

    if (!product) {
      console.log(`[${i + 1}/${skus.length}] SKU ${sku} - NOT IN DATABASE`);
      notFound++;
      continue;
    }

    console.log(`[${i + 1}/${skus.length}] ${product.name} (${sku})`);
    console.log(`  WP URL: ${wpUrl}`);

    try {
      const scrapedImages = await fetchPageImages(wpUrl);
      console.log(`  Found ${scrapedImages.length} clean images on page`);

      if (scrapedImages.length === 0) {
        console.log(`  No images found, skipping`);
        skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      const currentImages = product.images || [];
      const firstImage = currentImages[0] || "";

      const seenFilenames = new Set<string>();
      const newImages: string[] = [];

      if (firstImage) {
        newImages.push(firstImage);
        const fn = extractFilename(firstImage);
        if (fn) seenFilenames.add(fn);
      }

      for (const img of scrapedImages) {
        const fn = extractFilename(img);
        if (fn && !seenFilenames.has(fn)) {
          seenFilenames.add(fn);
          newImages.push(img);
        }
      }

      if (newImages.length > currentImages.length) {
        await db
          .update(products)
          .set({ images: newImages })
          .where(eq(products.id, product.id));
        console.log(`  Updated: ${currentImages.length} → ${newImages.length} images`);
        updated++;
      } else {
        console.log(`  No new images (${newImages.length} total vs ${currentImages.length} existing)`);
        skipped++;
      }
    } catch (error: any) {
      const msg = error.message || String(error);
      if (msg.includes("404")) {
        console.log(`  404 Not Found - page doesn't exist`);
      } else {
        console.log(`  Error: ${msg}`);
      }
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log("\n\n=== SCRAPING COMPLETE ===\n");
  console.log(`Total products:       ${skus.length}`);
  console.log(`Not in database:      ${notFound}`);
  console.log(`Updated with images:  ${updated}`);
  console.log(`Skipped (no new):     ${skipped}`);
  console.log(`Errors:               ${errors}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
