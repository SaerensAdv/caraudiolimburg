import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'products');
const CSV_PATH = path.join(__dirname, '..', 'attached_assets', 'Producten_-_CAL_-_Producten_1764907071080.csv');
const USER_AGENT = 'Mozilla/5.0 (compatible; CarAudioLimburg/1.0)';
const DOWNLOAD_TIMEOUT = 15000;

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      if (text[i] === '"') {
        i++;
        let field = '';
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; }
          else { field += text[i]; i++; }
        }
        row.push(field);
        if (text[i] === ',') i++;
      } else {
        let field = '';
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i]; i++;
        }
        row.push(field);
        if (text[i] === ',') i++;
      }
      if (i >= text.length || text[i] === '\n' || text[i] === '\r') {
        if (text[i] === '\r' && text[i + 1] === '\n') i += 2;
        else if (i < text.length) i++;
        break;
      }
    }
    if (row.length > 0) rows.push(row);
  }
  return rows;
}

function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: DOWNLOAD_TIMEOUT }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function convertToWebp(inputBuffer, outputPath) {
  await sharp(inputBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

function skuToKebab(sku) {
  return sku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeForMatch(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('=== Fix Empty Image Products ===\n');

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const csvRows = parseCSV(csvContent);
  console.log(`Parsed ${csvRows.length} CSV rows`);

  const csvEntries = [];
  for (const row of csvRows.slice(1)) {
    if (row.length > 7) {
      const title = (row[0] || '').trim();
      const sku = (row[4] || '').trim();
      const img = (row[7] || '').trim();
      if (title && img) {
        csvEntries.push({ title, sku, img });
      }
    }
  }
  console.log(`Found ${csvEntries.length} CSV entries with images\n`);

  const result = await pool.query(
    "SELECT id, name, sku, images FROM products WHERE images = '{}' OR images IS NULL OR array_length(images, 1) IS NULL ORDER BY name"
  );
  const products = result.rows;
  console.log(`Found ${products.length} products with empty images\n`);

  const localFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));

  const report = { fixed: [], failed: [] };

  for (const product of products) {
    const { id, name, sku } = product;
    console.log(`--- Processing: ${name} (SKU: ${sku}) ---`);

    let imageUrls = [];
    let source = '';
    let localMatch = [];

    const skuNorm = normalizeForMatch(sku);
    const skuWithoutCal = sku.replace(/^CAL-/i, '');
    const skuWithoutCalNorm = normalizeForMatch(skuWithoutCal);

    for (const entry of csvEntries) {
      const csvSkuNorm = normalizeForMatch(entry.sku);
      const csvSkuWithoutCal = normalizeForMatch(entry.sku.replace(/^CAL-/i, ''));
      if (csvSkuNorm === skuNorm || csvSkuNorm === skuWithoutCalNorm ||
          csvSkuWithoutCal === skuNorm || csvSkuWithoutCal === skuWithoutCalNorm) {
        imageUrls.push(entry.img);
        source = `CSV SKU match (${entry.sku})`;
        break;
      }
    }

    if (imageUrls.length === 0) {
      const modelParts = name.split(' ').filter(p => p.length > 2);
      const modelNumber = modelParts.slice(1).join(' ');
      for (const entry of csvEntries) {
        const titleLower = entry.title.toLowerCase();
        if (modelNumber && titleLower.includes(modelNumber.toLowerCase())) {
          imageUrls.push(entry.img);
          source = `CSV title match ("${entry.title.substring(0, 50)}")`;
          break;
        }
      }
    }

    if (imageUrls.length === 0) {
      const wpThumbnailMap = {
        'BV-ELITE8-1CH': ['https://caraudiolimburg.nl/wp-content/uploads/ELITE-8-4-300x300.webp'],
        'BV-ELITE8-2CH': ['https://caraudiolimburg.nl/wp-content/uploads/BlackVue-Elite-8-2ch-300x300.webp'],
        'BV-DR970X-1CH-PLUS-II': ['https://caraudiolimburg.nl/wp-content/uploads/DR970X-PLUS-1CH-2-300x300.webp'],
        'BV-DR970X-2CH-PLUS-II': ['https://caraudiolimburg.nl/wp-content/uploads/DR970X-PLUS-2CH-300x300.webp'],
        'BV-DR970X-2CH-LTE-PLUS-II': ['https://caraudiolimburg.nl/wp-content/uploads/DR970X-LTE-Plus-2CH-1-1-300x300.webp'],
        'BV-DR900X-1CH': [
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-Plus-1CH-Productshot-300x300.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-1CH-300x300.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-Plus-1CH-300x300.webp',
        ],
        'BV-DR900X-2CH': [
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-Plus-2CH-Productshot-300x300.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-2CH-300x300.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DR900X-Plus-2CH-300x300.webp',
        ],
        'CAL-DMX-F920DS': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX-F920DS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX-F920DS-FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX-F920DS_FRONT-300x205.png',
        ],
        'CAL-DMX-F920DSCamper': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX-F920DS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX-F920DS-FRONT-300x205.png',
        ],
        'CAL-DMX129BT': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX129BT-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX129BT_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX129BT-FRONT-300x205.png',
        ],
        'CAL-DMX129DAB': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX129DAB-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX129DAB_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX129DAB-FRONT-300x205.png',
        ],
        'CAL-DMX5023DABS': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX5023DABS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX5023DABS_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX5023DABS-FRONT-300x205.png',
        ],
        'CAL-DMX553DABCamper': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX553DAB-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX553DAB_FRONT-300x205.png',
        ],
        'CAL-DMX6523DABCamper': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX6523DABS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX6523DABS_FRONT-300x205.png',
        ],
        'CAL-DMX6523DABS': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX6523DABS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX6523DABS_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX6523DABS-FRONT-300x205.png',
        ],
        'CAL-DMX7525DABS': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX7525DABS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX7525DABS_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX7525DABS-FRONT-300x205.png',
        ],
        'CAL-DMX9724XDSCamper': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX9724XDS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX9724XDS_FRONT-300x205.png',
        ],
        'CAL-DMX9724XDS': [
          'https://caraudiolimburg.nl/wp-content/uploads/DMX9724XDS-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/25_DMX9724XDS_FRONT-300x205.png',
          'https://caraudiolimburg.nl/wp-content/uploads/DMX9724XDS-FRONT-300x205.png',
        ],
        'CAL-SPH-EVO-107DAB-D7': [
          'https://caraudiolimburg.nl/wp-content/uploads/SPH-EVO-107DAB-D7-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/SPH-EVO107DAB-D7-300x300.webp',
        ],
        'SPKUP-VWG': [
          'https://caraudiolimburg.nl/wp-content/uploads/SPKUP-VWG-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/Golf-IV-V-VI-Speakerset-300x300.webp',
          'https://caraudiolimburg.nl/wp-content/uploads/SPKUP-VWG-300x300.png',
        ],
      };

      const urls = wpThumbnailMap[sku];
      if (urls) {
        for (const url of urls) {
          try {
            console.log(`  Trying WP thumbnail: ${url}`);
            const buf = await downloadUrl(url);
            if (buf.length > 500) {
              imageUrls.push('__downloaded__');
              source = `WP thumbnail (${url})`;
              const outFile = path.join(PRODUCTS_DIR, `${skuToKebab(sku)}-1.webp`);
              await convertToWebp(buf, outFile);
              const relPath = `/products/${skuToKebab(sku)}-1.webp`;
              await pool.query('UPDATE products SET images = $1 WHERE id = $2', [[relPath], id]);
              console.log(`  ✅ Fixed with WP thumbnail → ${relPath}`);
              report.fixed.push({ name, sku, source, images: [relPath] });
              break;
            }
          } catch (e) {
            console.log(`  ❌ WP thumbnail failed: ${e.message}`);
          }
        }
        if (imageUrls.length > 0) continue;
      }
    }

    if (imageUrls.length === 0) {
      const skuKebab = skuToKebab(sku);
      const skuWithoutCalKebab = skuToKebab(skuWithoutCal);

      const localPatterns = [
        skuKebab,
        skuWithoutCalKebab,
        sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ];

      const nameSlug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const skuParts = {
        'BV-DR900X-1CH': ['blackvue-dr900x-plus-1ch'],
        'BV-DR900X-2CH': ['blackvue-dr900x-plus-2ch'],
        'BV-DR970X-1CH-PLUS-II': ['blackvue-dr970x-1ch', 'bv-dr970x-1ch'],
        'BV-DR970X-2CH-PLUS-II': ['blackvue-dr970x-2ch', 'bv-dr970x-2ch'],
        'BV-DR970X-2CH-LTE-PLUS-II': ['blackvue-dr970x-2ch-lte', 'bv-dr970x-2ch-lte'],
        'BV-ELITE8-1CH': ['blackvue-elite-8-1ch', 'bv-elite8-1ch', 'elite-8-1ch'],
        'BV-ELITE8-2CH': ['blackvue-elite-8-2ch', 'bv-elite8-2ch', 'elite-8-2ch'],
        'CAL-SPH-EVO-107DAB-D7': ['cal-sph-evo-107dab-c-d7', 'cal-sph-evo-107dab-d7', 'sph-evo-107dab-d7'],
        'CAL-SPH-EVO-107DAB-D8': ['cal-sph-evo-107dab-c-d8', 'cal-sph-evo-107dab-d8', 'sph-evo-107dab-d8'],
        'CAL-SPH-EVO-107DAB-RM': ['cal-sph-evo-107dab-crm', 'cal-sph-evo-107dab-rm', 'sph-evo-107dab-rm'],
        'CAL-SPH-EVO-107DAB-S': ['cal-sph-evo-107dab-c-s', 'cal-sph-evo-107dab-s', 'sph-evo-107dab-s'],
        'CAL-SPH-EVO-107DAB-T': ['cal-sph-evo-107dab-t61', 'cal-sph-evo-107dab-t', 'sph-evo-107dab-t'],
        'SPKUP-VWG': ['spkup-vwg', 'focal-golf', 'golf-iv-v-vi'],
        'CAL-DMX-F920DS': ['cal-dmx-f920ds', 'dmx-f920ds', 'kenwood-dmx-f920ds'],
        'CAL-DMX-F920DSCamper': ['cal-dmx-f920ds', 'dmx-f920ds', 'kenwood-dmx-f920ds'],
        'CAL-DMX129BT': ['cal-dmx129bt', 'dmx129bt', 'kenwood-dmx129bt'],
        'CAL-DMX129DAB': ['cal-dmx129dab', 'dmx129dab', 'kenwood-dmx129dab'],
        'CAL-DMX5023DABS': ['cal-dmx5023dabs', 'dmx5023dabs', 'kenwood-dmx5023dabs'],
        'CAL-DMX553DABCamper': ['cal-dmx553dab', 'dmx553dab', 'kenwood-dmx553dab'],
        'CAL-DMX6523DABCamper': ['cal-dmx6523dab', 'dmx6523dab', 'kenwood-dmx6523dab'],
        'CAL-DMX6523DABS': ['cal-dmx6523dabs', 'dmx6523dabs', 'kenwood-dmx6523dabs'],
        'CAL-DMX7525DABS': ['cal-dmx7525dabs', 'dmx7525dabs', 'kenwood-dmx7525dabs'],
        'CAL-DMX9724XDSCamper': ['cal-dmx9724xds', 'dmx9724xds', 'kenwood-dmx9724xds'],
        'CAL-DMX9724XDS': ['cal-dmx9724xds', 'dmx9724xds', 'kenwood-dmx9724xds'],
      };

      const extraPatterns = skuParts[sku] || [];
      const allPatterns = [...localPatterns, ...extraPatterns, nameSlug];

      for (const pattern of allPatterns) {
        const matches = localFiles.filter(f => f.toLowerCase().startsWith(pattern));
        if (matches.length > 0) {
          localMatch = matches.sort().slice(0, 4);
          source = `Local files (pattern: ${pattern})`;
          break;
        }
      }

      if (localMatch.length > 0) {
        const images = localMatch.map(f => `/products/${f}`);
        await pool.query('UPDATE products SET images = $1 WHERE id = $2', [images, id]);
        console.log(`  ✅ Fixed with local files → ${images.join(', ')}`);
        report.fixed.push({ name, sku, source, images });
        continue;
      }
    }

    if (imageUrls.length > 0 && imageUrls[0] !== '__downloaded__') {
      const url = imageUrls[0].split('?')[0];
      try {
        console.log(`  Downloading: ${url}`);
        const buf = await downloadUrl(url);
        if (buf.length > 500) {
          const outFile = path.join(PRODUCTS_DIR, `${skuToKebab(sku)}-1.webp`);
          await convertToWebp(buf, outFile);
          const relPath = `/products/${skuToKebab(sku)}-1.webp`;
          await pool.query('UPDATE products SET images = $1 WHERE id = $2', [[relPath], id]);
          console.log(`  ✅ Fixed with CSV image → ${relPath}`);
          report.fixed.push({ name, sku, source, images: [relPath] });
          continue;
        }
      } catch (e) {
        console.log(`  ❌ Download failed: ${e.message}`);
      }
    }

    if (!report.fixed.find(r => r.sku === sku)) {
      console.log(`  ⚠️  No image found`);
      report.failed.push({ name, sku });
    }
  }

  console.log('\n\n========== REPORT ==========\n');
  console.log(`✅ FIXED (${report.fixed.length} products):`);
  for (const item of report.fixed) {
    console.log(`  ${item.name} (${item.sku})`);
    console.log(`    Source: ${item.source}`);
    console.log(`    Images: ${item.images.join(', ')}`);
  }

  console.log(`\n❌ STILL MISSING (${report.failed.length} products):`);
  for (const item of report.failed) {
    console.log(`  ${item.name} (${item.sku})`);
  }

  console.log(`\nTotal: ${report.fixed.length} fixed, ${report.failed.length} still missing out of ${products.length}`);

  await pool.end();
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
