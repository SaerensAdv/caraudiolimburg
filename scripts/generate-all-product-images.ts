import { generateImage } from "../server/replit_integrations/image";
import { db } from "../server/db";
import { products, brands, categories } from "../shared/schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import fs from "fs";
import path from "path";

interface ProductInfo {
  id: string;
  name: string;
  slug: string | null;
  brandName: string | null;
  categoryName: string | null;
  existingImages: string[] | null;
}

const IMAGE_TYPES = [
  'studio',
  'angle45',
  'topdown', 
  'dramatic',
  'lifestyle'
] as const;

function getPromptForType(type: string, brandName: string, productName: string, categoryType: string): string {
  const prompts: Record<string, string> = {
    studio: `High-resolution studio product photo of the ${brandName} ${productName} ${categoryType}. Front view showing all main components clearly. Neutral light grey background, soft professional studio lighting, sharp focus on product details. Realistic shadows, no text, no branding overlays, ultra-clean commercial product photography style. Square 1:1 aspect ratio.`,
    
    angle45: `Professional product photo of the ${brandName} ${productName} ${categoryType}. 45-degree angled perspective showing depth and dimension. Clean white background with soft shadows. Studio lighting from top-left, highlighting textures and materials. Commercial e-commerce photography style. Square 1:1 aspect ratio.`,
    
    topdown: `Top-down flat lay photo of the ${brandName} ${productName} ${categoryType}. Bird's eye view showing the product from directly above. Clean minimal white background, even soft lighting, no harsh shadows. Product centered with some breathing room. Modern e-commerce style. Square 1:1 aspect ratio.`,
    
    dramatic: `Dramatic product shot of the ${brandName} ${productName} ${categoryType}. Low-angle heroic perspective, dark charcoal background with subtle gradient. Strong rim lighting and accent highlights on key features. Cinematic mood, high contrast, luxury premium feel. Square 1:1 aspect ratio.`,
    
    lifestyle: `Lifestyle product photo of the ${brandName} ${productName} ${categoryType}. Product placed in modern minimalist setting suggesting automotive/audio context. Shallow depth of field, warm natural lighting. Premium aspirational feel, no people, subtle environmental context. Square 1:1 aspect ratio.`
  };
  
  return prompts[type] || prompts.studio;
}

async function generateImagesForProduct(product: ProductInfo): Promise<string[]> {
  const generatedUrls: string[] = [];
  const brandName = product.brandName || '';
  const categoryType = product.categoryName || 'car audio product';
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log(`\n📦 ${product.name}`);
  
  for (const imageType of IMAGE_TYPES) {
    const prompt = getPromptForType(imageType, brandName, product.name, categoryType);
    
    try {
      process.stdout.write(`  🎨 ${imageType}... `);
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
      console.log(`✅`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      console.log(`❌ ${error.message.substring(0, 50)}`);
    }
  }
  
  return generatedUrls;
}

async function main() {
  console.log("🚀 Generating images for ALL products...\n");
  console.log("Image types: studio, angle45, topdown, dramatic, lifestyle\n");
  
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brandName: brands.name,
      categoryName: categories.name,
      existingImages: products.images,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true));
  
  console.log(`Found ${allProducts.length} active products\n`);
  
  let processed = 0;
  let failed = 0;
  
  for (const product of allProducts) {
    try {
      const generatedUrls = await generateImagesForProduct(product);
      
      if (generatedUrls.length > 0) {
        await db
          .update(products)
          .set({ images: generatedUrls })
          .where(eq(products.id, product.id));
        
        console.log(`  💾 Saved ${generatedUrls.length} images`);
        processed++;
      }
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failed++;
    }
    
    console.log(`  Progress: ${processed + failed}/${allProducts.length}`);
  }
  
  console.log(`\n✅ Complete! Processed: ${processed}, Failed: ${failed}`);
}

main().catch(console.error);
