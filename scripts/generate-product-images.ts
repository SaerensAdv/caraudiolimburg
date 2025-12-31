import { generateImage } from "../server/replit_integrations/image";
import { db } from "../server/db";
import { products, brands, categories } from "../shared/schema";
import { eq, isNull, or, sql } from "drizzle-orm";
import sharp from "sharp";
import fs from "fs";
import path from "path";

interface ProductInfo {
  id: string;
  name: string;
  slug: string | null;
  brandName: string | null;
  categoryName: string | null;
}

const IMAGE_TYPES = ['studio', 'premium', 'closeup'] as const;

function getPromptForType(type: string, brandName: string, productName: string, categoryType: string): string {
  const prompts: Record<string, string> = {
    studio: `High-resolution studio product photo of the ${brandName} ${productName} ${categoryType}. Front view showing main components. Neutral light grey background, soft professional studio lighting, sharp focus on product details. Realistic shadows, no text, no branding overlays, ultra-clean commercial product photography style. Square 1:1 aspect ratio.`,
    
    premium: `Premium angled studio shot of the ${brandName} ${productName} ${categoryType}. 45-degree diagonal perspective, dark charcoal background with subtle gradient. Dramatic rim lighting highlighting materials and textures. High contrast, cinematic lighting, luxury audio product photography. Square 1:1 aspect ratio.`,
    
    closeup: `Extreme close-up macro photo of the ${brandName} ${productName} ${categoryType}. Focus on key details and premium materials. Ultra-sharp detail, soft background blur, professional macro photography lighting, realistic materials, premium product look. Square 1:1 aspect ratio.`
  };
  
  return prompts[type] || prompts.studio;
}

async function generateImagesForProduct(product: ProductInfo): Promise<string[]> {
  const generatedUrls: string[] = [];
  const brandName = product.brandName || '';
  const categoryType = product.categoryName || 'car audio product';
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log(`\n📦 Processing: ${product.name}`);
  
  for (const imageType of IMAGE_TYPES) {
    const prompt = getPromptForType(imageType, brandName, product.name, categoryType);
    
    try {
      console.log(`  🎨 Generating ${imageType} image...`);
      const dataUrl = await generateImage(prompt);
      
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${slug}-${imageType}-${Date.now()}.webp`;
      
      const processedImage = await sharp(buffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();
      
      const productDir = path.join('public', 'products');
      await fs.promises.mkdir(productDir, { recursive: true });
      await fs.promises.writeFile(path.join(productDir, fileName), processedImage);
      
      const publicUrl = `/products/${fileName}`;
      generatedUrls.push(publicUrl);
      console.log(`  ✅ ${imageType}: ${publicUrl}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`  ❌ Error generating ${imageType}:`, error.message);
    }
  }
  
  return generatedUrls;
}

async function main() {
  console.log("🚀 Starting product image generation...\n");
  
  const productsWithoutImages = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brandName: brands.name,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      or(
        isNull(products.images),
        sql`array_length(${products.images}, 1) IS NULL`
      )
    )
    .limit(5);
  
  console.log(`Found ${productsWithoutImages.length} products without images\n`);
  
  for (const product of productsWithoutImages) {
    const generatedUrls = await generateImagesForProduct(product);
    
    if (generatedUrls.length > 0) {
      await db
        .update(products)
        .set({ images: generatedUrls })
        .where(eq(products.id, product.id));
      
      console.log(`  💾 Updated database with ${generatedUrls.length} images`);
    }
  }
  
  console.log("\n✅ Image generation complete!");
}

main().catch(console.error);
