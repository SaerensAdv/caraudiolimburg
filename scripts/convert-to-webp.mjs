import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const QUALITY = 82;
const dirs = ['public'];

async function getAllImages(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await getAllImages(fullPath));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  try {
    const existing = await stat(webpPath).catch(() => null);
    if (existing) {
      return { status: 'skipped', path: filePath };
    }

    await sharp(filePath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    return { status: 'converted', path: filePath, webpPath };
  } catch (err) {
    return { status: 'error', path: filePath, error: err.message };
  }
}

async function main() {
  let allImages = [];
  for (const dir of dirs) {
    allImages.push(...await getAllImages(dir));
  }

  console.log(`Found ${allImages.length} images to process`);

  let converted = 0, skipped = 0, errors = 0;
  const BATCH_SIZE = 20;

  for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
    const batch = allImages.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(convertFile));
    
    for (const r of results) {
      if (r.status === 'converted') converted++;
      else if (r.status === 'skipped') skipped++;
      else { errors++; console.error(`Error: ${r.path} - ${r.error}`); }
    }
    
    if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= allImages.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, allImages.length)}/${allImages.length} (converted: ${converted}, skipped: ${skipped}, errors: ${errors})`);
    }
  }

  console.log(`\nDone! Converted: ${converted}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
