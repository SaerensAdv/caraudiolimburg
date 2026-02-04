import { db } from '../server/db';
import { products } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField);
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }
    
    return rows;
}

function extractImageUrls(text: string): string[] {
    const urls: string[] = [];
    const regex = /https?:\/\/[^\s"',<>]+wp-content\/uploads[^\s"',<>]+\.(jpg|jpeg|png|webp|gif)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        let url = match[0];
        url = url.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp|gif))$/i, '$1');
        if (!urls.includes(url)) {
            urls.push(url);
        }
    }
    return urls;
}

async function restoreWordPressImages() {
    console.log('🔄 Starting WordPress image restoration...\n');
    
    const csvPath = 'attached_assets/Producten_-_CAL_-_Producten_1764907071080.csv';
    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content);
    const headers = rows[0];
    
    const skuIdx = headers.indexOf('SKU');
    const titleIdx = headers.indexOf('Title');
    const featuredImageIdx = headers.indexOf('Featured Image');
    const contentIdx = headers.indexOf('Content');
    
    console.log(`📊 Parsed ${rows.length - 1} products from CSV\n`);
    
    const skuToImages: Map<string, string[]> = new Map();
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        let sku = (row[skuIdx] || '').trim().toLowerCase();
        const title = row[titleIdx] || '';
        const featuredImage = row[featuredImageIdx] || '';
        const rowContent = row[contentIdx] || '';
        
        if (!sku) continue;
        
        const allImages: string[] = [];
        
        if (featuredImage) {
            const featuredUrls = extractImageUrls(featuredImage);
            allImages.push(...featuredUrls);
        }
        
        if (rowContent) {
            const contentUrls = extractImageUrls(rowContent);
            for (const url of contentUrls) {
                if (!allImages.includes(url)) {
                    allImages.push(url);
                }
            }
        }
        
        if (allImages.length > 0) {
            skuToImages.set(sku, allImages);
        }
    }
    
    console.log(`📷 Found ${skuToImages.size} products with WordPress images\n`);
    
    const allProducts = await db.select().from(products);
    console.log(`🏪 Found ${allProducts.length} products in database\n`);
    
    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    
    for (const product of allProducts) {
        const productSku = (product.sku || '').trim().toLowerCase();
        
        if (!productSku) {
            skipped++;
            continue;
        }
        
        let wpImages = skuToImages.get(productSku);
        
        if (!wpImages) {
            for (const [csvSku, images] of skuToImages.entries()) {
                if (csvSku.includes(productSku) || productSku.includes(csvSku)) {
                    wpImages = images;
                    break;
                }
            }
        }
        
        if (wpImages && wpImages.length > 0) {
            await db.update(products)
                .set({ images: wpImages })
                .where(eq(products.id, product.id));
            
            console.log(`✅ Updated: ${product.name}`);
            console.log(`   SKU: ${product.sku}`);
            console.log(`   Images: ${wpImages.length} WordPress URL(s)`);
            console.log(`   First: ${wpImages[0].substring(0, 80)}...`);
            console.log();
            updated++;
        } else {
            notFound++;
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} products`);
    console.log(`   ⏭️  Skipped (no SKU): ${skipped} products`);
    console.log(`   ❌ No match found: ${notFound} products`);
    console.log('\n🎉 WordPress image restoration complete!');
}

restoreWordPressImages()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
