import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'downloads');

interface ProductMapping {
  sku: string;
  focalSlug: string;
  modelId: string;
  extraPatterns?: string[];
}

const productMappings: ProductMapping[] = [
  // Universal ISU series
  { sku: 'CAL-ISU130', focalSlug: 'isu-130', modelId: 'isu130' },
  { sku: 'CAL-ISU165', focalSlug: 'isu-165', modelId: 'isu165' },
  { sku: 'CAL-ISU200', focalSlug: 'isu-200', modelId: 'isu200' },
  { sku: 'CAL-ISU690', focalSlug: 'isu-690', modelId: 'isu690' },

  // Universal ICU series
  { sku: 'CAL-ICU100', focalSlug: 'icu-100', modelId: 'icu100' },
  { sku: 'CAL-ICU130', focalSlug: 'icu-130', modelId: 'icu130' },
  { sku: 'CAL-ICU165', focalSlug: 'icu-165', modelId: 'icu165' },
  { sku: 'CAL-ICU570', focalSlug: 'icu-570', modelId: 'icu570' },
  { sku: 'CAL-ICU690', focalSlug: 'icu-690', modelId: 'icu690' },

  // Inside BMW series
  { sku: 'CAL-ISBMW100', focalSlug: 'is-bmw-100', modelId: 'isbmw100' },
  { sku: 'CAL-ISBMW100L', focalSlug: 'is-bmw-100l', modelId: 'isbmw100l' },
  { sku: 'CAL-ICBMW100', focalSlug: 'ic-bmw-100', modelId: 'icbmw100' },
  { sku: 'CAL-ICBMW100L', focalSlug: 'ic-bmw-100l', modelId: 'icbmw100l' },
  { sku: 'CAL-ICCBMW100', focalSlug: 'icc-bmw-100', modelId: 'iccbmw100' },
  { sku: 'CAL-ISUBBMW2', focalSlug: 'isub-bmw-2', modelId: 'isubbmw2' },
  { sku: 'CAL-ISUBBMW4', focalSlug: 'isub-bmw-4', modelId: 'isubbmw4' },

  // Inside VW series
  { sku: 'CAL-IS165VW', focalSlug: 'is-vw-165', modelId: 'isvw165' },
  { sku: 'CAL-IS155VW', focalSlug: 'is-vw-155', modelId: 'isvw155' },
  { sku: 'CAL-IS180VW', focalSlug: 'is-vw-180', modelId: 'isvw180' },
  { sku: 'CAL-IC165VW', focalSlug: 'ic-vw-165', modelId: 'icvw165' },

  // Inside Ford series
  { sku: 'CAL-ISFORD165', focalSlug: 'is-ford-165', modelId: 'isford165' },
  { sku: 'CAL-ISFORD690', focalSlug: 'is-ford-690', modelId: 'isford690' },
  { sku: 'CAL-ICFORD165-1', focalSlug: 'ic-ford-165', modelId: 'icford165' },
  { sku: 'CAL-ICFORD690', focalSlug: 'ic-ford-690', modelId: 'icford690' },

  // Inside PSA series
  { sku: 'CAL-ISPSA165', focalSlug: 'is-psa-165', modelId: 'ispsa165' },
  { sku: 'CAL-ICPSA165', focalSlug: 'ic-psa-165', modelId: 'icpsa165' },

  // Inside Renault series
  { sku: 'CAL-ISREN130', focalSlug: 'is-ren-130', modelId: 'isren130' },
  { sku: 'CAL-ICREN130', focalSlug: 'ic-ren-130', modelId: 'icren130' },

  // Inside RNS/RNI series
  { sku: 'CAL-ISRNS165', focalSlug: 'is-rns-165', modelId: 'isrns165' },
  { sku: 'CAL-ICRNS165', focalSlug: 'ic-rns-165', modelId: 'icrns165' },
  { sku: 'CAL-ISRNI690', focalSlug: 'is-rni-690', modelId: 'isrni690' },

  // Inside Toyota series
  { sku: 'CAL-ISTOY165', focalSlug: 'is-toy-165', modelId: 'istoy165' },
  { sku: 'CAL-ISTOY690', focalSlug: 'is-toy-690', modelId: 'istoy690' },
  { sku: 'CAL-ICTOY165', focalSlug: 'ic-toy-165', modelId: 'ictoy165' },

  // Inside Tesla series
  { sku: 'CAL-IS T3Y 100', focalSlug: 'is-t3y-100', modelId: 'ist3y100' },
  { sku: 'CAL-IC T3Y 100', focalSlug: 'ic-t3y-100', modelId: 'ict3y100' },
  { sku: 'CAL-ICC T3Y 100', focalSlug: 'icc-t3y-100', modelId: 'icct3y100' },
  { sku: 'CAL-IW-T3Y-200', focalSlug: 'iw-t3y-200', modelId: 'iwt3y200' },

  // Inside Mercedes series
  { sku: 'Cal-IS MBZ 100', focalSlug: 'is-mbz-100', modelId: 'ismbz100' },
  { sku: 'Cal-IC MBZ 100', focalSlug: 'ic-mbz-100', modelId: 'icmbz100' },
  { sku: 'Cal-IC MBZ 100-1', focalSlug: 'icr-mbz-100', modelId: 'icrmbz100' },
  { sku: 'Cal-ICC-MBZ 100', focalSlug: 'icc-mbz-100', modelId: 'iccmbz100' },
  { sku: 'CAL-ISUB MBZ-2', focalSlug: 'isub-mbz-2', modelId: 'isubmbz2' },

  // Flax Evo PS series
  { sku: 'CAL-PS165FE', focalSlug: 'ps-165-fe', modelId: 'ps165fe' },
  { sku: 'CAL-PS165FSE', focalSlug: 'ps-165-fse', modelId: 'ps165fse' },
  { sku: 'CAL-PS165FXE', focalSlug: 'ps-165-fxe', modelId: 'ps165fxe' },
  { sku: 'CAL-PS165F3E', focalSlug: 'ps-165-f3e', modelId: 'ps165f3e' },
  { sku: 'CAL-PC165FE', focalSlug: 'pc-165-fe', modelId: 'pc165fe' },

  // Flax Evo P series
  { sku: 'CAL-P20FE', focalSlug: 'p-20-fe', modelId: 'p20fe' },
  { sku: 'CAL-P20FSE', focalSlug: 'p-20-fse', modelId: 'p20fse' },
  { sku: 'CAL-P25FE', focalSlug: 'p-25-fe', modelId: 'p25fe' },
  { sku: 'CAL-P25FSE', focalSlug: 'p-25-fse', modelId: 'p25fse' },

  // Performance series
  { sku: 'CAL-PC130', focalSlug: 'pc-130', modelId: 'pc130' },
  { sku: 'CAL-PC165', focalSlug: 'pc-165', modelId: 'pc165' },

  // K2 Power / Elite series
  { sku: 'CAL-EC165K', focalSlug: 'ec-165-k', modelId: 'ec165k' },
  { sku: 'CAL-ESUB25KX', focalSlug: 'e-25-kx', modelId: 'esub25kx', extraPatterns: ['e25kx'] },
  { sku: 'CAL-ESUB30KX', focalSlug: 'e-30-kx', modelId: 'esub30kx', extraPatterns: ['e30kx'] },

  // Utopia M series
  { sku: 'CAL-EU35WM', focalSlug: 'eu-3-5-wm', modelId: 'eu35wm' },
  { sku: 'CAL-EU6WM', focalSlug: 'eu-6-wm', modelId: 'eu6wm' },
  { sku: 'CAL-EU8WM', focalSlug: 'eu-8-wm', modelId: 'eu8wm' },
  { sku: 'CAL-EUSUB10WM', focalSlug: 'eu-sub-10-wm', modelId: 'eusub10wm' },

  // Amplifiers
  { sku: 'CAL-FPX1.1000', focalSlug: 'fpx-1-1000', modelId: 'fpx11000' },
  { sku: 'CAL-FPX4.400SQ', focalSlug: 'fpx-4-400-sq', modelId: 'fpx4400sq' },
  { sku: 'CAL-FPX4.800', focalSlug: 'fpx-4-800', modelId: 'fpx4800' },
  { sku: 'CAL-FPX5.1200', focalSlug: 'fpx-5-1200', modelId: 'fpx51200' },
  { sku: 'CAL-IMPULSE', focalSlug: 'impulse', modelId: 'impulse' },

  // Other
  { sku: 'CAL-IBUS2.1', focalSlug: 'ibus-2-1', modelId: 'ibus21', extraPatterns: ['isubbmwibus'] },
  { sku: 'CAL-FocalP60', focalSlug: 'p-60', modelId: 'p60' },
];

function generateUrlPatterns(focalSlug: string, modelId: string, extraPatterns?: string[]): string[] {
  const slugUnderscored = focalSlug.replace(/-/g, '_');
  const models = [modelId, ...(extraPatterns || [])];

  const urls: string[] = [];
  for (const m of models) {
    urls.push(
      `https://media.focal-naim.com/dam/${focalSlug}/ft_${m}.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/ft_universal_${m}.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/fp_${m}_gb.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/fp_${m}_en.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/ft_${m}_en.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/notice_${m}_web.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/ft_${slugUnderscored}.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/fp_${slugUnderscored}_gb.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/fp_${slugUnderscored}_en.pdf`,
      `https://media.focal-naim.com/dam/${focalSlug}/notice_${slugUnderscored}_web.pdf`,
    );
  }

  // Also try with "inside_" prefix for OEM products
  if (focalSlug.startsWith('is-') || focalSlug.startsWith('ic-') || focalSlug.startsWith('icc-') || focalSlug.startsWith('isub-') || focalSlug.startsWith('iw-')) {
    for (const m of models) {
      urls.push(
        `https://media.focal-naim.com/dam/${focalSlug}/ft_inside_${m}.pdf`,
        `https://media.focal-naim.com/dam/${focalSlug}/fp_inside_${m}_gb.pdf`,
        `https://media.focal-naim.com/dam/${focalSlug}/notice_inside_${m}_web.pdf`,
      );
    }
  }

  // Deduplicate
  return [...new Set(urls)];
}

function headRequest(url: string): Promise<number> {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      resolve(res.statusCode || 0);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
    req.end();
  });
}

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        if (res.headers.location) {
          downloadFile(res.headers.location, destPath).then(resolve);
        } else {
          resolve(false);
        }
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        resolve(false);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(destPath);
        if (stats.size < 1000) {
          fs.unlinkSync(destPath);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    req.on('error', () => {
      file.close();
      try { fs.unlinkSync(destPath); } catch {}
      resolve(false);
    });
    req.on('timeout', () => { req.destroy(); });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  console.log(`Processing ${productMappings.length} Focal products...\n`);

  const results: { sku: string; found: boolean; url?: string; localPath?: string }[] = [];
  const sqlStatements: string[] = [];

  for (const product of productMappings) {
    const { sku, focalSlug, modelId, extraPatterns } = product;
    const urls = generateUrlPatterns(focalSlug, modelId, extraPatterns);
    const localFilename = `focal-${focalSlug}-tech-sheet.pdf`;
    const localPath = path.join(DOWNLOAD_DIR, localFilename);
    const webPath = `/downloads/${localFilename}`;

    // Check if already downloaded
    if (fs.existsSync(localPath)) {
      console.log(`✅ [SKIP] ${sku} - already downloaded: ${localFilename}`);
      const escapedSku = sku.replace(/'/g, "''");
      sqlStatements.push(
        `UPDATE products SET downloads = '[{"name":"Technical Datasheet","url":"${webPath}"}]'::jsonb WHERE sku = '${escapedSku}';`
      );
      results.push({ sku, found: true, localPath: webPath });
      continue;
    }

    let found = false;
    for (const url of urls) {
      await sleep(300);
      const status = await headRequest(url);
      if (status === 200) {
        console.log(`🔍 [HEAD OK] ${sku} -> ${url}`);
        await sleep(200);
        const downloaded = await downloadFile(url, localPath);
        if (downloaded) {
          console.log(`✅ [DOWNLOADED] ${sku} -> ${localFilename}`);
          const escapedSku = sku.replace(/'/g, "''");
          sqlStatements.push(
            `UPDATE products SET downloads = '[{"name":"Technical Datasheet","url":"${webPath}"}]'::jsonb WHERE sku = '${escapedSku}';`
          );
          results.push({ sku, found: true, url, localPath: webPath });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.log(`❌ [NOT FOUND] ${sku} (${focalSlug}) - tried ${urls.length} URLs`);
      results.push({ sku, found: false });
    }
  }

  // Summary
  const foundCount = results.filter(r => r.found).length;
  const notFoundCount = results.filter(r => !r.found).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY: ${foundCount} found, ${notFoundCount} not found out of ${results.length}`);
  console.log(`${'='.repeat(60)}`);

  if (notFoundCount > 0) {
    console.log('\nNot found products:');
    results.filter(r => !r.found).forEach(r => console.log(`  - ${r.sku}`));
  }

  // Write SQL file
  if (sqlStatements.length > 0) {
    const sqlFile = path.join(process.cwd(), 'scripts', 'focal-pdf-updates.sql');
    fs.writeFileSync(sqlFile, sqlStatements.join('\n') + '\n');
    console.log(`\nSQL file written: ${sqlFile}`);
    console.log(`${sqlStatements.length} UPDATE statements ready.`);
  }
}

main().catch(console.error);
