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
  const fileName = `review-image-${safeIndex + 1}.png`;
  const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
  const publicUrl = `/review-images/${fileName}`;

  if (fs.existsSync(filePath)) {
    return publicUrl;
  }

  return null;
}

export async function generateReviewImage(index: number): Promise<string> {
  const safeIndex = index % REVIEW_IMAGE_PROMPTS.length;
  const fileName = `review-image-${safeIndex + 1}.png`;
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
    const fileName = `review-image-${i + 1}.png`;
    const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      urls.push(`/review-images/${fileName}`);
    }
  }
  return urls;
}

const PORTRAIT_PROMPTS = [
  "Candid smartphone selfie of a friendly Dutch man in his late 50s, short grey hair, relaxed smile, wearing a casual button-up shirt, taken outdoors in soft daylight, slightly blurred background of a parking lot, natural look, no studio lighting, realistic everyday photo",
  "Casual photo of a cheerful Limburgish man in his 40s, short dark blond hair, broad grin, wearing a simple hoodie, taken in a living room with warm lamp light in background, natural imperfect framing, realistic mobile phone quality",
  "Natural photo of a sporty Dutch man in his mid 30s, short dark hair, light stubble, slight smirk, wearing a dark t-shirt, taken outside near a car on a cloudy day, relaxed pose, realistic everyday snapshot quality",
  "Candid portrait of a friendly older Dutch man in his early 60s, grey hair, reading glasses on forehead, warm genuine smile, wearing a polo shirt, taken in a garage workshop setting, natural overhead lighting, realistic amateur photo",
  "Natural selfie of a fit Dutch man in his late 30s, buzz cut brown hair, clean shaven, friendly expression, wearing a simple crew neck sweater, taken indoors with window light, slightly off-center framing, realistic phone camera quality",
  "Casual snapshot of a Belgian man in his mid 40s, short brown hair with some grey at temples, neat short beard, relaxed smile, wearing a zip-up jacket, taken outdoors on a sunny day, natural lighting, realistic everyday photo quality",
];

export async function generatePortrait(index: number): Promise<string> {
  const safeIndex = index % PORTRAIT_PROMPTS.length;
  const fileName = `reviewer-portrait-${safeIndex + 1}.png`;
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
    const fileName = `reviewer-portrait-${i + 1}.png`;
    const filePath = path.join(REVIEW_IMAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      urls.push(`/review-images/${fileName}`);
    }
  }
  return urls;
}
