import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, sql, inArray } from 'drizzle-orm';
import ws from 'ws';
import * as fs from 'fs';
import * as schema from '../shared/schema';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Parse CSV
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
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
      currentLine.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        if (currentLine.some(f => f.trim())) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    if (currentLine.some(f => f.trim())) {
      lines.push(currentLine);
    }
  }
  
  return lines;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Category mapping from WooCommerce to clean structure
const categoryMapping: Record<string, { name: string; parent?: string }> = {
  'Multimedia Shop': { name: 'Navigatie & Multimedia' },
  'Multimedia Shop > Autospecifieke Navigatie': { name: 'Autospecifieke Navigatie', parent: 'Navigatie & Multimedia' },
  'Multimedia Shop > 2 DIN navigatie': { name: '2-DIN Systemen', parent: 'Navigatie & Multimedia' },
  'Multimedia Shop > 1 DIN navigatie': { name: '1-DIN Systemen', parent: 'Navigatie & Multimedia' },
  'Multimedia Shop > Android Navigatie Mercedes': { name: 'Android Navigatie Mercedes', parent: 'Navigatie & Multimedia' },
  'Multimedia Shop > Android Navigatie Audi': { name: 'Android Navigatie Audi', parent: 'Navigatie & Multimedia' },
  'Audio Shop > Speakers': { name: 'Speakers' },
  'Audio Shop > Speakers > Coaxiaalsets': { name: 'Coaxiaal Speakers', parent: 'Speakers' },
  'Audio Shop > Speakers > Composets': { name: 'Component Speakers', parent: 'Speakers' },
  'Audio Shop > Pasklare speakers': { name: 'Pasklare Speakers', parent: 'Speakers' },
  'Audio Shop > Subwoofers': { name: 'Subwoofers' },
  'Audio Shop > Subwoofers > Losse subwoofers': { name: 'Losse Subwoofers', parent: 'Subwoofers' },
  'Audio Shop > Subwoofers > Subwoofer met kist': { name: 'Subwoofer met Behuizing', parent: 'Subwoofers' },
  'Audio Shop > Versterkers': { name: 'Versterkers' },
  'Audio Shop > Dempingsmateriaal': { name: 'Dempingsmateriaal' },
  'Veiligheid > Camera': { name: 'Camera Systemen' },
  'Veiligheid > Camera > Achteruitrijcamera': { name: 'Achteruitrijcamera', parent: 'Camera Systemen' },
  'Camper Shop': { name: 'Camper Navigatie' },
  'Camper Shop > Camper navigatie': { name: 'Camper Navigatie' },
  'Alpine Shop': { name: 'Alpine Producten' },
};

// Audio brand detection
const audioBrands = [
  'Alpine', 'Pioneer', 'Kenwood', 'Audison', 'Hertz', 'Focal', 'BlackVue',
  'Mosconi', 'Gladen', 'Eton', 'Ground Zero', 'Brax', 'Helix', 'Match',
  'Kicker', 'Rockford Fosgate', 'Blaupunkt', 'ACV', 'STP', 'Boxmore',
  'Carvision', 'GCC', 'Blaupunkt', 'Sony', 'Clarion'
];

// Vehicle makes for extraction
const vehicleMakes = [
  'Audi', 'BMW', 'Mercedes', 'Mercedes Benz', 'Volkswagen', 'VW', 'Opel',
  'Ford', 'Fiat', 'Peugeot', 'Renault', 'Citroën', 'Citroen', 'Toyota',
  'Kia', 'Hyundai', 'Seat', 'Skoda', 'Volvo', 'Porsche', 'Mini', 'Alfa Romeo',
  'Chrysler', 'Jeep', 'Honda', 'Mazda', 'Nissan', 'Mitsubishi', 'Suzuki',
  'Dacia', 'Chevrolet', 'Land Rover', 'Range Rover', 'Bentley'
];

function extractBrand(title: string): string | null {
  for (const brand of audioBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function extractVehicleInfo(title: string): { make: string; model?: string }[] {
  const results: { make: string; model?: string }[] = [];
  const lowerTitle = title.toLowerCase();
  
  for (const make of vehicleMakes) {
    if (lowerTitle.includes(make.toLowerCase())) {
      // Try to extract model from title
      const makePattern = new RegExp(`${make}\\s+([A-Za-z0-9\\s]+?)(?:\\s+|$|,|\\)|\\()`, 'i');
      const match = title.match(makePattern);
      results.push({
        make: make === 'VW' ? 'Volkswagen' : make === 'Mercedes Benz' ? 'Mercedes' : make,
        model: match ? match[1].trim() : undefined
      });
    }
  }
  
  return results;
}

function getCleanProductName(title: string): string {
  // Remove vehicle-specific suffixes
  let cleanName = title
    .replace(/\s*[-–]\s*(voor|geschikt voor|voor de)?\s*(de\s+)?.*$/i, '')
    .replace(/\s+(voor|geschikt voor)\s+.*$/i, '')
    .trim();
  
  // Clean up extra whitespace and brackets
  cleanName = cleanName
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanName;
}

interface ProductData {
  title: string;
  price: string;
  salePrice: string;
  description: string;
  shortDescription: string;
  sku: string;
  image: string;
  category: string;
  content: string;
}

async function main() {
  console.log('🚀 Starting product import...\n');
  
  // Read CSV
  const csvPath = 'attached_assets/Producten_-_CAL_-_Producten_1764907071080.csv';
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Find column indices
  const titleIdx = headers.indexOf('Title');
  const priceIdx = headers.indexOf('regular price');
  const salePriceIdx = headers.indexOf('sale price');
  const categoryIdx = headers.indexOf('Productcategorieën');
  const skuIdx = headers.indexOf('SKU');
  const statusIdx = headers.indexOf('Status');
  const imageIdx = headers.indexOf('Featured Image');
  const contentIdx = headers.indexOf('Content');
  const shortDescIdx = headers.indexOf('Short description');
  
  console.log(`📊 Total rows: ${dataRows.length}`);
  
  // Collect published products
  const publishedProducts: ProductData[] = [];
  dataRows.forEach((row) => {
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';
    
    if (status !== 'Gepubliceerd' || !title || title.startsWith('<')) return;
    
    publishedProducts.push({
      title,
      price: row[priceIdx] || '0',
      salePrice: row[salePriceIdx] || '',
      description: row[contentIdx] || '',
      shortDescription: row[shortDescIdx] || '',
      sku: row[skuIdx] || '',
      image: row[imageIdx] || '',
      category: row[categoryIdx] || '',
      content: row[contentIdx] || ''
    });
  });
  
  console.log(`✅ Published products: ${publishedProducts.length}\n`);
  
  // STEP 0: Clear existing data (in correct order due to FK constraints)
  console.log('🗑️  Clearing existing data...');
  await db.delete(schema.productVehicleCompatibility);
  await db.delete(schema.cartItems);
  await db.delete(schema.orderItems);
  await db.delete(schema.products);
  console.log('   Cleared products and related data\n');
  
  // STEP 1: Create Categories
  console.log('📁 Creating categories...');
  
  const categoriesToCreate = [
    { name: 'Navigatie & Multimedia', slug: 'navigatie-multimedia' },
    { name: 'Speakers', slug: 'speakers' },
    { name: 'Subwoofers', slug: 'subwoofers' },
    { name: 'Versterkers', slug: 'versterkers' },
    { name: "Camera's & Veiligheid", slug: 'cameras-veiligheid' },
    { name: 'Camper', slug: 'camper' },
    { name: 'Accessoires', slug: 'accessoires' },
  ];
  
  // Clear existing categories and create fresh
  await db.delete(schema.categories);
  
  const categoryIdMap: Record<string, string> = {};
  
  // Create all categories (flat structure, no parent-child)
  for (const cat of categoriesToCreate) {
    const [created] = await db.insert(schema.categories).values({
      name: cat.name,
      slug: cat.slug,
    }).returning();
    categoryIdMap[cat.slug] = created.id;
  }
  
  console.log(`   Created ${Object.keys(categoryIdMap).length} categories\n`);
  
  // STEP 2: Get existing brands from database
  console.log('🏷️  Fetching brands...');
  const existingBrands = await db.select().from(schema.brands);
  const brandMap: Record<string, string> = {};
  existingBrands.forEach(b => {
    brandMap[b.name.toLowerCase()] = b.id;
  });
  console.log(`   Found ${existingBrands.length} existing brands\n`);
  
  // STEP 3: Get existing vehicle makes
  console.log('🚗 Fetching vehicle makes...');
  const existingMakes = await db.select().from(schema.vehicleMakes);
  const makeMap: Record<string, string> = {};
  existingMakes.forEach(m => {
    makeMap[m.name.toLowerCase()] = m.id;
    // Also handle common aliases
    if (m.name.toLowerCase() === 'volkswagen') makeMap['vw'] = m.id;
    if (m.name.toLowerCase() === 'mercedes') makeMap['mercedes benz'] = m.id;
  });
  console.log(`   Found ${existingMakes.length} existing vehicle makes\n`);
  
  // STEP 4: Group products by base name for deduplication
  console.log('🔄 Grouping products for deduplication...');
  
  const productGroups: Map<string, ProductData[]> = new Map();
  
  publishedProducts.forEach(product => {
    const cleanName = getCleanProductName(product.title);
    
    if (!productGroups.has(cleanName)) {
      productGroups.set(cleanName, []);
    }
    productGroups.get(cleanName)!.push(product);
  });
  
  console.log(`   Found ${productGroups.size} unique product groups\n`);
  
  // STEP 5: Ready to import products
  
  // STEP 6: Import products
  console.log('📦 Importing products...');
  
  let importedCount = 0;
  let compatibilityCount = 0;
  const errors: string[] = [];
  
  for (const [baseName, variants] of productGroups) {
    try {
      // Use first variant as the main product data
      const mainProduct = variants[0];
      
      // Get highest price among variants
      const prices = variants
        .map(v => parseFloat(v.price.replace(',', '.')) || 0)
        .filter(p => p > 0);
      const price = prices.length > 0 ? Math.max(...prices) : 0;
      
      // Get sale price if any
      const salePrices = variants
        .map(v => parseFloat(v.salePrice.replace(',', '.')) || 0)
        .filter(p => p > 0);
      const salePrice = salePrices.length > 0 ? Math.min(...salePrices) : null;
      
      // Skip products without valid price
      if (price === 0) {
        errors.push(`Skipped ${baseName}: no valid price`);
        continue;
      }
      
      // Determine brand
      const brand = extractBrand(mainProduct.title);
      const brandId = brand ? brandMap[brand.toLowerCase()] : null;
      
      // Determine category based on WooCommerce categories (simplified to 7 categories)
      let categorySlug = 'navigatie-multimedia'; // Default
      const wooCategory = mainProduct.category.toLowerCase();
      const productName = baseName.toLowerCase();
      
      if (wooCategory.includes('speakers') || wooCategory.includes('speaker')) {
        categorySlug = 'speakers';
      } else if (wooCategory.includes('subwoofer')) {
        categorySlug = 'subwoofers';
      } else if (wooCategory.includes('versterker')) {
        categorySlug = 'versterkers';
      } else if (wooCategory.includes('demping') || wooCategory.includes('stp') || productName.includes('demping')) {
        categorySlug = 'accessoires';
      } else if (wooCategory.includes('camera') || wooCategory.includes('blackvue') || productName.includes('blackvue') || productName.includes('dashcam') || productName.includes('camera')) {
        categorySlug = 'cameras-veiligheid';
      } else if (wooCategory.includes('camper')) {
        categorySlug = 'camper';
      } else if (wooCategory.includes('multimedia') || wooCategory.includes('navigatie') || wooCategory.includes('android') || wooCategory.includes('carplay') || wooCategory.includes('din')) {
        categorySlug = 'navigatie-multimedia';
      }
      
      const categoryId = categoryIdMap[categorySlug];
      
      // Generate unique slug
      let baseSlug = slugify(baseName);
      if (!baseSlug) baseSlug = `product-${importedCount}`;
      
      // Make slug unique
      let slug = baseSlug;
      let slugCounter = 1;
      while (true) {
        const existing = await db.select().from(schema.products).where(eq(schema.products.slug, slug));
        if (existing.length === 0) break;
        slug = `${baseSlug}-${slugCounter++}`;
      }
      
      // Collect all images from variants
      const images = [...new Set(
        variants
          .map(v => v.image)
          .filter(img => img && img.startsWith('http'))
      )];
      
      // Get SKU (preferably one without vehicle suffix)
      const sku = mainProduct.sku || null;
      
      // Determine if product can have installation
      const canHaveInstallation = categorySlug.includes('navigatie') || 
                                   categorySlug.includes('speakers') ||
                                   categorySlug.includes('subwoofer') ||
                                   categorySlug.includes('versterker') ||
                                   categorySlug.includes('camera');
      
      // Clean description - remove HTML if needed
      let description = mainProduct.description || mainProduct.content || '';
      // Basic HTML cleanup
      description = description
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const shortDescription = mainProduct.shortDescription || description.substring(0, 200);
      
      // Insert product
      const [insertedProduct] = await db.insert(schema.products).values({
        name: baseName,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        price: price.toFixed(2),
        originalPrice: salePrice && salePrice < price ? price.toFixed(2) : null,
        sku: sku || undefined,
        images: images.length > 0 ? images : undefined,
        brandId: brandId || undefined,
        categoryId: categoryId || undefined,
        isActive: true,
        isFeatured: variants.length > 3, // Feature products with many variants
        canHaveInstallation,
        stock: 10,
      }).returning();
      
      importedCount++;
      
      // STEP 7: Create vehicle compatibility for each variant
      for (const variant of variants) {
        const vehicleInfos = extractVehicleInfo(variant.title);
        
        for (const info of vehicleInfos) {
          const makeId = makeMap[info.make.toLowerCase()];
          if (makeId) {
            await db.insert(schema.productVehicleCompatibility).values({
              productId: insertedProduct.id,
              makeId: makeId,
              notes: info.model || null,
            });
            compatibilityCount++;
          }
        }
      }
      
      if (importedCount % 50 === 0) {
        console.log(`   Imported ${importedCount} products...`);
      }
      
    } catch (error) {
      errors.push(`Error importing ${baseName}: ${error}`);
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Products imported: ${importedCount}`);
  console.log(`   Vehicle compatibility records: ${compatibilityCount}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }
  }
  
  // Verify import
  const productCount = await db.select({ count: sql`count(*)` }).from(schema.products);
  const catCount = await db.select({ count: sql`count(*)` }).from(schema.categories);
  const compCount = await db.select({ count: sql`count(*)` }).from(schema.productVehicleCompatibility);
  
  console.log(`\n📊 Database summary:`);
  console.log(`   Categories: ${catCount[0].count}`);
  console.log(`   Products: ${productCount[0].count}`);
  console.log(`   Vehicle compatibility: ${compCount[0].count}`);
  
  await pool.end();
}

main().catch(console.error);
