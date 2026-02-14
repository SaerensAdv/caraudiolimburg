import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";

const DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });
    if (!response.ok) {
      console.log(`  HTTP ${response.status} for ${url}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.log(`  Fetch error for ${url}: ${error}`);
    return null;
  }
}

function extractHertzImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (src && src.includes("static.hertz-audio.com") && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https:${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("static.hertz-audio.com") && (href.endsWith(".jpg") || href.endsWith(".png") || href.endsWith(".webp"))) {
      const fullUrl = href.startsWith("http") ? href : `https:${href}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("[data-src]").each((_, el) => {
    const src = $(el).attr("data-src");
    if (src && src.includes("static.hertz-audio.com") && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https:${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("source").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset && srcset.includes("static.hertz-audio.com")) {
      const urls = srcset.split(",").map(s => s.trim().split(" ")[0]);
      for (const url of urls) {
        const fullUrl = url.startsWith("http") ? url : `https:${url}`;
        if (!images.includes(fullUrl) && !fullUrl.includes("logo") && !fullUrl.includes("icon")) {
          images.push(fullUrl);
        }
      }
    }
  });
  return images;
}

function extractFocalImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && src.includes("dam.focal-naim.com") && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https:${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("[data-src]").each((_, el) => {
    const src = $(el).attr("data-src");
    if (src && src.includes("dam.focal-naim.com") && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https:${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("source").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset && srcset.includes("dam.focal-naim.com")) {
      const urls = srcset.split(",").map(s => s.trim().split(" ")[0]);
      for (const url of urls) {
        const fullUrl = url.startsWith("http") ? url : `https:${url}`;
        if (!images.includes(fullUrl) && !fullUrl.includes("logo") && !fullUrl.includes("icon")) {
          images.push(fullUrl);
        }
      }
    }
  });
  return images;
}

function extractKenwoodImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && (src.includes("kenwood") || src.includes("/car/")) && !src.includes("logo") && !src.includes("icon") && !src.includes("favicon")) {
      const fullUrl = src.startsWith("http") ? src : (src.startsWith("//") ? `https:${src}` : `https://www.kenwood-europe.com${src}`);
      if (!images.includes(fullUrl) && (fullUrl.endsWith(".jpg") || fullUrl.endsWith(".png") || fullUrl.endsWith(".webp") || fullUrl.includes("/img/") || fullUrl.includes("/image/"))) {
        images.push(fullUrl);
      }
    }
  });
  return images;
}

function extractAudisonImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-large-image");
    if (src && (src.includes("static.audison.com") || src.includes("audison.com/media")) && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https://www.audison.com${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  $("[data-src]").each((_, el) => {
    const src = $(el).attr("data-src");
    if (src && (src.includes("static.audison.com") || src.includes("audison.com/media")) && !src.includes("logo") && !src.includes("icon")) {
      const fullUrl = src.startsWith("http") ? src : `https://www.audison.com${src}`;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });
  return images;
}

interface ProductConfig {
  sku: string;
  urls: string[];
  extractFn: ($: cheerio.CheerioAPI) => string[];
  brand: string;
}

const hertzProducts: ProductConfig[] = [
  { sku: "CAL DBX 30.3", urls: ["https://www.hertz-audio.com/product/dbx-30-3/", "https://www.hertz-audio.com/car-audio/subwoofer-boxes/dieci/dbx-30-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "CAL-MPBX 250 S2", urls: ["https://www.hertz-audio.com/product/mpbx-250-s2/", "https://www.hertz-audio.com/car-audio/subwoofer-boxes/mille-pro/mpbx-250-s2/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "CAL-MPBX 300 S2", urls: ["https://www.hertz-audio.com/product/mpbx-300-s2/", "https://www.hertz-audio.com/car-audio/subwoofer-boxes/mille-pro/mpbx-300-s2/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "DPower 1", urls: ["https://www.hertz-audio.com/product/dpower-1/", "https://www.hertz-audio.com/product/dp-power-1/", "https://www.hertz-audio.com/car-audio/amplifiers/dieci-power/dpower-1/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "DSK 130.3", urls: ["https://www.hertz-audio.com/product/dsk-130-3/", "https://www.hertz-audio.com/car-audio/speakers/dieci/dsk-130-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "DSK 160.3", urls: ["https://www.hertz-audio.com/product/dsk-160-3/", "https://www.hertz-audio.com/car-audio/speakers/dieci/dsk-160-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "DSK 165.3", urls: ["https://www.hertz-audio.com/product/dsk-165-3/", "https://www.hertz-audio.com/car-audio/speakers/dieci/dsk-165-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "DSK 170.3", urls: ["https://www.hertz-audio.com/product/dsk-170-3/", "https://www.hertz-audio.com/car-audio/speakers/dieci/dsk-170-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "ML Power 1", urls: ["https://www.hertz-audio.com/product/ml-power-1/", "https://www.hertz-audio.com/car-audio/amplifiers/mille-legend/ml-power-1/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "ML Power 4", urls: ["https://www.hertz-audio.com/product/ml-power-4/", "https://www.hertz-audio.com/car-audio/amplifiers/mille-legend/ml-power-4/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "ML Power 5", urls: ["https://www.hertz-audio.com/product/ml-power-5/", "https://www.hertz-audio.com/car-audio/amplifiers/mille-legend/ml-power-5/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "MLK 165.3", urls: ["https://www.hertz-audio.com/product/mlk-165-3/", "https://www.hertz-audio.com/car-audio/speakers/mille-legend/mlk-165-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "MLK 700.3", urls: ["https://www.hertz-audio.com/product/mlk-700-3/", "https://www.hertz-audio.com/car-audio/speakers/mille-legend/mlk-700-3/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "SS 12 D2", urls: ["https://www.hertz-audio.com/product/ss-12-d2/", "https://www.hertz-audio.com/car-audio/subwoofers/spl-show/ss-12-d2/"], extractFn: extractHertzImages, brand: "Hertz" },
  { sku: "SS 15 D2", urls: ["https://www.hertz-audio.com/product/ss-15-d2/", "https://www.hertz-audio.com/car-audio/subwoofers/spl-show/ss-15-d2/"], extractFn: extractHertzImages, brand: "Hertz" },
];

const focalProducts: ProductConfig[] = [
  { sku: "CAL-EU35WM", urls: ["https://www.focal.com/en/car-audio/integration/utopia-m/eu-3-5-wm", "https://www.focal.com/en/car-audio/utopia-m/eu-3-5-wm"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-EUSUB10WM", urls: ["https://www.focal.com/en/car-audio/integration/utopia-m/eu-sub-10-wm", "https://www.focal.com/en/car-audio/utopia-m/eu-sub-10-wm"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-FocalP60", urls: ["https://www.focal.com/en/car-audio/integration/performance/p-60-limited-edition", "https://www.focal.com/en/car-audio/performance/p-60-limited-edition", "https://www.focal.com/en/car-audio/p-60-limited-edition"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-ICREN130", urls: ["https://www.focal.com/en/car-audio/oem-integration/inside/ic-ren-130", "https://www.focal.com/en/car-audio/inside/ic-ren-130"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-IMPULSE", urls: ["https://www.focal.com/en/car-audio/amplifiers/impulse/impulse-4-320", "https://www.focal.com/en/car-audio/impulse-4-320"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-ISBMW100", urls: ["https://www.focal.com/en/car-audio/oem-integration/inside/is-bmw-100", "https://www.focal.com/en/car-audio/inside/is-bmw-100"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-ISUB MBZ-2", urls: ["https://www.focal.com/en/car-audio/oem-integration/inside/isub-mbz-2", "https://www.focal.com/en/car-audio/inside/isub-mbz-2"], extractFn: extractFocalImages, brand: "Focal" },
  { sku: "CAL-ISUBBMW4", urls: ["https://www.focal.com/en/car-audio/oem-integration/inside/isub-bmw-4", "https://www.focal.com/en/car-audio/inside/isub-bmw-4"], extractFn: extractFocalImages, brand: "Focal" },
];

const kenwoodProducts: ProductConfig[] = [
  { sku: "CAL-DMX8021DABS", urls: ["https://www.kenwood-europe.com/car/multimedia/dmx8021dabs/", "https://www.kenwood.com/car/audio_visual/dmx8021dabs/"], extractFn: extractKenwoodImages, brand: "Kenwood" },
  { sku: "CAL-DMX9720XDS", urls: ["https://www.kenwood-europe.com/car/multimedia/dmx9720xds/", "https://www.kenwood.com/car/audio_visual/dmx9720xds/"], extractFn: extractKenwoodImages, brand: "Kenwood" },
  { sku: "CAL-DNR992RVS", urls: ["https://www.kenwood-europe.com/car/multimedia/dnr992rvs/", "https://www.kenwood.com/car/audio_visual/dnr992rvs/"], extractFn: extractKenwoodImages, brand: "Kenwood" },
];

const audisonProducts: ProductConfig[] = [
  { sku: "APK 570", urls: ["https://www.audison.com/product/apk-570/"], extractFn: extractAudisonImages, brand: "Audison" },
];

const allProducts: ProductConfig[] = [...hertzProducts, ...focalProducts, ...kenwoodProducts, ...audisonProducts];

async function processProduct(config: ProductConfig): Promise<{ sku: string; brand: string; newImages: number; status: string }> {
  console.log(`\nProcessing [${config.brand}] SKU: ${config.sku}`);

  const [product] = await db
    .select({ id: products.id, name: products.name, images: products.images })
    .from(products)
    .where(eq(products.sku, config.sku));

  if (!product) {
    console.log(`  Product not found in database`);
    return { sku: config.sku, brand: config.brand, newImages: 0, status: "not_found" };
  }

  const existingImages = product.images || [];
  console.log(`  Current images: ${existingImages.length}`);

  let allFoundImages: string[] = [];

  for (const url of config.urls) {
    console.log(`  Trying: ${url}`);
    const html = await fetchPage(url);
    if (html) {
      const $ = cheerio.load(html);
      const found = config.extractFn($);
      console.log(`  Found ${found.length} images from this URL`);
      for (const img of found) {
        if (!allFoundImages.includes(img)) {
          allFoundImages.push(img);
        }
      }
      if (found.length > 0) break;
    }
    await sleep(DELAY_MS);
  }

  if (allFoundImages.length === 0) {
    console.log(`  No images found on manufacturer website`);
    return { sku: config.sku, brand: config.brand, newImages: 0, status: "no_images_found" };
  }

  console.log(`  Total unique images found: ${allFoundImages.length}`);

  const normalizeUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  };

  const existingPaths = existingImages.map(normalizeUrl);
  const newImages = allFoundImages.filter(img => {
    const path = normalizeUrl(img);
    return !existingPaths.some(ep => ep === path || img === existingImages[existingPaths.indexOf(ep)]);
  });

  if (newImages.length === 0) {
    console.log(`  All found images already exist`);
    return { sku: config.sku, brand: config.brand, newImages: 0, status: "all_exist" };
  }

  console.log(`  New images to add: ${newImages.length}`);
  for (const img of newImages) {
    console.log(`    + ${img}`);
  }

  const updatedImages = [...existingImages, ...newImages];
  await db
    .update(products)
    .set({ images: updatedImages })
    .where(eq(products.id, product.id));

  console.log(`  Updated database: ${existingImages.length} -> ${updatedImages.length} images`);
  return { sku: config.sku, brand: config.brand, newImages: newImages.length, status: "updated" };
}

async function main() {
  console.log("=== Manufacturer Image Scraper ===");
  console.log(`Processing ${allProducts.length} products across 4 brands\n`);

  const results: { sku: string; brand: string; newImages: number; status: string }[] = [];

  for (let i = 0; i < allProducts.length; i++) {
    const config = allProducts[i];
    console.log(`\n[${i + 1}/${allProducts.length}] ---`);
    const result = await processProduct(config);
    results.push(result);
    await sleep(DELAY_MS);
  }

  console.log("\n\n=== SUMMARY ===\n");
  const updated = results.filter(r => r.status === "updated");
  const noImages = results.filter(r => r.status === "no_images_found");
  const allExist = results.filter(r => r.status === "all_exist");
  const notFound = results.filter(r => r.status === "not_found");

  console.log(`Total products processed: ${results.length}`);
  console.log(`Updated with new images: ${updated.length}`);
  console.log(`No new images found on site: ${noImages.length}`);
  console.log(`All images already existed: ${allExist.length}`);
  console.log(`Not found in database: ${notFound.length}`);

  if (updated.length > 0) {
    console.log("\nProducts updated:");
    for (const r of updated) {
      console.log(`  [${r.brand}] ${r.sku}: +${r.newImages} images`);
    }
  }

  if (noImages.length > 0) {
    console.log("\nNo images found:");
    for (const r of noImages) {
      console.log(`  [${r.brand}] ${r.sku}`);
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.newImages, 0);
  console.log(`\nTotal new images added: ${totalNew}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
