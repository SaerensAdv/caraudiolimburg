-- COPY MANUALLY ADDED PRODUCTS TO PRODUCTION DATABASE
-- Based on the most recent 3 products from development

-- First check if these products already exist in production
SELECT 'CHECKING EXISTING PRODUCTS IN PRODUCTION:' as status;
SELECT id, name, slug FROM products WHERE slug IN (
    'android-multimedia-ford-fiesta-2009-2011',
    'audison-av-3-0-ii-mid-range-speakerset', 
    'android-multimedia-audi-a3-s3-rs3'
);

-- Copy the 3 manually added products
INSERT INTO products (
    id, name, slug, description, short_description, price, original_price, 
    sku, stock, images, brand_id, category_id, features, specifications, 
    is_active, is_featured, created_at, updated_at
) VALUES 

-- 1. Android Multimedia Ford Fiesta
(
    '804761e3-ec81-4d21-84dc-e0eae4ecdb9b',
    'Android Multimedia – Ford Fiësta [2009-2011]',
    'android-multimedia-ford-fiesta-2009-2011',
    'Professionele Android multimedia systeem speciaal ontwikkeld voor Ford Fiesta modellen van 2009-2011. Voorzien van GPS navigatie, Bluetooth connectiviteit, en ondersteuning voor Apple CarPlay en Android Auto.',
    'Android multimedia systeem voor Ford Fiesta 2009-2011',
    425.00,
    NULL,
    'CAL-FORD-FIESTA-0911',
    5,
    '{}',
    '28a20b66-c209-49ba-8f00-a87d6fc6698f', -- Brand ID (check if exists)
    'cb322b2c-5128-46de-9779-7ca66d3edd5e', -- Head Unit category
    '{
        "10.1 inch HD touchscreen",
        "Android 10.0 besturingssysteem", 
        "Apple CarPlay & Android Auto",
        "GPS navigatie met Europa kaarten",
        "Bluetooth handsfree bellen",
        "USB en AUX input",
        "Achteruitrijcamera aansluiting",
        "Stuurbediening compatibel"
    }',
    '{"screen_size": "10.1 inch", "os": "Android 10.0", "ram": "4GB", "storage": "64GB"}',
    true,
    false,
    NOW(),
    NOW()
),

-- 2. Audison AV 3.0 II Speakers
(
    'a586f1b3-58d0-45f5-875c-81553b2b4eff',
    'Audison AV 3.0 II mid-range speakerset',
    'audison-av-3-0-ii-mid-range-speakerset', 
    'Premium mid-range speaker set van Audison uit de AV II serie. Deze speakers leveren uitzonderlijke geluidskwaliteit met kristalheldere middentonen en zijn perfect voor audiofiele autoliefhebbers.',
    'Premium Audison mid-range speakers met superieure geluidskwaliteit',
    579.00,
    NULL,
    'AUD-AV30-II',
    3,
    '{}',
    'b910e883-59d7-49cc-9320-d190e4c36206', -- Audison brand ID
    '368bfefe-5bc0-4855-b7cb-9501ed57fddd', -- Speakers category
    '{
        "3 inch premium mid-range drivers",
        "Frequency response: 80Hz - 8kHz",
        "Power handling: 80W RMS",
        "Impedance: 4 ohm",
        "Sensitivity: 88 dB",
        "Made in Italy",
        "Professional installation recommended"
    }',
    '{"size": "3 inch", "power_rms": "80W", "impedance": "4 ohm", "frequency": "80Hz-8kHz"}',
    true,
    true,
    NOW(),
    NOW()
),

-- 3. Android Multimedia Audi A3
(
    'a1a2e37a-547b-47d6-ac28-a9267373304d',
    'Android Multimedia – Audi A3',
    'android-multimedia-audi-a3-s3-rs3',
    'Geavanceerd Android multimedia systeem speciaal ontworpen voor Audi A3, S3 en RS3 modellen. Perfecte OEM-look integratie met alle originele functies behouden.',
    'Android multimedia systeem voor Audi A3/S3/RS3', 
    420.00,
    NULL,
    'CAL-AUDI-A3-MM',
    4,
    '{}',
    '28a20b66-c209-49ba-8f00-a87d6fc6698f', -- Brand ID (check if exists)
    'cb322b2c-5128-46de-9779-7ca66d3edd5e', -- Head Unit category
    '{
        "8.8 inch capacitive touchscreen",
        "Android 9.0 besturingssysteem",
        "Apple CarPlay & Android Auto",
        "Ingebouwde GPS navigatie", 
        "Bluetooth A2DP audio streaming",
        "Original steering wheel controls",
        "OEM look & feel",
        "Canbus integratie"
    }',
    '{"screen_size": "8.8 inch", "os": "Android 9.0", "ram": "2GB", "storage": "32GB"}',
    true,
    false,
    NOW(),
    NOW()
);

-- Verification
SELECT 'PRODUCTS ADDED TO PRODUCTION:' as status;
SELECT id, name, price FROM products WHERE slug IN (
    'android-multimedia-ford-fiesta-2009-2011',
    'audison-av-3-0-ii-mid-range-speakerset', 
    'android-multimedia-audi-a3-s3-rs3'
);