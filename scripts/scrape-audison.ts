import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq, ilike } from "drizzle-orm";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

interface ScrapedProduct {
  id: string;
  name: string;
  sku: string;
  url: string;
  status: "success" | "404" | "error";
  description?: string;
  specifications?: Record<string, string>;
  mainImageUrl?: string;
  localImagePath?: string;
  error?: string;
}

interface UrlMapping {
  [sku: string]: {
    url: string;
    productName: string;
  };
}

const AUDISON_BASE_URL = "https://www.audison.com/product/";
const OUTPUT_DIR = "/home/runner/workspace/public/products/audison";
const RESULTS_FILE = "/home/runner/workspace/scripts/audison-scrape-results.json";
const MAPPING_FILE = "/home/runner/workspace/scripts/audison-url-mapping.json";
const DELAY_MS = 500;

function skuToUrl(sku: string): string {
  return sku
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[.]/g, "-")
    .replace(/[Ω]/g, "")
    .replace(/--+/g, "-")
    .replace(/-$/g, "")
    .replace(/^-/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(imageUrl: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`  Failed to download image: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const localPath = path.join(OUTPUT_DIR, `${filename}${ext}`);
    
    fs.writeFileSync(localPath, buffer);
    console.log(`  Downloaded image to: ${localPath}`);
    
    return `/products/audison/${filename}${ext}`;
  } catch (error) {
    console.error(`  Error downloading image: ${error}`);
    return null;
  }
}

async function scrapeProductPage(url: string): Promise<{
  description?: string;
  specifications?: Record<string, string>;
  mainImageUrl?: string;
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let description = "";
    const descriptionSelectors = [
      ".product-description",
      ".product-content",
      ".description",
      '[class*="description"]',
      ".entry-content",
      "article p",
      ".product-details p",
    ];

    for (const selector of descriptionSelectors) {
      const found = $(selector).first().text().trim();
      if (found && found.length > 50) {
        description = found;
        break;
      }
    }

    if (!description) {
      $("p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 100 && !description) {
          description = text;
        }
      });
    }

    const specifications: Record<string, string> = {};
    const specSelectors = [
      ".specifications table tr",
      ".product-specs tr",
      ".spec-table tr",
      '[class*="spec"] tr',
      "table.specs tr",
      ".technical-data tr",
    ];

    for (const selector of specSelectors) {
      $(selector).each((_, row) => {
        const cells = $(row).find("td, th");
        if (cells.length >= 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (key && value && key.length < 100) {
            specifications[key] = value;
          }
        }
      });
      if (Object.keys(specifications).length > 0) break;
    }

    if (Object.keys(specifications).length === 0) {
      $("dl").each((_, dl) => {
        $(dl).find("dt").each((i, dt) => {
          const key = $(dt).text().trim();
          const value = $(dt).next("dd").text().trim();
          if (key && value) {
            specifications[key] = value;
          }
        });
      });
    }

    let mainImageUrl = "";
    const imageSelectors = [
      ".product-image img",
      ".product-gallery img",
      ".main-image img",
      '[class*="product"] img',
      ".woocommerce-product-gallery img",
      "article img",
      ".entry-content img",
    ];

    for (const selector of imageSelectors) {
      const img = $(selector).first();
      const src = img.attr("src") || img.attr("data-src") || img.attr("data-large-image");
      if (src && !src.includes("placeholder") && !src.includes("logo")) {
        mainImageUrl = src.startsWith("http") ? src : `https://www.audison.com${src}`;
        break;
      }
    }

    return {
      description: description || undefined,
      specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
      mainImageUrl: mainImageUrl || undefined,
    };
  } catch (error) {
    throw error;
  }
}

async function main() {
  console.log("Starting Audison product scraper...\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }

  console.log("Fetching Audison products from database...");
  const audisonProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      slug: products.slug,
    })
    .from(products)
    .where(ilike(products.name, "%audison%"));

  console.log(`Found ${audisonProducts.length} Audison products\n`);

  const urlMapping: UrlMapping = {};
  const results: ScrapedProduct[] = [];

  for (const product of audisonProducts) {
    if (!product.sku) {
      console.log(`Skipping ${product.name} - no SKU`);
      continue;
    }

    const urlSlug = skuToUrl(product.sku);
    const fullUrl = `${AUDISON_BASE_URL}${urlSlug}/`;

    urlMapping[product.sku] = {
      url: fullUrl,
      productName: product.name,
    };

    console.log(`\n[${results.length + 1}/${audisonProducts.length}] Processing: ${product.name}`);
    console.log(`  SKU: ${product.sku}`);
    console.log(`  URL: ${fullUrl}`);

    try {
      const scraped = await scrapeProductPage(fullUrl);

      if (scraped === null) {
        console.log(`  Status: 404 Not Found`);
        results.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          url: fullUrl,
          status: "404",
        });
      } else {
        console.log(`  Status: Success`);
        if (scraped.description) {
          console.log(`  Description: ${scraped.description.substring(0, 100)}...`);
        }
        if (scraped.specifications) {
          console.log(`  Specifications: ${Object.keys(scraped.specifications).length} items`);
        }

        let localImagePath: string | undefined;
        if (scraped.mainImageUrl) {
          console.log(`  Image URL: ${scraped.mainImageUrl}`);
          const imageFilename = `${urlSlug}-main`;
          localImagePath = await downloadImage(scraped.mainImageUrl, imageFilename) || undefined;
        }

        results.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          url: fullUrl,
          status: "success",
          description: scraped.description,
          specifications: scraped.specifications,
          mainImageUrl: scraped.mainImageUrl,
          localImagePath,
        });
      }
    } catch (error) {
      console.log(`  Status: Error - ${error}`);
      results.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        url: fullUrl,
        status: "error",
        error: String(error),
      });
    }

    await sleep(DELAY_MS);
  }

  console.log("\n\n=== SCRAPING COMPLETE ===\n");
  console.log(`Total products: ${audisonProducts.length}`);
  console.log(`Successful: ${results.filter(r => r.status === "success").length}`);
  console.log(`404 Not Found: ${results.filter(r => r.status === "404").length}`);
  console.log(`Errors: ${results.filter(r => r.status === "error").length}`);

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(urlMapping, null, 2));
  console.log(`\nURL mapping saved to: ${MAPPING_FILE}`);

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`Results saved to: ${RESULTS_FILE}`);

  console.log("\n=== NEXT STEPS ===");
  console.log("1. Review the URL mapping file to verify URLs are correct");
  console.log("2. Review the results file for scraped data");
  console.log("3. Run with --update-db flag to update the database");

  const updateDb = process.argv.includes("--update-db");
  if (updateDb) {
    console.log("\n=== UPDATING DATABASE ===\n");
    
    const successfulResults = results.filter(r => r.status === "success");
    let updated = 0;

    for (const result of successfulResults) {
      try {
        const updateData: Record<string, any> = {};
        
        if (result.description) {
          updateData.description = result.description;
        }
        if (result.specifications) {
          updateData.specifications = result.specifications;
        }
        if (result.localImagePath) {
          updateData.images = [result.localImagePath];
        }

        if (Object.keys(updateData).length > 0) {
          await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, result.id));
          console.log(`Updated: ${result.name}`);
          updated++;
        }
      } catch (error) {
        console.error(`Failed to update ${result.name}: ${error}`);
      }
    }

    console.log(`\nDatabase update complete. Updated ${updated} products.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
