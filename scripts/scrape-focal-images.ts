import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const SKU_TO_SLUG: Record<string, string> = {
  'CAL-ISU130': 'isu-130',
  'CAL-ISU165': 'isu-165',
  'CAL-ISU200': 'isu-200',
  'CAL-ISU690': 'isu-690',
  'CAL-ICU100': 'icu-100',
  'CAL-ICU130': 'icu-130',
  'CAL-ICU165': 'icu-165',
  'CAL-ICU570': 'icu-570',
  'CAL-ICU690': 'icu-690',
  'CAL-ISBMW100': 'is-bmw-100',
  'CAL-ISBMW100L': 'is-bmw-100l',
  'CAL-ICBMW100': 'ic-bmw-100',
  'CAL-ICBMW100L': 'ic-bmw-100l',
  'CAL-ICCBMW100': 'icc-bmw-100',
  'CAL-ISUBBMW2': 'isub-bmw-2',
  'CAL-ISUBBMW4': 'isub-bmw-4',
  'CAL-IS165VW': 'is-vw-165',
  'CAL-IS155VW': 'is-vw-155',
  'CAL-IS180VW': 'is-vw-180',
  'CAL-IC165VW': 'ic-vw-165',
  'CAL-ISFORD165': 'is-ford-165',
  'CAL-ISFORD690': 'is-ford-690',
  'CAL-ICFORD165-1': 'ic-ford-165',
  'CAL-ICFORD690': 'ic-ford-690',
  'CAL-ISPSA165': 'is-psa-165',
  'CAL-ICPSA165': 'ic-psa-165',
  'CAL-ISREN130': 'is-ren-130',
  'CAL-ICREN130': 'ic-ren-130',
  'CAL-ISRNS165': 'is-rns-165',
  'CAL-ICRNS165': 'ic-rns-165',
  'CAL-ISRNI690': 'is-rni-690',
  'CAL-ISTOY165': 'is-toy-165',
  'CAL-ISTOY690': 'is-toy-690',
  'CAL-ICTOY165': 'ic-toy-165',
  'CAL-IS T3Y 100': 'is-t3y-100',
  'CAL-IC T3Y 100': 'ic-t3y-100',
  'CAL-ICC T3Y 100': 'icc-t3y-100',
  'CAL-IW-T3Y-200': 'iw-t3y-200',
  'Cal-IS MBZ 100': 'is-mbz-100',
  'Cal-IC MBZ 100': 'ic-mbz-100',
  'Cal-IC MBZ 100-1': 'icr-mbz-100',
  'Cal-ICC-MBZ 100': 'icc-mbz-100',
  'CAL-ISUB MBZ-2': 'isub-mbz-2',
  'CAL-PS165FE': 'ps-165-fe',
  'CAL-PS165FSE': 'ps-165-fse',
  'CAL-PS165FXE': 'ps-165-fxe',
  'CAL-PS165F3E': 'ps-165-f3e',
  'CAL-PC165FE': 'pc-165-fe',
  'CAL-P20FE': 'p-20-fe',
  'CAL-P20FSE': 'p-20-fse',
  'CAL-P25FE': 'p-25-fe',
  'CAL-P25FSE': 'p-25-fse',
  'CAL-PC130': 'pc-130',
  'CAL-PC165': 'pc-165',
  'CAL-EC165K': 'ec-165-k',
  'CAL-ESUB25KX': 'e-25-kx',
  'CAL-ESUB30KX': 'e-30-kx',
  'CAL-EU35WM': 'eu-3-5-wm',
  'CAL-EUSUB10WM': 'eu-sub-10-wm',
  'CAL-FPX1.1000': 'fpx-1-1000',
  'CAL-FPX4.400SQ': 'fpx-4-400-sq',
  'CAL-FPX4.800': 'fpx-4-800',
  'CAL-FPX5.1200': 'fpx-5-1200',
  'CAL-IMPULSE': 'impulse',
  'CAL-IBUS2.1': 'ibus-2-1',
};

const SKIP_SKUS = ['CAL-EU6WM', 'CAL-EU8WM', 'CAL-FocalP60'];

const ALT_SLUGS: Record<string, string[]> = {
  'fpx-4-800': ['fpx-4800'],
  'fpx-1-1000': ['fpx-11000'],
  'fpx-4-400-sq': ['fpx-4400-sq', 'fpx-4-400sq'],
  'fpx-5-1200': ['fpx-51200'],
  'ibus-2-1': ['ibus-21', 'ibus2-1'],
  'pc-130': ['pc130'],
  'pc-165': ['pc165'],
  'ec-165-k': ['ec-165k', 'ec165-k'],
  'e-25-kx': ['e-25kx', 'e25-kx'],
  'e-30-kx': ['e-30kx', 'e30-kx'],
  'eu-3-5-wm': ['eu-35-wm', 'eu3-5-wm'],
  'eu-sub-10-wm': ['eu-sub-10wm', 'eusub-10-wm'],
  'p-20-fe': ['p-20fe', 'p20-fe'],
  'p-20-fse': ['p-20fse', 'p20-fse'],
  'p-25-fe': ['p-25fe', 'p25-fe'],
  'p-25-fse': ['p-25fse', 'p25-fse'],
  'ps-165-fe': ['ps-165fe', 'ps165-fe'],
  'ps-165-fse': ['ps-165fse', 'ps165-fse'],
  'ps-165-fxe': ['ps-165fxe', 'ps165-fxe'],
  'ps-165-f3e': ['ps-165f3e', 'ps165-f3e'],
  'pc-165-fe': ['pc-165fe', 'pc165-fe'],
};

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'products', 'focal');
const SQL_OUTPUT_FILE = path.join(process.cwd(), 'scripts', 'focal-images-update.sql');

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<{ status: number; html: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
  const html = await res.text();
  return { status: res.status, html };
}

function extractImageUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const srcset = $(el).attr('srcset') || '';
    const dataSrc = $(el).attr('data-src') || '';

    for (const candidate of [src, dataSrc]) {
      if (candidate.includes('dam.focal-naim.com') && candidate.includes('/original/')) {
        urls.add(candidate.split('?')[0]);
      }
    }

    if (srcset.includes('dam.focal-naim.com')) {
      const parts = srcset.split(',');
      for (const part of parts) {
        const url = part.trim().split(/\s+/)[0];
        if (url.includes('dam.focal-naim.com') && url.includes('/original/')) {
          urls.add(url.split('?')[0]);
        }
      }
    }
  });

  $('source').each((_, el) => {
    const srcset = $(el).attr('srcset') || '';
    if (srcset.includes('dam.focal-naim.com')) {
      const parts = srcset.split(',');
      for (const part of parts) {
        const url = part.trim().split(/\s+/)[0];
        if (url.includes('dam.focal-naim.com') && url.includes('/original/')) {
          urls.add(url.split('?')[0]);
        }
      }
    }
  });

  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/url\(['"]?(https:\/\/dam\.focal-naim\.com[^'")\s]+)['"]?\)/);
    if (match && match[1].includes('/original/')) {
      urls.add(match[1].split('?')[0]);
    }
  });

  $('a[href*="dam.focal-naim.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('/original/') && href.match(/\.(jpg|jpeg|png|webp)$/i)) {
      urls.add(href.split('?')[0]);
    }
  });

  const htmlStr = html;
  const regex = /https:\/\/dam\.focal-naim\.com\/m\/[a-f0-9]+\/original\/[^"'\s<>]+\.jpg/gi;
  const matches = htmlStr.match(regex);
  if (matches) {
    for (const m of matches) {
      urls.add(m.split('?')[0]);
    }
  }

  return Array.from(urls);
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) {
      console.log(`  ⚠️  Failed to download ${url}: ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
    return true;
  } catch (err: any) {
    console.log(`  ⚠️  Error downloading ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🔍 Scraping Focal website for product images...\n');

  const sqlStatements: string[] = [];
  const results: { sku: string; slug: string; images: string[]; status: string }[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  const entries = Object.entries(SKU_TO_SLUG);
  const total = entries.length;

  for (let i = 0; i < entries.length; i++) {
    const [sku, slug] = entries[i];

    if (SKIP_SKUS.includes(sku)) {
      console.log(`[${i + 1}/${total}] ⏭️  Skipping ${sku} (excluded)`);
      skipCount++;
      continue;
    }

    const skuLowerCheck = sku.toLowerCase().replace(/[\s.]/g, '-').replace(/[^a-z0-9-]/g, '');
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith(skuLowerCheck + '-'));
    if (existingFiles.length > 0) {
      const existingPaths = existingFiles.sort().map(f => `/products/focal/${f}`);
      const imagesArray = existingPaths.map(p => `'${p}'`).join(', ');
      sqlStatements.push(`UPDATE products SET images = ARRAY[${imagesArray}] WHERE sku = '${sku.replace(/'/g, "''")}';`);
      console.log(`[${i + 1}/${total}] ✅ Already downloaded ${existingFiles.length} images for ${sku}`);
      results.push({ sku, slug, images: existingPaths, status: 'success' });
      successCount++;
      continue;
    }

    console.log(`[${i + 1}/${total}] 🌐 Fetching ${sku} → focal.com/products/${slug}`);

    let imageUrls: string[] = [];
    let usedSlug = slug;
    let pageFound = false;

    const slugsToTry = [slug, ...(ALT_SLUGS[slug] || [])];

    for (const trySlug of slugsToTry) {
      const url = `https://www.focal.com/products/${trySlug}`;
      try {
        const { status, html } = await fetchPage(url);

        if (status === 200) {
          const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';
          const is404 = title.toLowerCase().includes('page not found') || title.toLowerCase().includes('404');
          if (!is404) {
            imageUrls = extractImageUrls(html);
            usedSlug = trySlug;
            pageFound = true;
            if (imageUrls.length > 0) break;
          } else {
            console.log(`  ↳ ${trySlug}: 404 page (title: ${title})`);
          }
        } else {
          console.log(`  ↳ ${trySlug}: HTTP ${status}`);
        }
      } catch (err: any) {
        console.log(`  ↳ ${trySlug}: Error - ${err.message}`);
      }

      if (slugsToTry.indexOf(trySlug) < slugsToTry.length - 1) {
        await sleep(500);
      }
    }

    if (!pageFound || imageUrls.length === 0) {
      console.log(`  ❌ No images found for ${sku}`);
      results.push({ sku, slug, images: [], status: 'no_images' });
      failCount++;
      await sleep(1000);
      continue;
    }

    console.log(`  ✅ Found ${imageUrls.length} images (slug: ${usedSlug})`);

    const skuLower = sku.toLowerCase().replace(/[\s.]/g, '-').replace(/[^a-z0-9-]/g, '');
    const downloadedPaths: string[] = [];

    for (let j = 0; j < imageUrls.length; j++) {
      const imgUrl = imageUrls[j];
      const filename = `${skuLower}-${j + 1}.jpg`;
      const filepath = path.join(OUTPUT_DIR, filename);
      const relPath = `/products/focal/${filename}`;

      console.log(`  📥 Downloading image ${j + 1}/${imageUrls.length}: ${path.basename(imgUrl)}`);
      const success = await downloadImage(imgUrl, filepath);
      if (success) {
        downloadedPaths.push(relPath);
      }
      await sleep(100);
    }

    if (downloadedPaths.length > 0) {
      const imagesArray = downloadedPaths.map(p => `'${p}'`).join(', ');
      const sql = `UPDATE products SET images = ARRAY[${imagesArray}] WHERE sku = '${sku.replace(/'/g, "''")}';`;
      sqlStatements.push(sql);
      console.log(`  💾 ${downloadedPaths.length} images saved`);
      successCount++;
    }

    results.push({ sku, slug: usedSlug, images: downloadedPaths, status: downloadedPaths.length > 0 ? 'success' : 'download_failed' });
    await sleep(1000);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed/No images: ${failCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`📦 Total: ${total}`);

  if (sqlStatements.length > 0) {
    const sqlContent = '-- Focal product image updates\n-- Generated: ' + new Date().toISOString() + '\n\n' + sqlStatements.join('\n') + '\n';
    fs.writeFileSync(SQL_OUTPUT_FILE, sqlContent);
    console.log(`\n📄 SQL file saved to: ${SQL_OUTPUT_FILE}`);
    console.log('\nGenerated SQL statements:');
    console.log(sqlContent);
  } else {
    console.log('\n⚠️  No SQL statements generated');
  }

  console.log('\n📋 Detailed results:');
  for (const r of results) {
    const status = r.status === 'success' ? `✅ ${r.images.length} images` : r.status === 'no_images' ? '❌ No images found' : '⚠️  Download failed';
    console.log(`  ${r.sku} (${r.slug}): ${status}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
