import { generateImage } from "../server/replit_integrations/image";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const productId = "869851ab-57dd-4687-9488-eb7c56b3e292";
const brandName = "Audison";
const productName = "APBMW K4E";
const categoryType = "2-way component speaker set";

const prompt = `High-resolution studio product photo of the ${brandName} ${productName} ${categoryType}. Front view showing woofer and tweeter side by side. Neutral light grey background, soft professional studio lighting, sharp focus on cone texture and tweeter dome. Realistic shadows, no text, no branding overlays, ultra-clean commercial product photography style. Square 1:1 aspect ratio.`;

async function main() {
  console.log("🎨 Generating test image for Audison APBMW K4E...");
  console.log("📝 Prompt:", prompt);
  
  try {
    const dataUrl = await generateImage(prompt);
    console.log("✅ Image generated successfully!");
    
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileName = `audison-apbmw-k4e-gemini-test-${Date.now()}.webp`;
    
    const processedImage = await sharp(buffer)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    
    const outputPath = path.join('public', 'products', fileName);
    await fs.promises.writeFile(outputPath, processedImage);
    
    console.log(`💾 Image saved to: ${outputPath}`);
    console.log(`🔗 URL: /products/${fileName}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main();
