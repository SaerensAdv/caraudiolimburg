-- COPY AUTHENTIC CUSTOMER REVIEWS TO PRODUCTION DATABASE
-- All 8 reviews from development database

-- Check if reviews already exist
SELECT 'CHECKING EXISTING REVIEWS IN PRODUCTION:' as status;
SELECT COUNT(*) as existing_reviews FROM reviews;

-- Copy all authentic customer reviews
INSERT INTO reviews (
    id, user_id, customer_name, customer_email, rating, title, content,
    product_id, is_verified, is_approved, is_published, is_featured,
    admin_notes, created_at, updated_at
) VALUES

-- Review 1: Anonieme klant - 5 stars
(
    'rev-40aebcbc-988e-4f87-857f-0101c9a3f0eb',
    NULL,
    'Anonieme klant',
    NULL,
    5,
    'Keurig netjes af',
    'Keurig netjes afgeleverd',
    NULL, -- General review not tied to specific product
    true,
    true,
    true,
    true,
    'Featured authentic customer review',
    '2024-01-15 10:30:00',
    '2024-01-15 10:30:00'
),

-- Review 2: Fred Thijssen - 4 stars  
(
    'rev-5d11559c-bbc8-4a1f-a6e1-00bd0e52964b',
    NULL,
    'Fred Thijssen',
    NULL,
    4,
    'Alles zeer correct ingebouwd',
    'Alles zeer correct ingebouwd, incl stuurbediening.',
    NULL,
    true,
    true,
    true,
    false,
    'Customer satisfied with installation quality',
    '2024-01-20 14:15:00',
    '2024-01-20 14:15:00'
),

-- Review 3: Eddy Baaten - 5 stars (FEATURED)
(
    'rev-fbd3b511-d64b-40b0-889d-53f4ac214f09',
    NULL,
    'Eddy Baaten',
    NULL,
    5,
    'audio upgrade',
    'Vriendelijk ontvangen. Goede uitleg over mogelijkheden. Hoogwaardige kwaliteit audio apparatuur en zeer tevreden over de prestaties die deze levert in mijn auto. Niets negatiefs op aan te merken.. zeer zeker aan te raden als je een audio upgrade wilt in je auto.',
    NULL,
    true,
    true,
    true,
    true,
    'Excellent detailed review highlighting service quality',
    '2024-02-01 16:45:00',
    '2024-02-01 16:45:00'
),

-- Review 4: Paul de Feij - 5 stars
(
    'rev-2ab9eac5-acd1-440f-b13d-e19e99eadd01',
    NULL,
    'Paul de Feij',
    NULL,
    5,
    'Alle was tot in de puntjes geregeld.',
    'Alle was tot in de puntjes geregeld.',
    NULL,
    true,
    true,
    true,
    false,
    'Customer impressed with attention to detail',
    '2024-02-05 11:20:00',
    '2024-02-05 11:20:00'
),

-- Review 5: Sabrina Guyot - 5 stars (English review)
(
    'rev-3f0a0004-3008-494b-ade9-82a731431a29',
    NULL,
    'Sabrina Guyot',
    NULL,
    5,
    'Pleasant welcome and competent staff',
    'Pleasant welcome and competent staff. Quick understanding and perfect execution. I recommend.',
    NULL,
    true,
    true,
    true,
    false,
    'International customer review in English',
    '2024-02-10 09:30:00',
    '2024-02-10 09:30:00'
),

-- Review 6: Mariet Janssen - 5 stars
(
    'rev-7ab63d7c-65f8-4ba4-8c35-547f02e4f46a',
    NULL,
    'Mariet Janssen',
    NULL,
    5,
    'Prima service',
    'Prima service',
    NULL,
    true,
    true,
    true,
    false,
    'Short but positive customer feedback',
    '2024-02-12 13:45:00',
    '2024-02-12 13:45:00'
),

-- Review 7: Rick Hensgens - 5 stars (Specific product mention)
(
    'rev-d18521d6-c5ca-4d14-bb62-116a039a0a78',
    NULL,
    'Rick Hensgens',
    NULL,
    5,
    'Snelle en goede Service',
    'Laatst super fijn geholpen door Dennis, voor het inbouwen van Apple Car play in een Volkswagen Polo.',
    NULL,
    true,
    true,
    true,
    false,
    'Customer mentions staff member Dennis and specific installation',
    '2024-02-15 15:10:00',
    '2024-02-15 15:10:00'
),

-- Review 8: Rob de Jong - 4 stars (FEATURED - Detailed review)
(
    'rev-900737b5-4afa-4d61-b5aa-514252877b80',
    NULL,
    'Rob de Jong',
    NULL,
    4,
    'No nonsense, ze doen wat ze beloven!',
    'No nonsense: ze adviseren duidelijk en doen gewoon wat ze beloven. De producten zijn prima en de inbouw is volgens mij uitstekend. Je ziet niet dat er iets open is geweest! Geen rommel, gewoon ouderwets goede service. Mijn VW Multivan kan er weer tegen.',
    NULL,
    true,
    true,
    true,
    true,
    'Excellent testimonial highlighting trustworthiness and clean installation',
    '2024-02-20 12:00:00',
    '2024-02-20 12:00:00'
);

-- Verification
SELECT 'REVIEWS ADDED TO PRODUCTION:' as status;
SELECT 
    customer_name,
    rating,
    title,
    is_featured
FROM reviews 
ORDER BY created_at DESC;

SELECT 'REVIEW STATISTICS:' as status;
SELECT 
    rating,
    COUNT(*) as count,
    ROUND(AVG(rating), 1) as avg_rating
FROM reviews 
GROUP BY rating
ORDER BY rating DESC;