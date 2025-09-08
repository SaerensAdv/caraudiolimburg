-- STEP-BY-STEP DEBUG SCRIPT VOOR PRODUCTION DATABASE
-- Voer elke stap afzonderlijk uit om te zien waar het probleem zit

-- STAP 1: Check of vehicle_makes bestaan
SELECT 'Step 1: Vehicle makes check' as step;
SELECT COUNT(*) as total_makes FROM vehicle_makes;
SELECT name, slug FROM vehicle_makes LIMIT 5;

-- STAP 2: Check huidige vehicle_models
SELECT 'Step 2: Current vehicle models check' as step;
SELECT COUNT(*) as total_models FROM vehicle_models;

-- STAP 3: Test 1 eenvoudige insert
SELECT 'Step 3: Testing single insert' as step;
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) 
VALUES ('TEST MODEL', 'test-model-debug', 
        (SELECT id FROM vehicle_makes WHERE slug = 'audi' LIMIT 1), 
        2020, 2025);

-- STAP 4: Verify de test insert
SELECT 'Step 4: Verify test insert' as step;
SELECT COUNT(*) as test_models FROM vehicle_models WHERE slug = 'test-model-debug';

-- STAP 5: Als de test werkt, voeg 3 echte modellen toe
SELECT 'Step 5: Adding real models' as step;
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A1', 'a1-audi-prod', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2010, 2025),
('A3', 'a3-audi-prod', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2012, 2025),
('Golf', 'golf-vw-prod', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025);

-- STAP 6: Final verification
SELECT 'Step 6: Final count' as step;
SELECT COUNT(*) as final_models FROM vehicle_models;
SELECT vm.name as make, vmod.name as model 
FROM vehicle_models vmod 
JOIN vehicle_makes vm ON vmod.make_id = vm.id 
WHERE vmod.slug LIKE '%-prod';