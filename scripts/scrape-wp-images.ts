import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import * as cheerio from "cheerio";

const SITEMAP_URL = "https://caraudiolimburg.nl/product-sitemap.xml";
const DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeCalUrl(url: string): string {
  return url.replace("www.caraudiolimburg.nl", "caraudiolimburg.nl");
}

function toFullSizeUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.\w+)$/, "$1");
}

function extractFilename(url: string): string {
  const normalized = normalizeCalUrl(url);
  const match = normalized.match(/wp-content\/uploads\/(.+)$/);
  if (!match) return "";
  return toFullSizeUrl(match[1]);
}

interface SitemapEntry {
  loc: string;
  slug: string;
  imageFilenames: string[];
  imageUrls: string[];
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const response = await fetch(SITEMAP_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const entries: SitemapEntry[] = [];

  $("url").each((_, el) => {
    const loc = $(el).find("loc").first().text().trim();
    if (!loc) return;

    const normalized = normalizeCalUrl(loc);
    const slugMatch = normalized.match(/\/webshop\/([^/]+)\/?$/);
    if (!slugMatch) return;

    const slug = slugMatch[1];
    const imageFilenames: string[] = [];
    const imageUrls: string[] = [];

    $(el).find("image\\:image image\\:loc, image\\:loc").each((_, imgEl) => {
      const imgUrl = $(imgEl).text().trim();
      if (imgUrl) {
        const normalizedImgUrl = normalizeCalUrl(imgUrl);
        const filename = extractFilename(normalizedImgUrl);
        if (filename) {
          imageFilenames.push(filename);
          imageUrls.push(toFullSizeUrl(normalizedImgUrl));
        }
      }
    });

    entries.push({ loc: normalized, slug, imageFilenames, imageUrls });
  });

  console.log(`Found ${entries.length} products in sitemap\n`);
  return entries;
}

async function fetchGalleryImages(pageUrl: string): Promise<string[]> {
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
    const normalized = normalizeCalUrl(src);

    if (!normalized.includes("caraudiolimburg.nl/wp-content/uploads/")) return;
    if (normalized.match(/-100x100\.\w+$/)) return;
    if (normalized.match(/-150x150\.\w+$/)) return;

    const fullSizeUrl = toFullSizeUrl(normalized);
    imageUrls.add(fullSizeUrl);
  });

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const normalized = normalizeCalUrl(href);

    if (!normalized.includes("caraudiolimburg.nl/wp-content/uploads/")) return;

    const fullSizeUrl = toFullSizeUrl(normalized);
    imageUrls.add(fullSizeUrl);
  });

  return Array.from(imageUrls);
}

function isCalImage(url: string): boolean {
  const normalized = normalizeCalUrl(url);
  return normalized.includes("caraudiolimburg.nl");
}

async function main() {
  console.log("=== WordPress Image Scraper for Car Audio Limburg ===\n");

  const sitemapEntries = await fetchSitemap();

  const filenameToEntry = new Map<string, SitemapEntry>();
  const slugToEntry = new Map<string, SitemapEntry>();

  for (const entry of sitemapEntries) {
    slugToEntry.set(entry.slug, entry);
    for (const filename of entry.imageFilenames) {
      filenameToEntry.set(filename, entry);
    }
  }

  console.log("Fetching products from database...");
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      images: products.images,
      isActive: products.isActive,
    })
    .from(products)
    .where(eq(products.isActive, true));

  const targetProducts = allProducts.filter(p => {
    const imgs = p.images || [];
    return imgs.length <= 1;
  });

  console.log(`Found ${allProducts.length} active products, ${targetProducts.length} with ≤1 image\n`);

  let matched = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let noMatch = 0;
  let skippedNonCal = 0;

  for (let i = 0; i < targetProducts.length; i++) {
    const product = targetProducts[i];
    const currentImages = product.images || [];
    const firstImage = currentImages[0] || "";

    if (firstImage && !isCalImage(firstImage)) {
      skippedNonCal++;
      continue;
    }

    let wpEntry: SitemapEntry | undefined;

    if (firstImage) {
      const filename = extractFilename(firstImage);
      if (filename) {
        wpEntry = filenameToEntry.get(filename);
      }
    }

    if (!wpEntry && product.slug) {
      wpEntry = slugToEntry.get(product.slug);
    }

    if (!wpEntry) {
      noMatch++;
      continue;
    }

    matched++;
    console.log(`[${i + 1}/${targetProducts.length}] ${product.name}`);
    console.log(`  Matched WP page: ${wpEntry.loc}`);

    try {
      const galleryImages = await fetchGalleryImages(wpEntry.loc);

      if (galleryImages.length <= 1) {
        console.log(`  Only ${galleryImages.length} image(s) on page, skipping`);
        skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      const newImages: string[] = [];

      if (firstImage) {
        const normalizedFirst = toFullSizeUrl(normalizeCalUrl(firstImage));
        newImages.push(firstImage);

        const seenFilenames = new Set<string>();
        seenFilenames.add(extractFilename(normalizedFirst));

        for (const img of galleryImages) {
          const imgFilename = extractFilename(img);
          if (imgFilename && !seenFilenames.has(imgFilename)) {
            seenFilenames.add(imgFilename);
            newImages.push(img);
          }
        }
      } else {
        const seenFilenames = new Set<string>();
        for (const img of galleryImages) {
          const imgFilename = extractFilename(img);
          if (imgFilename && !seenFilenames.has(imgFilename)) {
            seenFilenames.add(imgFilename);
            newImages.push(img);
          }
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
        console.log(`  No new images found (${newImages.length} total)`);
        skipped++;
      }
    } catch (error: any) {
      const msg = error.message || String(error);
      if (msg.includes("404")) {
        console.log(`  404 Not Found`);
      } else {
        console.log(`  Error: ${msg}`);
      }
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log("\n\n=== SCRAPING COMPLETE ===\n");
  console.log(`Total products with ≤1 image: ${targetProducts.length}`);
  console.log(`Skipped (non-CAL images):     ${skippedNonCal}`);
  console.log(`No WP match found:            ${noMatch}`);
  console.log(`Matched to WP page:           ${matched}`);
  console.log(`Updated with new images:      ${updated}`);
  console.log(`Skipped (no new images):      ${skipped}`);
  console.log(`Errors:                       ${errors}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
