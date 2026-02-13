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

const PORTRAIT_PROMPTS = [
  "Professional headshot portrait of a friendly Dutch man in his 30s, short brown hair, slight smile, wearing a casual polo shirt, neutral grey background, soft studio lighting, high quality photo",
  "Professional headshot portrait of a confident Belgian woman in her 40s, blonde hair, warm smile, wearing a dark blazer, neutral background, soft lighting, high quality photo",
  "Professional headshot portrait of a young Dutch man in his 20s, dark hair, friendly expression, wearing a t-shirt, neutral grey background, natural lighting, high quality photo",
  "Professional headshot portrait of a mature Dutch man in his 50s, grey hair, glasses, kind smile, wearing a button-down shirt, neutral background, studio lighting, high quality photo",
  "Professional headshot portrait of a Dutch woman in her 30s, brown hair in ponytail, cheerful smile, wearing a sweater, neutral grey background, soft lighting, high quality photo",
  "Professional headshot portrait of a Belgian man in his 40s, beard, friendly expression, wearing a casual jacket, neutral background, natural lighting, high quality photo",
];

export async function generatePortrait(index: number): Promise<string> {
  const safeIndex = index % PORTRAIT_PROMPTS.length;
  const fileName = `reviewer-portrait-${safeIndex + 1}.webp`;
  const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
  const publicUrl = `/review-images/${fileName}`;

  if (fs.existsSync(filePath)) {
    return publicUrl;
  }

  await fs.promises.mkdir(REVIEW_IMAGE_DIR, { recursive: true });

  const prompt = PORTRAIT_PROMPTS[safeIndex];
  const dataUrl = await generateImage(prompt);

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  await fs.promises.writeFile(filePath, buffer);
  console.log(`✅ Generated reviewer portrait: ${fileName}`);

  return publicUrl;
}

export async function generateAllPortraits(): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < PORTRAIT_PROMPTS.length; i++) {
    try {
      const url = await generatePortrait(i);
      urls.push(url);
    } catch (error) {
      console.error(`❌ Failed to generate portrait ${i + 1}:`, error);
    }
  }
  return urls;
}

export function getAllCachedPortraitUrls(): string[] {
  const urls: string[] = [];
  for (let i = 0; i < PORTRAIT_PROMPTS.length; i++) {
    const fileName = `reviewer-portrait-${i + 1}.webp`;
    const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      urls.push(`/review-images/${fileName}`);
    }
  }
  return urls;
}
