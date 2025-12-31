import { generateImage } from "../server/replit_integrations/image";
import { db } from "../server/db";
import { products, brands, categories } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const BATCH_SIZE = parseInt(process.argv[2] || "20");
const OFFSET = parseInt(process.argv[3] || "0");

const IMAGE_TYPES = ['studio', 'angle45', 'topdown', 'dramatic', 'lifestyle'] as const;

function getPrompt(type: string, brand: string, name: string, category: string): string {
  const prompts: Record<string, string> = {
    studio: `High-resolution studio product photo of the ${brand} ${name} ${category}. Front view. Neutral light grey background, soft professional studio lighting. No text, no watermarks. Square 1:1.`,
    angle45: `Professional product photo of the ${brand} ${name} ${category}. 45-degree angled view. Clean white background, studio lighting. Square 1:1.`,
    topdown: `Top-down flat lay of the ${brand} ${name} ${category}. Bird's eye view. Clean white background, even lighting. Square 1:1.`,
    dramatic: `Dramatic product shot of the ${brand} ${name} ${category}. Dark charcoal background, rim lighting. Cinematic, high contrast, premium. Square 1:1.`,
    lifestyle: `Lifestyle product photo of the ${brand} ${name} ${category}. Modern minimalist setting, shallow depth of field, warm natural lighting. Square 1:1.`
  };
  return prompts[type] || prompts.studio;
}

async function main() {
  console.log(`\n🚀 Batch: offset=${OFFSET}, size=${BATCH_SIZE}\n`);
  
  const batch = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: brands.name,
      category: categories.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true))
    .limit(BATCH_SIZE)
    .offset(OFFSET);
  
  console.log(`Processing ${batch.length} products (${OFFSET} to ${OFFSET + batch.length - 1})\n`);
  
  for (const p of batch) {
    const slug = p.slug || p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const urls: string[] = [];
    
    process.stdout.write(`📦 ${p.name.substring(0, 40)}... `);
    
    for (const type of IMAGE_TYPES) {
      try {
        const dataUrl = await generateImage(getPrompt(type, p.brand || '', p.name, p.category || 'audio'));
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        const fileName = `${slug}-${type}-${Date.now()}.webp`;
        
        const processed = await sharp(buffer)
          .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer();
        
        await fs.promises.mkdir('public/products', { recursive: true });
        await fs.promises.writeFile(`public/products/${fileName}`, processed);
        urls.push(`/products/${fileName}`);
        process.stdout.write('✅');
        await new Promise(r => setTimeout(r, 1000));
      } catch (e: any) {
        process.stdout.write('❌');
      }
    }
    
    if (urls.length > 0) {
      await db.update(products).set({ images: urls }).where(eq(products.id, p.id));
    }
    console.log(` (${urls.length}/5)`);
  }
  
  console.log(`\n✅ Batch complete! Next: npx tsx scripts/generate-batch-images.ts ${BATCH_SIZE} ${OFFSET + BATCH_SIZE}`);
}

main().catch(console.error);
