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

const stats = {
  productsProcessed: 0,
  imagesDownloaded: 0,
  imagesFailed: 0,
  imagesConvertedLocal: 0,
  failedDetails: [],
  noImagesProducts: [],
  productsUpdated: 0,
};

function skuToKebab(sku) {
  return sku
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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

async function downloadWithRetry(url, retries = 1) {
  try {
    return await downloadImage(url);
  } catch (err) {
    if (retries > 0 && !err.message.includes('404')) {
      await new Promise(r => setTimeout(r, 500));
      return downloadWithRetry(url, retries - 1);
    }
    throw err;
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

async function convertLocalFileToWebP(localPath) {
  const fullPath = path.join('/home/runner/workspace/public', localPath);
  if (!fs.existsSync(fullPath)) return null;
  const inputBuffer = fs.readFileSync(fullPath);
  if (inputBuffer.length < 1024) return null;
  const webpBuffer = await convertToWebP(inputBuffer);
  const parsed = path.parse(fullPath);
  const webpPath = path.join(parsed.dir, parsed.name.replace(/-wp$/, '') + '.webp');
  fs.writeFileSync(webpPath, webpBuffer);
  const relativePath = '/' + path.relative('/home/runner/workspace/public', webpPath);
  return relativePath;
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length > 7 && fields[4] && fields[7]) {
      map[fields[4].trim()] = fields[7].trim();
    }
  }
  return map;
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('=== Product Image Localizer ===\n');

  let csvFallback = {};
  try {
    const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
    csvFallback = parseCSV(csvText);
    console.log(`Loaded CSV fallback with ${Object.keys(csvFallback).length} SKUs\n`);
  } catch (e) {
    console.log('Warning: Could not load CSV fallback:', e.message);
  }

  const { rows: products } = await pool.query(
    `SELECT id, sku, name, images, brand_id FROM products WHERE images IS NOT NULL AND array_length(images, 1) > 0`
  );

  console.log(`Found ${products.length} products with images\n`);

  const updates = [];
  const downloadTasks = [];

  for (const product of products) {
    const images = product.images || [];
    const hasExternal = images.some(img => img.startsWith('http'));
    const hasWP = images.some(img => !img.startsWith('http') && img.includes('-wp.'));
    if (!hasExternal && !hasWP) continue;

    stats.productsProcessed++;
    const kebabSku = skuToKebab(product.sku);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.startsWith('http')) {
        downloadTasks.push({ product, imageIndex: i, url: img, kebabSku });
      }
    }
  }

  console.log(`Processing ${stats.productsProcessed} products with ${downloadTasks.length} external images to download...\n`);

  const downloadResults = new Map();

  await processInBatches(downloadTasks, CONCURRENCY, async (task) => {
    const { product, imageIndex, url, kebabSku } = task;
    const filename = `${kebabSku}-${imageIndex + 1}.webp`;
    const outputPath = path.join(PRODUCTS_DIR, filename);
    const localPath = `/products/${filename}`;

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024) {
      stats.imagesDownloaded++;
      if (!downloadResults.has(product.id)) downloadResults.set(product.id, {});
      downloadResults.get(product.id)[imageIndex] = localPath;
      return;
    }

    try {
      let buffer = await downloadWithRetry(url);
      if (buffer.length < 1024) throw new Error('File too small (<1KB)');
      const webpBuffer = await convertToWebP(buffer);
      fs.writeFileSync(outputPath, webpBuffer);
      stats.imagesDownloaded++;
      if (!downloadResults.has(product.id)) downloadResults.set(product.id, {});
      downloadResults.get(product.id)[imageIndex] = localPath;
      console.log(`  ✓ ${product.sku} [${imageIndex + 1}]: ${filename}`);
    } catch (err) {
      const csvUrl = csvFallback[product.sku];
      if (csvUrl && csvUrl.startsWith('http')) {
        try {
          let buffer = await downloadWithRetry(csvUrl);
          if (buffer.length < 1024) throw new Error('CSV fallback file too small');
          const webpBuffer = await convertToWebP(buffer);
          fs.writeFileSync(outputPath, webpBuffer);
          stats.imagesDownloaded++;
          if (!downloadResults.has(product.id)) downloadResults.set(product.id, {});
          downloadResults.get(product.id)[imageIndex] = localPath;
          console.log(`  ✓ ${product.sku} [${imageIndex + 1}] (CSV fallback): ${filename}`);
          return;
        } catch (csvErr) {
        }
      }
      stats.imagesFailed++;
      stats.failedDetails.push({ sku: product.sku, url, error: err.message });
      console.log(`  ✗ ${product.sku} [${imageIndex + 1}]: ${err.message}`);
    }
  });

  console.log('\nProcessing local -wp images...');

  for (const product of products) {
    const images = product.images || [];
    let changed = false;
    const newImages = [...images];
    const results = downloadResults.get(product.id) || {};

    for (let i = 0; i < images.length; i++) {
      if (results[i]) {
        newImages[i] = results[i];
        changed = true;
      } else if (!images[i].startsWith('http') && images[i].includes('-wp.')) {
        try {
          const webpPath = await convertLocalFileToWebP(images[i]);
          if (webpPath) {
            newImages[i] = webpPath;
            stats.imagesConvertedLocal++;
            changed = true;
            console.log(`  ↻ ${product.sku}: ${images[i]} → ${webpPath}`);
          }
        } catch (e) {
          console.log(`  ✗ ${product.sku} local convert failed: ${e.message}`);
        }
      }
    }

    if (changed) {
      updates.push({ id: product.id, sku: product.sku, images: newImages });
    }

    const finalImages = changed ? newImages : images;
    const allExternal = finalImages.length > 0 && finalImages.every(img => img.startsWith('http'));
    if (allExternal || finalImages.length === 0) {
      stats.noImagesProducts.push(product.sku);
    }
  }

  console.log('\nUpdating database...');
  for (const update of updates) {
    try {
      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [update.images, update.id]);
      stats.productsUpdated++;
    } catch (e) {
      console.log(`  DB update failed for ${update.sku}: ${e.message}`);
    }
  }

  console.log('Generating SQL migration file...');
  const migrationLines = [
    `-- Migration: Localize all external product images to WebP`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Products updated: ${updates.length}`,
    `-- Images downloaded: ${stats.imagesDownloaded}`,
    `-- Images converted from local: ${stats.imagesConvertedLocal}`,
    `-- Images failed: ${stats.imagesFailed}`,
    '',
  ];

  for (const update of updates) {
    const arrayStr = update.images.map(img => `'${img.replace(/'/g, "''")}'`).join(', ');
    const skuEscaped = update.sku.replace(/'/g, "''");
    migrationLines.push(`UPDATE products SET images = ARRAY[${arrayStr}] WHERE sku = '${skuEscaped}';`);
  }

  fs.writeFileSync(MIGRATION_PATH, migrationLines.join('\n') + '\n');

  console.log('\n=== REPORT ===');
  console.log(`Products processed: ${stats.productsProcessed}`);
  console.log(`Products updated in DB: ${stats.productsUpdated}`);
  console.log(`Images downloaded successfully: ${stats.imagesDownloaded}`);
  console.log(`Images converted from local -wp files: ${stats.imagesConvertedLocal}`);
  console.log(`Images failed: ${stats.imagesFailed}`);

  if (stats.failedDetails.length > 0) {
    console.log('\nFailed images:');
    for (const f of stats.failedDetails) {
      console.log(`  - ${f.sku}: ${f.url} (${f.error})`);
    }
  }

  if (stats.noImagesProducts.length > 0) {
    console.log('\nProducts with no images at all:');
    for (const sku of stats.noImagesProducts) {
      console.log(`  - ${sku}`);
    }
  }

  console.log(`\nMigration file written to: ${MIGRATION_PATH}`);
  console.log('Done!');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
