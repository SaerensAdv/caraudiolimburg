const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const productsDir = '/home/runner/workspace/public/products';

const files = fs.readdirSync(productsDir).filter(f => {
  const fullPath = path.join(productsDir, f);
  return fs.statSync(fullPath).isFile() && /\.(webp|jpg|jpeg|png)$/i.test(f);
});

console.log(`Total local image files: ${files.length}`);

const variantOrder = ['studio', 'angle45', 'dramatic', 'lifestyle', 'topdown', 'closeup', 'premium'];
const allVariants = [...variantOrder, 'gemini', 'product', 'exploded', 'incar'];

function extractSlug(filename) {
  for (const v of allVariants) {
    const regex = new RegExp(`^(.+)-${v}[-\\d]`);
    const match = filename.match(regex);
    if (match) return match[1];
  }
  const numMatch = filename.match(/^(.+)-(\d+)\.(webp|jpg|jpeg|png)$/i);
  if (numMatch) return numMatch[1];
  return null;
}

function getVariantIndex(filename) {
  for (let i = 0; i < variantOrder.length; i++) {
    if (filename.includes(`-${variantOrder[i]}-`)) return i;
  }
  return 999;
}

const filesBySlug = {};
for (const f of files) {
  const slug = extractSlug(f);
  if (slug) {
    if (!filesBySlug[slug]) filesBySlug[slug] = [];
    filesBySlug[slug].push(f);
  }
}

for (const slug in filesBySlug) {
  filesBySlug[slug].sort((a, b) => {
    const ia = getVariantIndex(a);
    const ib = getVariantIndex(b);
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });
}

console.log(`Mapped ${Object.keys(filesBySlug).length} slugs from files`);

const productDataRaw = execSync(
  `psql "$DATABASE_URL" -t -A -c "SELECT id || '|||' || slug FROM products WHERE images::text LIKE '%caraudiolimburg.nl%' ORDER BY slug"`,
  { encoding: 'utf8', timeout: 30000 }
).trim();

const products = productDataRaw.split('\n').filter(Boolean).map(line => {
  const parts = line.split('|||');
  return { id: parts[0], slug: parts[1] };
});

console.log(`Found ${products.length} products with WordPress URLs`);

let updated = 0;
let stillWp = 0;
const sqlStatements = [];

for (const product of products) {
  const localFiles = filesBySlug[product.slug];
  if (localFiles && localFiles.length > 0) {
    const imagePaths = localFiles.map(f => `/products/${f}`);
    const pgArray = `ARRAY[${imagePaths.map(p => `'${p.replace(/'/g, "''")}'`).join(',')}]::text[]`;
    sqlStatements.push(`UPDATE products SET images = ${pgArray} WHERE id = '${product.id}';`);
    updated++;
  } else {
    stillWp++;
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Products to update with local images: ${updated}`);
console.log(`Products still with WordPress URLs (no local match): ${stillWp}`);
console.log(`Total SQL statements generated: ${sqlStatements.length}`);

fs.writeFileSync('/tmp/update-images.sql', sqlStatements.join('\n'));
console.log(`SQL written to /tmp/update-images.sql`);

const noMatchProducts = products.filter(p => !filesBySlug[p.slug]);
if (noMatchProducts.length > 0) {
  console.log(`\nProducts without local image matches (${noMatchProducts.length}):`);
  noMatchProducts.forEach(p => console.log(`  - ${p.slug}`));
}
