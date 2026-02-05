import { db } from '../server/db';
import { products } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface PdfMapping {
  sku: string;
  pdfUrl: string;
  filename: string;
}

const pdfMappings: PdfMapping[] = [
  // Prima Speakers - correct URLs from website
  { sku: 'APX 6.5', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APX6_5_Tech_Sheet.pdf', filename: 'audison-prima-apx-6-5-tech-sheet.pdf' },
  { sku: 'APK 165 Ω2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK165_2ohm_Tech_Sheet.pdf', filename: 'audison-prima-apk-165-2ohm-tech-sheet.pdf' },
  { sku: 'APK 165P', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK_165P_Tech_Sheet.pdf', filename: 'audison-prima-apk-165p-tech-sheet.pdf' },
  
  // Prima Subwoofer Boxes - with dashes
  { sku: 'APBX 8 DS', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-8-DS-Tech-Sheet.pdf', filename: 'audison-prima-apbx-8-ds-tech-sheet.pdf' },
  { sku: 'APBX 8 R', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-8-R-Tech-Sheet.pdf', filename: 'audison-prima-apbx-8-r-tech-sheet.pdf' },
  { sku: 'APBX 8 AS2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-8-AS2-Tech-Sheet.pdf', filename: 'audison-prima-apbx-8-as2-tech-sheet.pdf' },
  { sku: 'APBX 10 DS', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-10-DS-Tech-Sheet.pdf', filename: 'audison-prima-apbx-10-ds-tech-sheet.pdf' },
  { sku: 'APBX 10 S4S', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-10-S4S-Tech-Sheet.pdf', filename: 'audison-prima-apbx-10-s4s-tech-sheet.pdf' },
  { sku: 'APBX 10 AS2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBX-10-AS2-Tech-Sheet.pdf', filename: 'audison-prima-apbx-10-as2-tech-sheet.pdf' },
  
  // Prima BMW
  { sku: 'APBMW K4E', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBMW-K4E-Tech-Sheet.pdf', filename: 'audison-prima-apbmw-k4e-tech-sheet.pdf' },
  { sku: 'APBMW K4M', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBMW-K4M-Tech-Sheet.pdf', filename: 'audison-prima-apbmw-k4m-tech-sheet.pdf' },
  { sku: 'APBMW S8-2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBMW-S8-2-Tech-Sheet.pdf', filename: 'audison-prima-apbmw-s8-2-tech-sheet.pdf' },
  { sku: 'APBMW X4E', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBMW-X4E-Tech-Sheet.pdf', filename: 'audison-prima-apbmw-x4e-tech-sheet.pdf' },
  { sku: 'APBMW X4M', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON-Prima-APBMW-X4M-Tech-Sheet.pdf', filename: 'audison-prima-apbmw-x4m-tech-sheet.pdf' },
  
  // Forza DSP Amplifiers - try different naming patterns
  { sku: 'Audison Forza AF C4.10 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_C4_10_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-c4-10-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF C8.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_C8_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-c8-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M5.11 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M5_11_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m5-11-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M8.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M8_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m8-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M12.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M12_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m12-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M1.7 bit', pdfUrl: 'https://static.audison.com/media/2024/03/AUDISON_Forza_AF_M1_7_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m1-7-bit-tech-sheet.pdf' },
  { sku: 'Audison AF-C4D-4CH', pdfUrl: 'https://static.audison.com/media/2024/03/AUDISON_Forza_AF_C4D_Tech_Sheet.pdf', filename: 'audison-forza-af-c4d-tech-sheet.pdf' },
];

const downloadDir = path.join(process.cwd(), 'public', 'downloads');

function downloadFile(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${path.basename(filepath)}`);
          resolve(true);
        });
      } else {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        console.log(`✗ Not found (${response.statusCode}): ${url}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      console.log(`✗ Error downloading: ${url} - ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Starting Audison PDF download (v2 - corrected URLs)...\n');
  
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  
  const results: { sku: string; filename: string; success: boolean }[] = [];
  
  for (const mapping of pdfMappings) {
    const filepath = path.join(downloadDir, mapping.filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`○ Already exists: ${mapping.filename}`);
      results.push({ sku: mapping.sku, filename: mapping.filename, success: true });
      continue;
    }
    
    const success = await downloadFile(mapping.pdfUrl, filepath);
    results.push({ sku: mapping.sku, filename: mapping.filename, success });
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n--- Updating database ---\n');
  
  for (const result of results) {
    if (result.success) {
      const downloadEntry = [{
        name: 'Technical Datasheet',
        url: `/downloads/${result.filename}`
      }];
      
      await db.update(products)
        .set({ downloads: downloadEntry })
        .where(eq(products.sku, result.sku));
      
      console.log(`✓ Updated DB: ${result.sku}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n--- Complete: ${successCount}/${results.length} PDFs downloaded and linked ---`);
  
  process.exit(0);
}

main().catch(console.error);
