const fs = require('fs');
const path = require('path');

const csvPath = 'attached_assets/Producten_-_CAL_-_Producten_1764907071080.csv';
const content = fs.readFileSync(csvPath, 'utf-8');

function parseCSV(text) {
  const lines = [];
  let currentLine = [];
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

const rows = parseCSV(content);
const headers = rows[0];
const dataRows = rows.slice(1);

console.log('=== CSV ANALYSIS ===\n');
console.log(`Total rows: ${dataRows.length}`);
console.log(`Headers: ${headers.slice(0, 10).join(', ')}...\n`);

const titleIdx = headers.indexOf('Title');
const priceIdx = headers.indexOf('regular price');
const categoryIdx = headers.indexOf('Productcategorieën');
const skuIdx = headers.indexOf('SKU');
const statusIdx = headers.indexOf('Status');
const imageIdx = headers.indexOf('Featured Image');

const categories = new Map();
const productsByBaseTitle = new Map();
const publishedProducts = [];

dataRows.forEach((row, idx) => {
  const title = row[titleIdx] || '';
  const price = row[priceIdx] || '';
  const categoryStr = row[categoryIdx] || '';
  const status = row[statusIdx] || '';
  const sku = row[skuIdx] || '';
  const image = row[imageIdx] || '';
  
  if (status !== 'Gepubliceerd' || !title || title.startsWith('<')) return;
  
  publishedProducts.push({ title, price, category: categoryStr, sku, image, rowIdx: idx });
  
  if (categoryStr) {
    categoryStr.split(',').forEach(cat => {
      const trimmed = cat.trim();
      if (trimmed) {
        categories.set(trimmed, (categories.get(trimmed) || 0) + 1);
      }
    });
  }
  
  let baseTitle = title;
  
  // Extract vehicle info and get base product name
  const vehiclePatterns = [
    /\s*[-–]\s*(voor|geschikt voor)?\s*(de\s+)?(.+)$/i,
    /\s+(voor|geschikt voor)\s+(de\s+)?(.+)$/i,
  ];
  
  let vehicleInfo = null;
  for (const pattern of vehiclePatterns) {
    const match = title.match(pattern);
    if (match) {
      vehicleInfo = match[3] || match[0];
      baseTitle = title.replace(pattern, '').trim();
      break;
    }
  }
  
  // Clean up base title
  baseTitle = baseTitle
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!productsByBaseTitle.has(baseTitle)) {
    productsByBaseTitle.set(baseTitle, []);
  }
  productsByBaseTitle.get(baseTitle).push({ 
    title, 
    price, 
    category: categoryStr, 
    sku, 
    image,
    vehicleInfo 
  });
});

console.log(`Published products: ${publishedProducts.length}\n`);

console.log('=== TOP CATEGORIES ===');
const sortedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
sortedCategories.forEach(([cat, count]) => {
  console.log(`  ${count}x ${cat}`);
});

console.log('\n=== PRODUCT GROUPS WITH DUPLICATES ===');
const groupsWithMultiple = [...productsByBaseTitle.entries()]
  .filter(([_, products]) => products.length > 1)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 25);

let totalDuplicates = 0;
groupsWithMultiple.forEach(([baseTitle, products]) => {
  totalDuplicates += products.length - 1;
  console.log(`\n"${baseTitle}": ${products.length} variants`);
  products.slice(0, 3).forEach(p => {
    const shortTitle = p.title.length > 55 ? p.title.substring(0, 55) + '...' : p.title;
    console.log(`  - ${shortTitle} (€${p.price})`);
  });
  if (products.length > 3) console.log(`  ... and ${products.length - 3} more`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total published products: ${publishedProducts.length}`);
console.log(`Unique base products: ${productsByBaseTitle.size}`);
console.log(`Products that are duplicates: ${totalDuplicates}`);
console.log(`Unique products (no variants): ${[...productsByBaseTitle.entries()].filter(([_, p]) => p.length === 1).length}`);

const summary = {
  totalPublished: publishedProducts.length,
  uniqueBaseProducts: productsByBaseTitle.size,
  categories: sortedCategories,
  productGroups: [...productsByBaseTitle.entries()].map(([base, products]) => ({
    baseTitle: base,
    count: products.length,
    variants: products.map(p => ({
      title: p.title,
      price: p.price,
      sku: p.sku,
      category: p.category,
      image: p.image,
      vehicleInfo: p.vehicleInfo
    }))
  })).sort((a, b) => b.count - a.count)
};

fs.writeFileSync('scripts/csv_analysis.json', JSON.stringify(summary, null, 2));
console.log('\nAnalysis saved to scripts/csv_analysis.json');
