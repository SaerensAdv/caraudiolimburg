import pg from 'pg';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '..', 'attached_assets', 'Producten_-_CAL_-_Producten_1764907071080.csv');
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'products');

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"' && i + 1 < content.length && content[i + 1] === '"') {
        currentField += '"';
        i += 2;
      } else if (char === '"') {
        inQuotes = false;
        i++;
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (char === '\n' || (char === '\r' && i + 1 < content.length && content[i + 1] === '\n')) {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        if (char === '\r') i += 2;
        else i++;
      } else if (char === '\r') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function buildSKUMap(rows) {
  const skuMap = new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 8) continue;
    const title = (row[0] || '').trim();
    const sku = (row[4] || '').trim();
    const featuredImage = (row[7] || '').trim();
    if (!sku || !featuredImage) continue;
    skuMap.set(sku, { title, sku, featuredImage });
  }
  return skuMap;
}

function normalizeSKU(sku) {
  return sku.toLowerCase().replace(/[-\s]+/g, '');
}

function findCSVMatch(dbSku, skuMap) {
  if (skuMap.has(dbSku)) return skuMap.get(dbSku);

  for (const [csvSku, data] of skuMap) {
    if (csvSku.toLowerCase() === dbSku.toLowerCase()) return data;
  }

  const dbSkuNoPrefix = dbSku.replace(/^CAL-/i, '');
  for (const [csvSku, data] of skuMap) {
    const csvSkuNoPrefix = csvSku.replace(/^CAL-/i, '');
    if (csvSkuNoPrefix.toLowerCase() === dbSkuNoPrefix.toLowerCase()) return data;
    if (csvSku.toLowerCase() === dbSkuNoPrefix.toLowerCase()) return data;
    if (csvSkuNoPrefix.toLowerCase() === dbSku.toLowerCase()) return data;
  }

  const dbNorm = normalizeSKU(dbSku.replace(/^CAL-/i, ''));
  for (const [csvSku, data] of skuMap) {
    const csvNorm = normalizeSKU(csvSku.replace(/^CAL-/i, ''));
    if (dbNorm === csvNorm) return data;
  }

  return null;
}

function getFullSizeURL(thumbnailURL) {
  return thumbnailURL.replace(/-\d+x\d+(\.\w+)/, '$1');
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
    const protocol = cleanUrl.startsWith('https') ? https : http;

    protocol.get(cleanUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function getExtension(url) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).split('?')[0].toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return ext;
  return '.jpg';
}

async function downloadImage(imageURL, slug) {
  const fullSizeURL = getFullSizeURL(imageURL);
  const ext = getExtension(fullSizeURL);
  const filename = `${slug}-wp${ext}`;
  const filepath = path.join(PRODUCTS_DIR, filename);

  if (fs.existsSync(filepath)) {
    return { success: true, filename, path: `/products/${filename}`, skipped: true };
  }

  try {
    const data = await downloadFile(fullSizeURL);
    fs.writeFileSync(filepath, data);
    return { success: true, filename, path: `/products/${filename}`, url: fullSizeURL };
  } catch (err) {
    if (fullSizeURL !== imageURL) {
      try {
        const data = await downloadFile(imageURL);
        const thumbExt = getExtension(imageURL);
        const thumbFilename = `${slug}-wp-thumb${thumbExt}`;
        const thumbPath = path.join(PRODUCTS_DIR, thumbFilename);
        fs.writeFileSync(thumbPath, data);
        return { success: true, filename: thumbFilename, path: `/products/${thumbFilename}`, url: imageURL, fallback: true };
      } catch (err2) {
        return { success: false, error: `Full: ${err.message}, Thumb: ${err2.message}` };
      }
    }
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('=== Replace AI-Generated Images Script ===\n');

  console.log('1. Parsing CSV file...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvContent);
  console.log(`   Parsed ${rows.length - 1} rows (excluding header)`);

  const skuMap = buildSKUMap(rows);
  console.log(`   Found ${skuMap.size} products with SKU + Featured Image\n`);

  console.log('2. Querying database for products with studio images...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const result = await pool.query(`
    SELECT id, sku, name, slug, images 
    FROM products 
    WHERE EXISTS (SELECT 1 FROM unnest(images) AS img WHERE img LIKE '%studio%')
  `);

  const studioProducts = result.rows;
  console.log(`   Found ${studioProducts.length} products with studio (AI) images\n`);

  console.log('3. Matching products and downloading images...\n');

  const matched = [];
  const unmatched = [];
  const failed = [];
  const updated = [];

  for (const product of studioProducts) {
    const csvMatch = findCSVMatch(product.sku, skuMap);

    if (!csvMatch) {
      unmatched.push(product);
      continue;
    }

    matched.push({ product, csvMatch });

    console.log(`   [MATCH] ${product.name} (${product.sku} → ${csvMatch.sku})`);

    const downloadResult = await downloadImage(csvMatch.featuredImage, product.slug);

    if (!downloadResult.success) {
      console.log(`   [FAIL]  Download failed: ${downloadResult.error}`);
      failed.push({ product, csvMatch, error: downloadResult.error });
      continue;
    }

    if (downloadResult.skipped) {
      console.log(`   [SKIP]  Already downloaded: ${downloadResult.filename}`);
    } else if (downloadResult.fallback) {
      console.log(`   [THUMB] Used thumbnail fallback: ${downloadResult.filename}`);
    } else {
      console.log(`   [OK]    Downloaded: ${downloadResult.filename}`);
    }

    const nonStudioImages = (product.images || []).filter(img => !img.includes('studio'));
    const newImages = [downloadResult.path, ...nonStudioImages];

    await pool.query(
      'UPDATE products SET images = $1, updated_at = NOW() WHERE id = $2',
      [newImages, product.id]
    );

    updated.push({ product, csvMatch, downloadResult, newImages });
    console.log(`   [DB]    Updated images array (${newImages.length} images)\n`);
  }

  console.log('\n=== REPORT ===\n');
  console.log(`Total products with studio (AI) images: ${studioProducts.length}`);
  console.log(`Matched with CSV:                       ${matched.length}`);
  console.log(`Successfully updated:                   ${updated.length}`);
  console.log(`Failed downloads:                       ${failed.length}`);
  console.log(`Unmatched (no CSV match):                ${unmatched.length}`);

  if (failed.length > 0) {
    console.log('\n--- Failed Downloads ---');
    for (const f of failed) {
      console.log(`  - ${f.product.name} (${f.product.sku}): ${f.error}`);
    }
  }

  if (unmatched.length > 0) {
    console.log('\n--- Unmatched Products (still have AI images) ---');
    for (const u of unmatched) {
      console.log(`  - ${u.name} (SKU: ${u.sku})`);
    }
  }

  if (updated.length > 0) {
    console.log('\n--- Successfully Updated ---');
    for (const u of updated) {
      console.log(`  - ${u.product.name}: ${u.downloadResult.path}`);
    }
  }

  await pool.end();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
