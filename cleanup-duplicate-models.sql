-- CLEANUP DUPLICATE VEHICLE MODELS
-- Removes duplicates and keeps only one instance per model per make

-- Step 1: Show current situation
SELECT 'BEFORE CLEANUP:' as status;
SELECT COUNT(*) as total_models_before FROM vehicle_models;

-- Step 2: Remove duplicates using CTE
-- Keep the first instance (oldest created_at) of each model per make
WITH RankedModels AS (
    SELECT 
        id,
        name,
        make_id,
        ROW_NUMBER() OVER (
            PARTITION BY name, make_id 
            ORDER BY created_at ASC, id ASC
        ) as row_num
    FROM vehicle_models
)
DELETE FROM vehicle_models 
WHERE id IN (
    SELECT id 
    FROM RankedModels 
    WHERE row_num > 1
);

-- Step 3: Show results after cleanup
SELECT 'AFTER CLEANUP:' as status;
SELECT COUNT(*) as total_models_after FROM vehicle_models;

-- Step 4: Verify no more duplicates exist
SELECT 'DUPLICATE CHECK:' as status;
SELECT 
    vm.name as make,
    vmod.name as model,
    COUNT(*) as count
FROM vehicle_models vmod 
JOIN vehicle_makes vm ON vmod.make_id = vm.id
GROUP BY vm.name, vmod.name, vmod.make_id
HAVING COUNT(*) > 1
ORDER BY vm.name, vmod.name;

-- Step 5: Show final model count per make
SELECT 'FINAL OVERVIEW:' as status;
SELECT 
    vm.name as make,
    COUNT(vmod.id) as model_count
FROM vehicle_makes vm
LEFT JOIN vehicle_models vmod ON vm.id = vmod.make_id
WHERE vmod.id IS NOT NULL
GROUP BY vm.id, vm.name
ORDER BY COUNT(vmod.id) DESC, vm.name;

-- Step 6: Show some sample models to verify data integrity
SELECT 'SAMPLE DATA:' as status;
SELECT 
    vm.name as make,
    vmod.name as model,
    vmod.start_year,
    vmod.end_year
FROM vehicle_models vmod 
JOIN vehicle_makes vm ON vmod.make_id = vm.id
WHERE vm.name IN ('Audi', 'BMW', 'Volkswagen')
ORDER BY vm.name, vmod.name
LIMIT 15;