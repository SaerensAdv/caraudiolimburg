import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";

interface DiscoveredImages {
  sku: string;
  name: string;
  newImages: string[];
}

const DISCOVERED_IMAGES: DiscoveredImages[] = [
  {
    sku: "CAL DBX 30.3",
    name: "Hertz subbox DBX 30.3",
    newImages: [
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DBX_30.3_subwoofer_box_emo.jpg",
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DBX_30.3_subwoofer_box_b.jpg",
      "https://static.hertz-audio.com/media/2022/02/DBX_30.3.png",
    ],
  },
  {
    sku: "CAL-MPBX 250 S2",
    name: "Hertz MPBX 250 S2",
    newImages: [
      "https://static.hertz-audio.com/media/2022/03/Hertz_Mille_PRO_Shallow_Box_250_m.jpg",
      "https://static.hertz-audio.com/media/2022/03/Hertz_Mille_PRO_Shallow_Box_250_b.jpg",
    ],
  },
  {
    sku: "CAL-MPBX 300 S2",
    name: "Hertz MPBX 300 S2",
    newImages: [
      "https://static.hertz-audio.com/media/2022/03/Hertz_Mille_PRO_Shallow_Box_300_m.jpg",
      "https://static.hertz-audio.com/media/2022/03/Hertz_Mille_PRO_Shallow_Box_300_emo.jpg",
      "https://static.hertz-audio.com/media/2022/03/Hertz_Mille_PRO_Shallow_Box_300_b.jpg",
    ],
  },
  {
    sku: "DPower 1",
    name: "Hertz DPower 1",
    newImages: [
      "https://static.hertz-audio.com/media/2024/01/HERTZ_DP-1500_TOP.jpg",
      "https://static.hertz-audio.com/media/2024/01/HERTZ_DP-1500_BOTTOM.jpg",
    ],
  },
  {
    sku: "DSK 130.3",
    name: "Hertz DSK 130.3",
    newImages: [
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_130.3_speakers_system_emo.jpg",
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_130.3_speakers_system_b.jpg",
      "https://static.hertz-audio.com/media/2022/02/DSK130.3.png",
    ],
  },
  {
    sku: "DSK 160.3",
    name: "Hertz DSK 160.3",
    newImages: [
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_160.3_speakers_system_emo.jpg",
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_160.3_speakers_system_b.jpg",
      "https://static.hertz-audio.com/media/2022/02/DSK160.3.png",
    ],
  },
  {
    sku: "DSK 165.3",
    name: "Hertz DSK 165.3",
    newImages: [
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_165.3_speakers_system_emo.jpg",
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_165.3_speakers_system_b.jpg",
      "https://static.hertz-audio.com/media/2022/02/DSK165.3.png",
    ],
  },
  {
    sku: "DSK 170.3",
    name: "Hertz DSK 170.3",
    newImages: [
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_170.3_speakers_system_emo.jpg",
      "https://static.hertz-audio.com/media/2022/11/Hertz_Dieci_DSK_170.3_speakers_system_b.jpg",
      "https://static.hertz-audio.com/media/2022/02/DSK170.3.png",
    ],
  },
  {
    sku: "ML Power 1",
    name: "Hertz ML Power 1",
    newImages: [
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower1_top.png",
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower1_bottom.png",
    ],
  },
  {
    sku: "ML Power 4",
    name: "Hertz ML Power 4",
    newImages: [
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower4_top.png",
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower4_bottom.png",
    ],
  },
  {
    sku: "ML Power 5",
    name: "Hertz ML Power 5",
    newImages: [
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower5_top.png",
      "https://static.hertz-audio.com/media/2021/04/Hertz_MLPower5_bottom.png",
    ],
  },
  {
    sku: "MLK 165.3",
    name: "Hertz MLK 165.3",
    newImages: [
      "https://static.hertz-audio.com/media/2021/04/MLK-165_3_system.png",
      "https://static.hertz-audio.com/media/2022/02/MLK165.3.png",
    ],
  },
  {
    sku: "MLK 700.3",
    name: "Hertz MLK 700.3",
    newImages: [
      "https://static.hertz-audio.com/media/2021/04/Hertz_Mille_Legend_MLK-700_3_system.png",
      "https://static.hertz-audio.com/media/2022/02/MLK700.3.png",
    ],
  },
  {
    sku: "SS 12 D2",
    name: "Hertz SS 12D2",
    newImages: [
      "https://static.hertz-audio.com/media/2022/02/SS_15_D2.png",
      "https://static.hertz-audio.com/media/2021/04/SPLShow_SS15D2_3D.jpg",
      "https://static.hertz-audio.com/media/2021/04/Hertz_SPLShow_-SS-12-D2_graph.png",
    ],
  },
  {
    sku: "SS 15 D2",
    name: "Hertz SS 15 D2",
    newImages: [
      "https://static.hertz-audio.com/media/2022/02/SS_15_D2.png",
      "https://static.hertz-audio.com/media/2021/04/SPLShow_SS15D2_3D1.jpg",
      "https://static.hertz-audio.com/media/2021/04/Hertz_SPLShow_-SS-15-D2_graph.png",
    ],
  },
  {
    sku: "CAL-ICREN130",
    name: "Focal ICREN130",
    newImages: [
      "https://dam.focal-naim.com/m/ac4fe69677876da/original/IC-REN130_couple-jpg.jpg",
    ],
  },
  {
    sku: "CAL-IMPULSE",
    name: "Focal Impulse 4.320",
    newImages: [
      "https://dam.focal-naim.com/m/be276814e8b22aa/original/Impuls_4-320_34-jpg.jpg",
      "https://dam.focal-naim.com/m/5b5cf371a98e88b6/original/Impuls_4-320_Matiere-jpg.jpg",
      "https://dam.focal-naim.com/m/2348b61ade9ccbf0/original/Impuls_4-320_Face01-jpg.jpg",
      "https://dam.focal-naim.com/m/13d1a19d209d4b44/original/Impuls_4-320_Dessous_02-jpg.jpg",
      "https://dam.focal-naim.com/m/2c99613a1b186742/original/Impuls_4-320_Cable05-jpg.jpg",
      "https://dam.focal-naim.com/m/19268a5a89e38d59/original/Impuls_4-320_Cable03-jpg.jpg",
      "https://dam.focal-naim.com/m/16123d2a8259d3d3/original/Impuls_4-320_Cable02-jpg.jpg",
    ],
  },
  {
    sku: "CAL-ISBMW100",
    name: "Focal ISBMW100",
    newImages: [
      "https://dam.focal-naim.com/m/1b0d590fd8aec982/original/ISBMW100_Facing-jpg.jpg",
      "https://dam.focal-naim.com/m/749358f6b834cef2/original/ISBMW100_Face-jpg.jpg",
      "https://dam.focal-naim.com/m/434db5f109588d47/original/ISBMW100_Prof-jpg.jpg",
      "https://dam.focal-naim.com/m/15d1898d9caa60ad/original/ISBMW100_Dos-jpg.jpg",
      "https://dam.focal-naim.com/m/6240d813680fa769/original/BMW_Tweeter-jpg.jpg",
      "https://dam.focal-naim.com/m/6ebb06c552789e08/original/BMW_Tweeter02-jpg.jpg",
      "https://dam.focal-naim.com/m/791ccbbd6c91909c/original/BMW_Filtre-jpg.jpg",
    ],
  },
];

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "";
  } catch {
    return url.split("/").pop() || "";
  }
}

async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== Hertz & Focal Image Updater ===");
  console.log("Using pre-discovered image URLs from manufacturer websites\n");

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      images: products.images,
    })
    .from(products);

  const skuToProduct = new Map<string, typeof allProducts[0]>();
  for (const p of allProducts) {
    if (p.sku) {
      skuToProduct.set(p.sku, p);
    }
  }

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let verified = 0;
  let failed = 0;
  const total = DISCOVERED_IMAGES.length;

  for (let i = 0; i < DISCOVERED_IMAGES.length; i++) {
    const mapping = DISCOVERED_IMAGES[i];
    const product = skuToProduct.get(mapping.sku);

    if (!product) {
      console.log(`[${i + 1}/${total}] SKU ${mapping.sku} - NOT IN DATABASE`);
      notFound++;
      continue;
    }

    const currentImages = product.images || [];
    if (currentImages.length > 1) {
      console.log(`[${i + 1}/${total}] ${product.name} - Already has ${currentImages.length} images, skipping`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${total}] ${product.name} (${mapping.sku})`);
    console.log(`  Current images: ${currentImages.length}`);

    const seenFilenames = new Set<string>();
    const newImages: string[] = [];

    const firstImage = currentImages[0] || "";
    if (firstImage) {
      newImages.push(firstImage);
      const fn = extractFilename(firstImage).toLowerCase();
      if (fn) seenFilenames.add(fn);
    }

    const validNewImages: string[] = [];
    for (const imgUrl of mapping.newImages) {
      const fn = extractFilename(imgUrl).toLowerCase();
      if (fn && seenFilenames.has(fn)) {
        console.log(`  Skipping duplicate: ${fn}`);
        continue;
      }

      const isValid = await verifyImageUrl(imgUrl);
      if (isValid) {
        validNewImages.push(imgUrl);
        if (fn) seenFilenames.add(fn);
        verified++;
        console.log(`  ✓ Verified: ${fn}`);
      } else {
        failed++;
        console.log(`  ✗ Not accessible: ${fn}`);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    for (const img of validNewImages) {
      newImages.push(img);
    }

    if (newImages.length > currentImages.length) {
      await db
        .update(products)
        .set({ images: newImages })
        .where(eq(products.id, product.id));
      console.log(`  Updated: ${currentImages.length} → ${newImages.length} images`);
      updated++;
    } else {
      console.log(`  No new unique images to add`);
      skipped++;
    }
  }

  console.log("\n\n=== UPDATE COMPLETE ===\n");
  console.log(`Total products processed: ${total}`);
  console.log(`Not in database:          ${notFound}`);
  console.log(`Updated with images:      ${updated}`);
  console.log(`Skipped (enough images):  ${skipped}`);
  console.log(`Images verified:          ${verified}`);
  console.log(`Images not accessible:    ${failed}`);
  console.log("\nNote: Focal products EU3.5WM, EUSUB10WM, P60, ISUB MBZ 2, and ISUBBMW4");
  console.log("have been discontinued and their pages return 404 on focal.com");

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
