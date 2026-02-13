import { generateImage } from "../replit_integrations/image/client";
import * as fs from "fs";
import * as path from "path";

const REVIEW_IMAGE_DIR = path.join("public", "review-images");

const REVIEW_IMAGE_PROMPTS = [
  "Professional photograph of a luxury car interior with premium audio speakers installed in the door panel, ambient lighting, shallow depth of field, warm tones, magazine quality",
  "Close-up professional photograph of a high-end car audio amplifier with gold accents installed in a car trunk, dramatic lighting, ultra detailed, premium feel",
  "Professional photograph of a modern car dashboard with integrated touchscreen display showing music equalizer, leather interior, warm ambient lighting, cinematic",
  "Professional photograph of premium car door speakers with brushed aluminum cones in a luxury vehicle, shallow depth of field, studio quality lighting",
  "Professional photograph of a car audio subwoofer installed in a custom enclosure in a car trunk, LED accent lighting, dramatic shadows, premium quality",
  "Professional photograph of a luxury car interior at night with ambient LED lighting highlighting premium audio speakers, moody atmosphere, magazine quality",
];

export async function getReviewImageUrl(index: number): Promise<string | null> {
  const safeIndex = index % REVIEW_IMAGE_PROMPTS.length;
  const fileName = `review-image-${safeIndex + 1}.webp`;
  const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
  const publicUrl = `/review-images/${fileName}`;

  if (fs.existsSync(filePath)) {
    return publicUrl;
  }

  return null;
}

export async function generateReviewImage(index: number): Promise<string> {
  const safeIndex = index % REVIEW_IMAGE_PROMPTS.length;
  const fileName = `review-image-${safeIndex + 1}.webp`;
  const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
  const publicUrl = `/review-images/${fileName}`;

  if (fs.existsSync(filePath)) {
    return publicUrl;
  }

  await fs.promises.mkdir(REVIEW_IMAGE_DIR, { recursive: true });

  const prompt = REVIEW_IMAGE_PROMPTS[safeIndex];
  const dataUrl = await generateImage(prompt);

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  await fs.promises.writeFile(filePath, buffer);
  console.log(`✅ Generated review image: ${fileName}`);

  return publicUrl;
}

export async function generateAllReviewImages(): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < REVIEW_IMAGE_PROMPTS.length; i++) {
    try {
      const url = await generateReviewImage(i);
      urls.push(url);
    } catch (error) {
      console.error(`❌ Failed to generate review image ${i + 1}:`, error);
    }
  }
  return urls;
}

export function getAllCachedReviewImageUrls(): string[] {
  const urls: string[] = [];
  for (let i = 0; i < REVIEW_IMAGE_PROMPTS.length; i++) {
    const fileName = `review-image-${i + 1}.webp`;
    const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      urls.push(`/review-images/${fileName}`);
    }
  }
  return urls;
}
