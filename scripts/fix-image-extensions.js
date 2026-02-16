import pg from 'pg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;
const PUBLIC_DIR = '/home/runner/workspace/public';
const BATCH_SIZE = 20;
const ALT_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let stats = {
  totalProducts: 0,
  totalImages: 0,
  alreadyCorrect: 0,
  extensionFixed: 0,
  convertedToWebp: 0,
  missingFiles: 0,
  skippedExternal: 0,
  errors: 0,
};

async function findActualFile(imagePath) {
  const fullPath = path.join(PUBLIC_DIR, imagePath);
  if (fs.existsSync(fullPath)) {
    return { found: true, actualPath: fullPath, dbPath: imagePath };
  }
  const ext = path.extname(imagePath);
  const basePath = imagePath.slice(0, imagePath.length - ext.length);
  for (const altExt of ALT_EXTENSIONS) {
    if (altExt === ext) continue;
    const altDbPath = basePath + altExt;
    const altFullPath = path.join(PUBLIC_DIR, altDbPath);
    if (fs.existsSync(altFullPath)) {
      return { found: true, actualPath: altFullPath, dbPath: altDbPath };
    }
  }
  return { found: false, actualPath: null, dbPath: imagePath };
}

async function convertToWebp(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.webp') return inputPath;
  const webpPath = inputPath.slice(0, inputPath.length - ext.length) + '.webp';
  if (fs.existsSync(webpPath)) return webpPath;
  try {
    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);
    return webpPath;
  } catch (err) {
    console.error(`  ERROR converting ${inputPath}: ${err.message}`);
    return null;
  }
}

async function processImage(dbImagePath) {
  if (!dbImagePath.startsWith('/')) {
    stats.skippedExternal++;
    return dbImagePath;
  }

  const result = await findActualFile(dbImagePath);

  if (!result.found) {
    stats.missingFiles++;
    console.log(`  MISSING: ${dbImagePath}`);
    return dbImagePath;
  }

  const ext = path.extname(result.actualPath).toLowerCase();
  if (ext === '.webp') {
    const relPath = '/' + path.relative(PUBLIC_DIR, result.actualPath);
    if (relPath !== dbImagePath) {
      stats.extensionFixed++;
    } else {
      stats.alreadyCorrect++;
    }
    return relPath;
  }

  const webpFullPath = await convertToWebp(result.actualPath);
  if (!webpFullPath) {
    stats.errors++;
    return result.dbPath;
  }

  stats.convertedToWebp++;
  const webpRelPath = '/' + path.relative(PUBLIC_DIR, webpFullPath);
  return webpRelPath;
}

async function processBatch(products, batchNum, totalBatches) {
  console.log(`\nBatch ${batchNum}/${totalBatches} (${products.length} products)`);
  const updates = [];

  for (const product of products) {
    const images = product.images || [];
    if (images.length === 0) continue;

    const newImages = [];
    let changed = false;

    for (const img of images) {
      stats.totalImages++;
      const newPath = await processImage(img);
      newImages.push(newPath);
      if (newPath !== img) changed = true;
    }

    if (changed) {
      updates.push({ id: product.id, sku: product.sku, images: newImages });
    }
  }

  if (updates.length > 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const update of updates) {
        await client.query(
          'UPDATE products SET images = $1 WHERE id = $2',
          [update.images, update.id]
        );
      }
      await client.query('COMMIT');
      console.log(`  Updated ${updates.length} products in DB`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  DB ERROR in batch ${batchNum}: ${err.message}`);
      stats.errors++;
    } finally {
      client.release();
    }
  } else {
    console.log(`  No changes needed`);
  }
}

async function generateMigrationSQL() {
  console.log('\nGenerating migration SQL...');
  const { rows } = await pool.query(
    `SELECT sku, images FROM products WHERE array_length(images, 1) > 0 ORDER BY sku`
  );

  const lines = [];
  lines.push(`-- Migration: Localize all product images (external URLs -> local WebP)`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Total products with images: ${rows.length}`);
  lines.push(`-- All images are now local paths (no external URLs)`);
  lines.push('');

  for (const row of rows) {
    const imgArray = row.images
      .map(img => `'${img.replace(/'/g, "''")}'`)
      .join(', ');
    const skuEscaped = row.sku.replace(/'/g, "''");
    lines.push(`UPDATE products SET images = ARRAY[${imgArray}] WHERE sku = '${skuEscaped}';`);
  }

  const migrationPath = '/home/runner/workspace/server/migrations/localize_all_images.sql';
  fs.writeFileSync(migrationPath, lines.join('\n') + '\n');
  console.log(`Migration written to ${migrationPath} (${rows.length} products)`);
}

async function verify() {
  console.log('\n=== VERIFICATION ===');
  const { rows } = await pool.query(
    `SELECT id, sku, images FROM products WHERE array_length(images, 1) > 0`
  );

  let missingCount = 0;
  let nonWebpCount = 0;
  let totalImages = 0;

  for (const row of rows) {
    for (const img of row.images) {
      if (!img.startsWith('/')) continue;
      totalImages++;
      const fullPath = path.join(PUBLIC_DIR, img);
      if (!fs.existsSync(fullPath)) {
        missingCount++;
      } else if (!img.endsWith('.webp')) {
        nonWebpCount++;
      }
    }
  }

  console.log(`Total local images in DB: ${totalImages}`);
  console.log(`Missing files: ${missingCount}`);
  console.log(`Non-WebP images: ${nonWebpCount}`);
}

async function main() {
  console.log('=== Fix Image Extensions Script ===\n');

  const { rows: products } = await pool.query(
    `SELECT id, sku, images FROM products WHERE array_length(images, 1) > 0 ORDER BY id`
  );

  stats.totalProducts = products.length;
  console.log(`Found ${products.length} products with images`);

  const totalBatches = Math.ceil(products.length / BATCH_SIZE);

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    await processBatch(batch, batchNum, totalBatches);
  }

  console.log('\n=== STATS ===');
  console.log(`Total products: ${stats.totalProducts}`);
  console.log(`Total images processed: ${stats.totalImages}`);
  console.log(`Already correct (WebP): ${stats.alreadyCorrect}`);
  console.log(`Extension fixed: ${stats.extensionFixed}`);
  console.log(`Converted to WebP: ${stats.convertedToWebp}`);
  console.log(`Missing files: ${stats.missingFiles}`);
  console.log(`Skipped external: ${stats.skippedExternal}`);
  console.log(`Errors: ${stats.errors}`);

  await verify();
  await generateMigrationSQL();

  await pool.end();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
