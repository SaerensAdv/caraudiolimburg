-- PRODUCTION DATABASE DATA VOOR CAR AUDIO LIMBURG
-- Copy/paste deze SQL statements in je production database

-- 1. CATEGORIES
INSERT INTO categories (name, slug, description) VALUES 
('Multimedia & Navigatie', 'multimedia-navigatie', 'Android multimedia, CarPlay, navigatiesystemen'),
('Speakers & Subwoofers', 'speakers-subwoofers', 'Luidsprekers, subwoofers, speaker kits'),
('Versterkers & DSP', 'versterkers-dsp', 'Versterkers, DSP processors, geluidprocessors'),
('Installatie & Accessoires', 'installatie-accessoires', 'Installatiebenodigdheden, gereedschap, bekabeling'),
('Cameras & Veiligheid', 'cameras-veiligheid', 'Achteruitrijcameras, dash cams, parkeersensoren'),
('OEM Upgrades', 'oem-upgrades', 'Fabriekssysteem upgrades per automerk'),
('Premium Audio', 'premium-audio', 'High-end audiosystemen en componenten'),
('Offerte Aanvragen', 'offerte-aanvragen', 'Custom installaties en maatwerk')
ON CONFLICT (slug) DO NOTHING;

-- 2. BRANDS  
INSERT INTO brands (name, slug, description) VALUES
('Audison', 'audison', 'Premium Italiaanse audio specialist'),
('Alpine', 'alpine', 'Toonaangevende Japanse autosound fabrikant'),
('Pioneer', 'pioneer', 'Wereldwijde leider in auto-entertainment'),
('Kenwood', 'kenwood', 'Innovatieve audiooplossingen'),
('JL Audio', 'jl-audio', 'Amerikaanse premium audio specialist'),
('Focal', 'focal', 'Franse high-end speaker specialist'),
('Hertz', 'hertz', 'Italiaanse audio-excellentie'),
('STP', 'stp', 'Trillingsdempende materialen specialist'),
('Car Audio Limburg', 'car-audio-limburg', 'Eigen merk kwaliteitsproducten')
ON CONFLICT (slug) DO NOTHING;

-- 3. VEHICLE MAKES
INSERT INTO vehicle_makes (name, slug) VALUES
('Audi', 'audi'),
('BMW', 'bmw'), 
('Mercedes-Benz', 'mercedes-benz'),
('Volkswagen', 'volkswagen'),
('Ford', 'ford'),
('Opel', 'opel'),
('Toyota', 'toyota'),
('Renault', 'renault'),
('Peugeot', 'peugeot'),
('Citroen', 'citroen'),
('Nissan', 'nissan'),
('Mazda', 'mazda'),
('Honda', 'honda'),
('Hyundai', 'hyundai'),
('Kia', 'kia'),
('Skoda', 'skoda'),
('SEAT', 'seat'),
('Volvo', 'volvo'),
('Suzuki', 'suzuki'),
('Dacia', 'dacia')
ON CONFLICT (slug) DO NOTHING;

-- 4. SAMPLE PRODUCTS
-- Get category and brand IDs first, then insert products
WITH category_ids AS (
  SELECT id as multimedia_id FROM categories WHERE slug = 'multimedia-navigatie' LIMIT 1
), brand_ids AS (
  SELECT 
    (SELECT id FROM brands WHERE slug = 'alpine' LIMIT 1) as alpine_id,
    (SELECT id FROM brands WHERE slug = 'audison' LIMIT 1) as audison_id,
    (SELECT id FROM brands WHERE slug = 'pioneer' LIMIT 1) as pioneer_id
)
INSERT INTO products (name, slug, description, price, sku, stock, brand_id, category_id) 
SELECT 
  'Alpine iLX-F309E CarPlay/Android Auto Display',
  'alpine-ilx-f309e-carplay-android-auto',
  'Moderne 9-inch multimedia display van Alpine met draadloze CarPlay en Android Auto ondersteuning.',
  '649.00',
  'ALP-ILX-F309E',
  8,
  brand_ids.alpine_id,
  category_ids.multimedia_id
FROM category_ids, brand_ids
WHERE brand_ids.alpine_id IS NOT NULL AND category_ids.multimedia_id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Add Audison speakers
WITH category_ids AS (
  SELECT id as speakers_id FROM categories WHERE slug = 'speakers-subwoofers' LIMIT 1
), brand_ids AS (
  SELECT id as audison_id FROM brands WHERE slug = 'audison' LIMIT 1
)
INSERT INTO products (name, slug, description, price, sku, stock, brand_id, category_id)
SELECT 
  'Audison AV 3.0 II Mid-range Speakerset',
  'audison-av-3-0-ii-mid-range-speakerset',
  'Premium 3" mid-range luidspreker set van Audison voor high-end audio installaties.',
  '349.00',
  'AUD-AV30-II',
  15,
  brand_ids.audison_id,
  category_ids.speakers_id
FROM category_ids, brand_ids
WHERE brand_ids.audison_id IS NOT NULL AND category_ids.speakers_id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Add Pioneer radio
WITH category_ids AS (
  SELECT id as multimedia_id FROM categories WHERE slug = 'multimedia-navigatie' LIMIT 1
), brand_ids AS (
  SELECT id as pioneer_id FROM brands WHERE slug = 'pioneer' LIMIT 1
)
INSERT INTO products (name, slug, description, price, sku, stock, brand_id, category_id)
SELECT 
  'Pioneer MVH-S320BT Bluetooth Autoradio',
  'pioneer-mvh-s320bt-bluetooth-autoradio',  
  'Betaalbare autoradio van Pioneer met Bluetooth, USB en AUX.',
  '89.00',
  'PIO-MVH-S320BT',
  25,
  brand_ids.pioneer_id,
  category_ids.multimedia_id
FROM category_ids, brand_ids
WHERE brand_ids.pioneer_id IS NOT NULL AND category_ids.multimedia_id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- VERIFICATION QUERIES
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM brands  
UNION ALL
SELECT 'Vehicle Makes', COUNT(*) FROM vehicle_makes
UNION ALL
SELECT 'Products', COUNT(*) FROM products;