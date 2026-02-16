import pg from 'pg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const { Pool } = pg;

const PRODUCTS_DIR = '/home/runner/workspace/public/products';
const MIGRATION_PATH = '/home/runner/workspace/server/migrations/localize_all_images.sql';
const CSV_PATH = '/home/runner/workspace/attached_assets/Producten_-_CAL_-_Producten_1764907071080.csv';
const USER_AGENT = 'Mozilla/5.0 (compatible; CarAudioLimburg/1.0)';
const CONCURRENCY = 5;
const DOWNLOAD_TIMEOUT = 15000;
const MAX_REDIRECTS = 3;
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1200;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function skuToKebab(sku) {
  return sku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function downloadImage(url, maxRedirects = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: DOWNLOAD_TIMEOUT }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        res.resume();
        return downloadImage(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function tryDownload(url) {
  try {
    const buf = await downloadImage(url);
    if (buf.length < 512) return null;
    return buf;
  } catch (e) {
    return null;
  }
}

async function convertToWebP(inputBuffer) {
  const img = sharp(inputBuffer);
  const metadata = await img.metadata();
  let pipeline = img;
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
}

function parseCSV(csvText) {
  const skuToImage = {};
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && i + 1 < csvText.length && csvText[i + 1] === '\n') i++;
        row.push(field);
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0].trim())) {
          rows.push(row);
        }
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length > 7) {
      const sku = (r[4] || '').trim();
      const featuredImage = (r[7] || '').trim();
      if (sku && featuredImage && featuredImage.startsWith('http')) {
        skuToImage[sku] = featuredImage;
      }
    }
  }

  return skuToImage;
}

async function processInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(fn));
  }
}

async function main() {
  console.log('=== Fix Remaining External Images ===\n');

  let csvMap = {};
  try {
    const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
    csvMap = parseCSV(csvText);
    console.log(`Loaded CSV with ${Object.keys(csvMap).length} SKU-to-image mappings`);
    const sample = Object.entries(csvMap).slice(0, 3);
    for (const [k, v] of sample) console.log(`  Sample: ${k} -> ${v.substring(0, 80)}`);
    console.log('');
  } catch (e) {
    console.log('Warning: Could not load CSV:', e.message);
  }

  const { rows: externalProducts } = await pool.query(
    `SELECT p.id, p.sku, p.name, p.images 
     FROM products p 
     WHERE EXISTS (SELECT 1 FROM unnest(p.images) img WHERE img LIKE 'http%')
     ORDER BY p.sku`
  );

  const { rows: emptyProducts } = await pool.query(
    `SELECT p.id, p.sku, p.name, p.images 
     FROM products p 
     WHERE images = '{}' OR images IS NULL OR array_length(images, 1) IS NULL
     ORDER BY p.sku`
  );

  console.log(`Products with external URLs: ${externalProducts.length}`);
  console.log(`Products with empty images: ${emptyProducts.length}\n`);

  const fixedWithThumbnail = [];
  const externalRemoved = [];
  const noImagesAtAll = [];
  let totalDownloaded = 0;

  const downloadJobs = [];

  for (const product of [...externalProducts, ...emptyProducts]) {
    const csvUrl = csvMap[product.sku] || null;
    if (!csvUrl) continue;

    const images = product.images || [];
    const hasExternal = images.some(img => img.startsWith('http'));
    const isEmpty = images.length === 0;

    if (!hasExternal && !isEmpty) continue;

    let nextIdx = 0;
    for (const img of images) {
      if (!img.startsWith('http')) {
        const match = img.match(/-(\d+)\.webp$/);
        if (match) nextIdx = Math.max(nextIdx, parseInt(match[1]));
      }
    }
    nextIdx = nextIdx > 0 ? nextIdx + 1 : 1;

    downloadJobs.push({
      product,
      csvUrl,
      fileIndex: nextIdx,
      kebabSku: skuToKebab(product.sku),
      isEmpty,
    });
  }

  console.log(`Products with CSV fallback URLs to download: ${downloadJobs.length}`);

  const productsWithoutCSV = externalProducts.filter(p => !csvMap[p.sku]);
  console.log(`Products without CSV match (will clean external URLs): ${productsWithoutCSV.length}\n`);

  const csvDownloadResults = new Map();

  await processInBatches(downloadJobs, CONCURRENCY, async (job) => {
    const { product, csvUrl, fileIndex, kebabSku } = job;
    const filename = `${kebabSku}-${fileIndex}.webp`;
    const outputPath = path.join(PRODUCTS_DIR, filename);
    const localPath = `/products/${filename}`;

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 512) {
      totalDownloaded++;
      csvDownloadResults.set(product.id, localPath);
      console.log(`  ✓ ${product.sku}: ${filename} (already exists)`);
      return;
    }

    const buffer = await tryDownload(csvUrl);
    if (buffer) {
      try {
        const webpBuffer = await convertToWebP(buffer);
        fs.writeFileSync(outputPath, webpBuffer);
        totalDownloaded++;
        csvDownloadResults.set(product.id, localPath);
        console.log(`  ✓ ${product.sku}: ${filename}`);
      } catch (e) {
        console.log(`  ✗ ${product.sku}: convert error - ${e.message}`);
      }
    } else {
      console.log(`  ✗ ${product.sku}: CSV URL failed - ${csvUrl.substring(0, 80)}`);
    }
  });

  console.log(`\nDownloaded ${totalDownloaded} images from CSV URLs\n`);
  console.log('Updating database...\n');

  let updatedCount = 0;

  for (const product of externalProducts) {
    const images = product.images || [];
    const localImages = images.filter(img => !img.startsWith('http'));
    const externalUrls = images.filter(img => img.startsWith('http'));

    if (externalUrls.length === 0) continue;

    let newImages = [...localImages];

    const csvLocalPath = csvDownloadResults.get(product.id);
    if (csvLocalPath && !newImages.includes(csvLocalPath)) {
      newImages.unshift(csvLocalPath);
      fixedWithThumbnail.push(product.sku);
    }

    if (newImages.length > 0) {
      if (!csvLocalPath && localImages.length > 0) {
        externalRemoved.push({
          sku: product.sku,
          removedCount: externalUrls.length,
          localCount: localImages.length,
        });
      }
    } else {
      noImagesAtAll.push(product.sku);
    }

    try {
      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [newImages, product.id]);
      updatedCount++;
    } catch (e) {
      console.log(`  DB update failed for ${product.sku}: ${e.message}`);
    }
  }

  for (const product of emptyProducts) {
    const csvLocalPath = csvDownloadResults.get(product.id);
    if (csvLocalPath) {
      try {
        await pool.query('UPDATE products SET images = $1 WHERE id = $2', [[csvLocalPath], product.id]);
        updatedCount++;
        fixedWithThumbnail.push(product.sku);
      } catch (e) {
        console.log(`  DB update failed for ${product.sku}: ${e.message}`);
      }
    } else {
      noImagesAtAll.push(product.sku);
    }
  }

  console.log(`Updated ${updatedCount} products in database\n`);

  console.log('Regenerating SQL migration file...\n');

  const { rows: allProductsForMigration } = await pool.query(
    `SELECT sku, images FROM products 
     WHERE images IS NOT NULL AND array_length(images, 1) > 0
     ORDER BY sku`
  );

  const migrationLines = [
    `-- Migration: Localize all external product images to WebP`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total products with images: ${allProductsForMigration.length}`,
    '',
  ];

  for (const p of allProductsForMigration) {
    const arrayStr = p.images.map(img => `'${img.replace(/'/g, "''")}'`).join(', ');
    const skuEscaped = p.sku.replace(/'/g, "''");
    migrationLines.push(`UPDATE products SET images = ARRAY[${arrayStr}] WHERE sku = '${skuEscaped}';`);
  }

  fs.writeFileSync(MIGRATION_PATH, migrationLines.join('\n') + '\n');

  const { rows: remaining } = await pool.query(
    `SELECT COUNT(*) as cnt FROM products p WHERE EXISTS (SELECT 1 FROM unnest(p.images) img WHERE img LIKE 'http%')`
  );

  console.log('=== REPORT ===\n');
  console.log(`Products fixed with thumbnail URLs: ${fixedWithThumbnail.length}`);
  for (const sku of fixedWithThumbnail) console.log(`  - ${sku}`);

  console.log(`\nProducts where external URLs were removed (had local backups): ${externalRemoved.length}`);
  for (const r of externalRemoved) console.log(`  - ${r.sku} (removed ${r.removedCount}, kept ${r.localCount} local)`);

  console.log(`\nProducts that still have no images at all: ${noImagesAtAll.length}`);
  for (const sku of noImagesAtAll) console.log(`  - ${sku}`);

  console.log(`\nImages downloaded from CSV: ${totalDownloaded}`);
  console.log(`Total remaining external URLs: ${remaining[0].cnt}`);
  console.log(`\nMigration file written to: ${MIGRATION_PATH}`);
  console.log('Done!');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
