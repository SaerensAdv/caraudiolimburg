-- STEP-BY-STEP PRODUCT ADDITION TO PRODUCTION
-- Tests each product individually with error checking

-- Step 1: Check if products already exist
SELECT 'STEP 1: Checking existing products' as step;
SELECT COUNT(*) as existing_count FROM products WHERE slug IN (
    'android-multimedia-ford-fiesta-2009-2011',
    'audison-av-3-0-ii-mid-range-speakerset', 
    'android-multimedia-audi-a3-s3-rs3'
);

-- Step 2: Verify brand and category IDs exist
SELECT 'STEP 2: Verifying foreign keys' as step;
SELECT 'Eigen merk brand exists:' as check, 
       CASE WHEN id IS NOT NULL THEN 'YES' ELSE 'NO' END as result
FROM brands WHERE id = '28a20b66-c209-49ba-8f00-a87d6fc6698f';

SELECT 'Audison brand exists:' as check,
       CASE WHEN id IS NOT NULL THEN 'YES' ELSE 'NO' END as result  
FROM brands WHERE id = 'b910e883-59d7-49cc-9320-d190e4c36206';

SELECT 'Multimedia category exists:' as check,
       CASE WHEN id IS NOT NULL THEN 'YES' ELSE 'NO' END as result
FROM categories WHERE id = 'cb322b2c-5128-46de-9779-7ca66d3edd5e';

SELECT 'Speakers category exists:' as check,
       CASE WHEN id IS NOT NULL THEN 'YES' ELSE 'NO' END as result
FROM categories WHERE id = '368bfefe-5bc0-4855-b7cb-9501ed57fddd';

-- Step 3: Add Product 1 - Ford Fiesta Android Multimedia
SELECT 'STEP 3: Adding Ford Fiesta multimedia' as step;
INSERT INTO products (
    id, name, slug, description, price, stock, 
    brand_id, category_id, is_active, created_at
) VALUES (
    '804761e3-ec81-4d21-84dc-e0eae4ecdb9b',
    'Android Multimedia – Ford Fiësta [2009-2011]',
    'android-multimedia-ford-fiesta-2009-2011',
    'Professionele Android multimedia systeem voor Ford Fiesta 2009-2011.',
    425.00,
    5,
    '28a20b66-c209-49ba-8f00-a87d6fc6698f', -- Eigen merk
    'cb322b2c-5128-46de-9779-7ca66d3edd5e', -- Multimedia
    true,
    NOW()
);

-- Verify Product 1
SELECT 'Product 1 added:' as check, COUNT(*) as count 
FROM products WHERE slug = 'android-multimedia-ford-fiesta-2009-2011';

-- Step 4: Add Product 2 - Audison Speakers  
SELECT 'STEP 4: Adding Audison speakers' as step;
INSERT INTO products (
    id, name, slug, description, price, stock,
    brand_id, category_id, is_active, is_featured, created_at
) VALUES (
    'a586f1b3-58d0-45f5-875c-81553b2b4eff',
    'Audison AV 3.0 II mid-range speakerset',
    'audison-av-3-0-ii-mid-range-speakerset',
    'Premium mid-range speaker set van Audison uit de AV II serie.',
    579.00,
    3,
    'b910e883-59d7-49cc-9320-d190e4c36206', -- Audison
    '368bfefe-5bc0-4855-b7cb-9501ed57fddd', -- Speakers
    true,
    true,
    NOW()
);

-- Verify Product 2
SELECT 'Product 2 added:' as check, COUNT(*) as count 
FROM products WHERE slug = 'audison-av-3-0-ii-mid-range-speakerset';

-- Step 5: Add Product 3 - Audi A3 Android Multimedia
SELECT 'STEP 5: Adding Audi A3 multimedia' as step;
INSERT INTO products (
    id, name, slug, description, price, stock,
    brand_id, category_id, is_active, created_at
) VALUES (
    'a1a2e37a-547b-47d6-ac28-a9267373304d',
    'Android Multimedia – Audi A3',
    'android-multimedia-audi-a3-s3-rs3',
    'Geavanceerd Android multimedia systeem voor Audi A3, S3 en RS3.',
    420.00,
    4,
    '28a20b66-c209-49ba-8f00-a87d6fc6698f', -- Eigen merk
    'cb322b2c-5128-46de-9779-7ca66d3edd5e', -- Multimedia
    true,
    NOW()
);

-- Verify Product 3
SELECT 'Product 3 added:' as check, COUNT(*) as count 
FROM products WHERE slug = 'android-multimedia-audi-a3-s3-rs3';

-- Step 6: Final verification
SELECT 'STEP 6: Final verification' as step;
SELECT id, name, price, stock FROM products WHERE slug IN (
    'android-multimedia-ford-fiesta-2009-2011',
    'audison-av-3-0-ii-mid-range-speakerset', 
    'android-multimedia-audi-a3-s3-rs3'
) ORDER BY price DESC;