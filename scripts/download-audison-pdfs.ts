import { db } from '../server/db';
import { products } from '../shared/schema';
import { eq, ilike, or } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface PdfMapping {
  sku: string;
  pdfUrl: string;
  filename: string;
}

const pdfMappings: PdfMapping[] = [
  // Prima Speakers
  { sku: 'APK 130', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK130_Tech_Sheet.pdf', filename: 'audison-prima-apk-130-tech-sheet.pdf' },
  { sku: 'APK 163', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK163_Tech_Sheet.pdf', filename: 'audison-prima-apk-163-tech-sheet.pdf' },
  { sku: 'APK 165', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK165_Tech_Sheet.pdf', filename: 'audison-prima-apk-165-tech-sheet.pdf' },
  { sku: 'APK 165 Ω2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK165_2_Tech_Sheet.pdf', filename: 'audison-prima-apk-165-2ohm-tech-sheet.pdf' },
  { sku: 'APK 165P', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK165P_Tech_Sheet.pdf', filename: 'audison-prima-apk-165p-tech-sheet.pdf' },
  { sku: 'APK 570', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK570_Tech_Sheet.pdf', filename: 'audison-prima-apk-570-tech-sheet.pdf' },
  { sku: 'APK 690', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APK690_Tech_Sheet.pdf', filename: 'audison-prima-apk-690-tech-sheet.pdf' },
  { sku: 'APX 5', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APX5_Tech_Sheet.pdf', filename: 'audison-prima-apx-5-tech-sheet.pdf' },
  { sku: 'APX 6.5', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APX65_Tech_Sheet.pdf', filename: 'audison-prima-apx-65-tech-sheet.pdf' },
  { sku: 'APX 570', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APX570_Tech_Sheet.pdf', filename: 'audison-prima-apx-570-tech-sheet.pdf' },
  { sku: 'APX 690', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APX690_Tech_Sheet.pdf', filename: 'audison-prima-apx-690-tech-sheet.pdf' },
  
  // Prima Subwoofers
  { sku: 'APS 8 D', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APS8D_Tech_Sheet.pdf', filename: 'audison-prima-aps-8d-tech-sheet.pdf' },
  { sku: 'APS 8 R', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APS8R_Tech_Sheet.pdf', filename: 'audison-prima-aps-8r-tech-sheet.pdf' },
  { sku: 'APS 10 D', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APS10D_Tech_Sheet.pdf', filename: 'audison-prima-aps-10d-tech-sheet.pdf' },
  { sku: 'APS 10 S4S', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APS10S4S_Tech_Sheet.pdf', filename: 'audison-prima-aps-10-s4s-tech-sheet.pdf' },
  
  // Prima Subwoofer Boxes
  { sku: 'APBX 8 DS', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBX8DS_Tech_Sheet.pdf', filename: 'audison-prima-apbx-8ds-tech-sheet.pdf' },
  { sku: 'APBX 8 R', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBX8R_Tech_Sheet.pdf', filename: 'audison-prima-apbx-8r-tech-sheet.pdf' },
  { sku: 'APBX 8 AS2', pdfUrl: 'https://static.audison.com/media/2023/01/AUDISON_Prima_APBX8AS2_Tech_Sheet.pdf', filename: 'audison-prima-apbx-8-as2-tech-sheet.pdf' },
  { sku: 'APBX 10 DS', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBX10DS_Tech_Sheet.pdf', filename: 'audison-prima-apbx-10ds-tech-sheet.pdf' },
  { sku: 'APBX 10 S4S', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBX10S4S_Tech_Sheet.pdf', filename: 'audison-prima-apbx-10-s4s-tech-sheet.pdf' },
  { sku: 'APBX 10 AS2', pdfUrl: 'https://static.audison.com/media/2023/01/AUDISON_Prima_APBX10AS2_Tech_Sheet.pdf', filename: 'audison-prima-apbx-10-as2-tech-sheet.pdf' },
  
  // Prima BMW
  { sku: 'APBMW K4E', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBMWK4E_Tech_Sheet.pdf', filename: 'audison-prima-apbmw-k4e-tech-sheet.pdf' },
  { sku: 'APBMW K4M', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBMWK4M_Tech_Sheet.pdf', filename: 'audison-prima-apbmw-k4m-tech-sheet.pdf' },
  { sku: 'APBMW S8-2', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBMWS8_2_Tech_Sheet.pdf', filename: 'audison-prima-apbmw-s8-2-tech-sheet.pdf' },
  { sku: 'APBMW X4E', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBMWX4E_Tech_Sheet.pdf', filename: 'audison-prima-apbmw-x4e-tech-sheet.pdf' },
  { sku: 'APBMW X4M', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_Prima_APBMWX4M_Tech_Sheet.pdf', filename: 'audison-prima-apbmw-x4m-tech-sheet.pdf' },
  
  // SR Amplifiers
  { sku: 'SR 1.500', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_SR_1500_Tech_Sheet-1.pdf', filename: 'audison-sr-1500-tech-sheet.pdf' },
  { sku: 'SR 4.300', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_SR_4300_Tech_Sheet-1.pdf', filename: 'audison-sr-4300-tech-sheet.pdf' },
  { sku: 'SR 4.500', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_SR_4500_Tech_Sheet-1.pdf', filename: 'audison-sr-4500-tech-sheet.pdf' },
  { sku: 'SR 5.600', pdfUrl: 'https://static.audison.com/media/2022/10/AUDISON_SR_5600_Tech_Sheet-1.pdf', filename: 'audison-sr-5600-tech-sheet.pdf' },
  
  // Forza DSP Amplifiers
  { sku: 'Audison Forza AF C4.10 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_C_4_10_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-c4-10-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF C8.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_C_8_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-c8-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M5.11 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M_5_11_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m5-11-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M8.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M_8_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m8-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M12.14 bit', pdfUrl: 'https://static.audison.com/media/2022/12/AUDISON_Forza_AF_M_12_14_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m12-14-bit-tech-sheet.pdf' },
  { sku: 'Audison Forza AF M1.7 bit', pdfUrl: 'https://static.audison.com/media/2024/03/AUDISON_Forza_AF_M_1_7_bit_Tech_Sheet.pdf', filename: 'audison-forza-af-m1-7-bit-tech-sheet.pdf' },
  { sku: 'Audison AF-C4D-4CH', pdfUrl: 'https://static.audison.com/media/2024/03/AUDISON_Forza_AF_C4D_Tech_Sheet.pdf', filename: 'audison-forza-af-c4d-tech-sheet.pdf' },
  
  // Voce II Speakers - These are new products, PDFs may not exist yet
  { sku: 'Audison AV 1.1 II', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AV_1_1_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-av-1-1-tech-sheet.pdf' },
  { sku: 'Audison AV 13.0 II speakerset', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AV_3_0_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-av-3-0-tech-sheet.pdf' },
  { sku: 'Audison AV 6.5 P II woofer-set', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AV_6_5_P_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-av-6-5-p-tech-sheet.pdf' },
  { sku: 'Audison AV 6.5 II coaxiaalset', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AVX_6_5_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-avx-6-5-tech-sheet.pdf' },
  { sku: 'AVK6APII', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AVK_6_A_P_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-avk-6a-p-tech-sheet.pdf' },
  { sku: 'Audison AVK 6 S II coaxiaal', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AVK_6_S_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-avk-6s-tech-sheet.pdf' },
  { sku: 'Audison AVK 6A II coaxiaalset', pdfUrl: 'https://static.audison.com/media/2025/01/AUDISON_Voce_II_AVK_6_A_P_II_Tech_Sheet.pdf', filename: 'audison-voce-ii-avk-6a-p-ii-tech-sheet.pdf' },
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
        fs.unlinkSync(filepath);
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
  console.log('Starting Audison PDF download...\n');
  
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
    
    await new Promise(r => setTimeout(r, 500));
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
