import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const sql = neon(process.env.DATABASE_URL!);

const CATEGORY_ID = 'cdd86b37-3d93-4e2b-9a59-1c07fce70f67';
const IMAGE_URL = 'https://caraudiolimburg.nl/wp-content/uploads/UI1-206-32.jpg';

interface AccessoryDef {
  name: string;
  slug: string;
  sku: string;
  price: number;
  shortDescription: string;
  description: string;
  stock: number;
}

const accessories: AccessoryDef[] = [
  {
    name: "Draadloze CarPlay & Android Auto Dongle",
    slug: "carplay-android-auto-dongle",
    sku: "CAL-CP-05",
    price: 65,
    shortDescription: "Draadloze Apple CarPlay & Android Auto dongle. Compatibel met alle BMW Android navigatiesystemen.",
    description: "Draadloze Apple CarPlay & Android Auto dongle voor BMW Android navigatiesystemen. Ondersteunt draadloze verbinding met iPhone (CarPlay) en bekabelde verbinding met Android-telefoons (Android Auto). Eenvoudig aan te sluiten op uw Android navigatiesysteem via USB.\n\nBelangrijkste kenmerken:\n- Draadloze Apple CarPlay\n- Bekabelde Android Auto\n- Plug & Play installatie\n- Compatibel met alle BMW Android navigatiesystemen",
    stock: 50,
  },
  {
    name: "FM Stereo Modulator",
    slug: "fm-stereo-modulator-bmw",
    sku: "CAL-FM-BOX",
    price: 49,
    shortDescription: "FM Stereo Modulator voor BMW modellen zonder AUX-aansluiting. Stuurt audiosignaal naar autoluidsprekers.",
    description: "FM Stereo Modulator voor BMW modellen zonder AUX-aansluiting. Dit apparaat stuurt het audiosignaal van het Android navigatiesysteem naar uw autoluidsprekers via FM. Ideaal voor oudere BMW-modellen (E65/E66, E60, E90) die geen AUX-ingang hebben.\n\nBelangrijkste kenmerken:\n- FM-transmissie naar originele autoluidsprekers\n- Plug & Play installatie\n- Geschikt voor E65/E66, E60 en E90 zonder AUX\n- Stabiel FM-signaal zonder storing",
    stock: 25,
  },
  {
    name: "BMW E65 CDC Simulate Optical Fiber Box",
    slug: "bmw-e65-cdc-optical-fiber-box",
    sku: "CAL-OPT-E65",
    price: 129,
    shortDescription: "CDC Simulate Optical Fiber Box voor BMW 7-Serie E65/E66 CCC zonder AUX, maar met CDC.",
    description: "CDC Simulate Optical Fiber Box speciaal voor de BMW 7-Serie E65/E66 met CCC systeem. Dit apparaat simuleert een CD-wisselaar via het glasvezelnetwerk, waardoor het audiosignaal van het Android navigatiesysteem naar de originele autoluidsprekers wordt gestuurd. Noodzakelijk voor E65/E66 modellen zonder AUX-aansluiting maar met CDC (CD-wisselaar).\n\nBelangrijkste kenmerken:\n- Simuleert CD-wisselaar via glasvezel\n- Specifiek voor BMW E65/E66 CCC\n- Vereist: auto met CDC (CD-wisselaar)\n- Plug & Play aansluiting",
    stock: 10,
  },
  {
    name: "AUX Activator / Coding Box",
    slug: "bmw-aux-activator-coding-box",
    sku: "CAL-AUX-T01",
    price: 119,
    shortDescription: "AUX Activator / Coding Box voor BMW E60/E61/E63/E64 (2006-2010) CCC systeem.",
    description: "AUX Activator / Coding Box voor BMW E60/E61/E63/E64 met CCC systeem (2006-2010). Activeert de AUX-ingang op uw BMW, zodat het Android navigatiesysteem correct kan worden aangesloten. Noodzakelijk als uw E60/E61 geen actieve AUX-aansluiting heeft.\n\nBelangrijkste kenmerken:\n- Activeert AUX-ingang op CCC systeem\n- Geschikt voor BMW E60/E61/E63/E64 (2006-2010)\n- Plug & Play coding box\n- Eenmalige installatie",
    stock: 10,
  },
  {
    name: "iDrive Knop voor BMW Z4 E89",
    slug: "bmw-z4-e89-idrive-knop",
    sku: "CAL-ID-002",
    price: 35,
    shortDescription: "iDrive draaiknop voor BMW Z4 E89 zonder originele iDrive knop.",
    description: "Vervangende iDrive draaiknop voor de BMW Z4 E89 (2009-2015). Noodzakelijk als uw Z4 E89 geen originele iDrive draaiknop heeft. De knop wordt direct aangesloten op het Android navigatiesysteem en geeft u volledige controle over het menu.\n\nBelangrijkste kenmerken:\n- Vervangende iDrive draaiknop\n- Specifiek voor BMW Z4 E89\n- Directe aansluiting op Android systeem\n- OEM look & feel",
    stock: 10,
  },
];

const carplayInterface = {
  name: "BMW Draadloze Apple CarPlay Interface",
  slug: "bmw-draadloze-apple-carplay-interface",
  sku: "CAL-CP-CARPLAY",
  price: 319,
  installationPrice: 99,
  shortDescription: "Draadloze Apple CarPlay interface voor BMW. Behoudt origineel scherm, voegt CarPlay toe. Geschikt voor NBT, CIC, EVO en CCC systemen.",
  description: "Draadloze Apple CarPlay interface voor BMW voertuigen. Voeg draadloze Apple CarPlay toe aan uw originele BMW scherm zonder het te vervangen. Ideaal als u tevreden bent met uw originele display maar wel de functionaliteit van Apple CarPlay wilt toevoegen.\n\nCompatibel met vrijwel alle BMW-modellen uit 2004-2020 met NBT, CIC, EVO of CCC systeem. De interface wordt achter het bestaande scherm aangesloten en is volledig Plug & Play.\n\nBelangrijkste kenmerken:\n- Draadloze Apple CarPlay\n- Behoudt origineel BMW scherm\n- Plug & Play installatie\n- Geschikt voor NBT, CIC, EVO en CCC systemen\n- Compatibel met 1/2/3/4/5/6/7/X1/X3/X4/X5/X6 Serie",
  variations: [
    { label: "NBT systeem (LVDS 6 PIN)", sku: "CAL-CP-08", price: 319, isDefault: true, sortOrder: 0 },
    { label: "CIC systeem (LVDS 4 PIN)", sku: "CAL-CP-10", price: 319, isDefault: false, sortOrder: 1 },
    { label: "EVO systeem (LVDS 6 PIN)", sku: "CAL-CP-09", price: 339, isDefault: false, sortOrder: 2 },
    { label: "CCC systeem - E90/E60 (LVDS 10 PIN)", sku: "CAL-CP-21", price: 339, isDefault: false, sortOrder: 3 },
    { label: "CCC systeem - X5 E70/X6 E71 (LVDS 10 PIN)", sku: "CAL-CP-22", price: 339, isDefault: false, sortOrder: 4 },
  ],
};

const allBmwNavSlugs = [
  'bmw-1-serie-f20-android-navigatie',
  'bmw-1-serie-e87-android-navigatie',
  'bmw-2-serie-android-navigatie',
  'bmw-3-serie-e90-android-navigatie',
  'bmw-3-4-serie-f30-android-navigatie',
  'bmw-3-4-serie-evo-android-navigatie',
  'bmw-5-serie-e60-android-navigatie',
  'bmw-5-serie-f10-android-navigatie',
  'bmw-5-serie-f07-gt-android-navigatie',
  'bmw-5-serie-g30-android-navigatie',
  'bmw-6-serie-android-navigatie',
  'bmw-7-serie-f01-android-navigatie',
  'bmw-7-serie-e65-android-navigatie',
  'bmw-7-serie-g11-android-navigatie',
  'bmw-x1-android-navigatie',
  'bmw-x3-x4-android-navigatie',
  'bmw-x5-x6-android-navigatie',
  'bmw-z4-android-navigatie',
];

async function main() {
  let productsCreated = 0;
  let variationsCreated = 0;
  let upsellsCreated = 0;

  console.log('Starting accessory and upsell insertion...');
  console.log('');

  try {
    for (const acc of accessories) {
      const existing = await sql('SELECT id FROM products WHERE slug = $1', [acc.slug]);
      if (existing.length > 0) {
        console.log(`⏭️  Product already exists: ${acc.name} (${acc.slug})`);
        continue;
      }

      await sql(
        `INSERT INTO products (name, slug, sku, price, short_description, description, images, stock, category_id, has_variations, can_have_installation, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          acc.name,
          acc.slug,
          acc.sku,
          acc.price.toString(),
          acc.shortDescription,
          acc.description,
          [IMAGE_URL],
          acc.stock,
          CATEGORY_ID,
          false,
          false,
          true,
        ]
      );
      console.log(`✅ Created product: ${acc.name} (€${acc.price})`);
      productsCreated++;
    }

    const cpExisting = await sql('SELECT id FROM products WHERE slug = $1', [carplayInterface.slug]);
    if (cpExisting.length > 0) {
      console.log(`⏭️  Product already exists: ${carplayInterface.name} (${carplayInterface.slug})`);
    } else {
      await sql(
        `INSERT INTO products (name, slug, sku, price, installation_price, short_description, description, images, category_id, has_variations, can_have_installation, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          carplayInterface.name,
          carplayInterface.slug,
          carplayInterface.sku,
          carplayInterface.price.toString(),
          carplayInterface.installationPrice.toString(),
          carplayInterface.shortDescription,
          carplayInterface.description,
          [IMAGE_URL],
          CATEGORY_ID,
          true,
          true,
          true,
        ]
      );
      console.log(`✅ Created product: ${carplayInterface.name} (€${carplayInterface.price})`);
      productsCreated++;

      const cpProduct = await sql('SELECT id FROM products WHERE slug = $1', [carplayInterface.slug]);
      const cpProductId = cpProduct[0].id;

      for (const v of carplayInterface.variations) {
        const vExisting = await sql('SELECT id FROM product_variations WHERE product_id = $1 AND sku = $2', [cpProductId, v.sku]);
        if (vExisting.length > 0) {
          console.log(`  ⏭️  Variation already exists: ${v.label}`);
          continue;
        }

        await sql(
          `INSERT INTO product_variations (product_id, label, sku, price, is_default, sort_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [cpProductId, v.label, v.sku, v.price.toString(), v.isDefault, v.sortOrder, true]
        );
        console.log(`  ✅ Created variation: ${v.label} (€${v.price})`);
        variationsCreated++;
      }
    }

    console.log('');
    console.log('Creating upsell links...');

    const allSlugsNeeded = [
      ...allBmwNavSlugs,
      'carplay-android-auto-dongle',
      'bmw-draadloze-apple-carplay-interface',
      'fm-stereo-modulator-bmw',
      'bmw-e65-cdc-optical-fiber-box',
      'bmw-aux-activator-coding-box',
      'bmw-z4-e89-idrive-knop',
    ];

    const slugRows = await sql(
      `SELECT id, slug FROM products WHERE slug = ANY($1)`,
      [allSlugsNeeded]
    );
    const slugToId: Record<string, string> = {};
    for (const row of slugRows) {
      slugToId[row.slug] = row.id;
    }

    const missingNavSlugs = allBmwNavSlugs.filter(s => !slugToId[s]);
    if (missingNavSlugs.length > 0) {
      console.log(`⚠️  Missing BMW nav products (will skip their upsells): ${missingNavSlugs.join(', ')}`);
    }

    async function createUpsell(upsellSlug: string, targetSlug: string, sortOrder: number, label?: string) {
      const upsellId = slugToId[upsellSlug];
      const targetId = slugToId[targetSlug];
      if (!upsellId || !targetId) return false;

      const existing = await sql(
        'SELECT id FROM product_upsells WHERE product_id = $1 AND upsell_product_id = $2',
        [targetId, upsellId]
      );
      if (existing.length > 0) return false;

      await sql(
        `INSERT INTO product_upsells (product_id, upsell_product_id, sort_order, label)
         VALUES ($1, $2, $3, $4)`,
        [targetId, upsellId, sortOrder, label || null]
      );
      return true;
    }

    for (const navSlug of allBmwNavSlugs) {
      if (await createUpsell('carplay-android-auto-dongle', navSlug, 10)) {
        upsellsCreated++;
      }
    }
    console.log(`✅ CarPlay Dongle → BMW nav products upsells done`);

    for (const navSlug of allBmwNavSlugs) {
      if (await createUpsell('bmw-draadloze-apple-carplay-interface', navSlug, 20, 'Alternatief: behoud origineel scherm')) {
        upsellsCreated++;
      }
    }
    console.log(`✅ CarPlay Interface → BMW nav products upsells done`);

    const fmTargets = ['bmw-7-serie-e65-android-navigatie', 'bmw-5-serie-e60-android-navigatie', 'bmw-3-serie-e90-android-navigatie'];
    for (const slug of fmTargets) {
      if (await createUpsell('fm-stereo-modulator-bmw', slug, 1)) {
        upsellsCreated++;
      }
    }
    console.log(`✅ FM Modulator → E65/E60/E90 upsells done`);

    if (await createUpsell('bmw-e65-cdc-optical-fiber-box', 'bmw-7-serie-e65-android-navigatie', 2)) {
      upsellsCreated++;
    }
    console.log(`✅ CDC Optical Fiber Box → E65 upsell done`);

    if (await createUpsell('bmw-aux-activator-coding-box', 'bmw-5-serie-e60-android-navigatie', 2)) {
      upsellsCreated++;
    }
    console.log(`✅ AUX Activator → E60 upsell done`);

    if (await createUpsell('bmw-z4-e89-idrive-knop', 'bmw-z4-android-navigatie', 1)) {
      upsellsCreated++;
    }
    console.log(`✅ iDrive Knop → Z4 upsell done`);

    console.log('');
    console.log('=== Summary ===');
    console.log(`Products created: ${productsCreated}`);
    console.log(`Variations created: ${variationsCreated}`);
    console.log(`Upsell links created: ${upsellsCreated}`);
    console.log('Done!');
  } catch (error) {
    console.error('Error during insertion:', error);
    process.exit(1);
  }
}

main();
