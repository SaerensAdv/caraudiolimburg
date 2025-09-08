-- SIMPLE TEST VOOR PRODUCTION DATABASE
-- Test elk onderdeel apart

-- TEST 1: Check of Audi ID bestaat
SELECT 'TEST 1: Audi ID lookup' as test;
SELECT id, name, slug FROM vehicle_makes WHERE slug = 'audi';

-- TEST 2: Test de subquery apart
SELECT 'TEST 2: Subquery test' as test;
SELECT 'Audi ID is: ' || (SELECT id FROM vehicle_makes WHERE slug = 'audi') as audi_id;

-- TEST 3: Manual insert met hard-coded Audi ID (vervang XXX met het echte Audi ID uit TEST 1)
-- SELECT 'TEST 3: Manual insert' as test;
-- INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) 
-- VALUES ('A1 Manual', 'a1-manual-test', 'REPLACE_WITH_AUDI_ID_FROM_TEST1', 2010, 2025);

-- TEST 4: Check table structure
SELECT 'TEST 4: Table structure' as test;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicle_models' 
ORDER BY ordinal_position;