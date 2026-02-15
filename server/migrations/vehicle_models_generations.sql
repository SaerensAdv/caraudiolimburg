-- =============================================
-- Vehicle Models Generation Split - Production
-- =============================================
-- This script splits broad vehicle models into
-- generation-specific models and updates all
-- product compatibility links.
--
-- Safe to run multiple times (idempotent).
-- Uses name-based lookups — no hardcoded UUIDs.
-- =============================================

BEGIN;

-- =============================================
-- PART 1: VOLKSWAGEN
-- =============================================

-- 1a: Remove compatibility records for broad VW models being replaced
DELETE FROM product_vehicle_compatibility
WHERE model_id IN (
  SELECT id FROM vehicle_models
  WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen')
  AND name IN ('Golf', 'Polo', 'Passat', 'Tiguan')
);

-- 1b: Delete duplicate and broad VW models
DELETE FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen')
AND name IN ('Golf', 'Polo', 'Passat', 'Tiguan');

-- 1c: Insert generation-specific VW Golf models
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Golf IV', 'golf-iv', 1997, 2003
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Golf IV');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Golf V', 'golf-v', 2003, 2008
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Golf V');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Golf VI', 'golf-vi', 2008, 2012
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Golf VI');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Golf 7', 'golf-7', 2012, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Golf 7');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Golf 8', 'golf-8', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Golf 8');

-- 1d: Insert generation-specific VW Polo models
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Polo 9N', 'polo-9n', 2001, 2009
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Polo 9N');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Polo 6R/6C', 'polo-6r-6c', 2009, 2017
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Polo 6R/6C');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Polo AW', 'polo-aw', 2017, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Polo AW');

-- 1e: Insert generation-specific VW Passat models
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Passat B5', 'passat-b5', 2000, 2005
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Passat B5');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Passat B6', 'passat-b6', 2005, 2010
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Passat B6');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Passat B7', 'passat-b7', 2010, 2014
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Passat B7');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Passat B8', 'passat-b8', 2014, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Passat B8');

-- 1f: Insert generation-specific VW Tiguan models
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Tiguan I', 'tiguan-i', 2007, 2016
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Tiguan I');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen'), 'Tiguan II', 'tiguan-ii', 2016, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen') AND name = 'Tiguan II');

-- 1g: Re-create VW Golf speakerset compatibility (Golf IV, V, VI)
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, vmod.start_year, vmod.end_year
FROM products p
CROSS JOIN vehicle_makes vm
CROSS JOIN vehicle_models vmod
WHERE p.name LIKE '%Golf IV, V en VI%Speakerset%'
AND vm.name = 'Volkswagen'
AND vmod.name IN ('Golf IV', 'Golf V', 'Golf VI')
AND vmod.make_id = vm.id
AND NOT EXISTS (
  SELECT 1 FROM product_vehicle_compatibility pvc
  WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id
);


-- =============================================
-- PART 2: BMW
-- =============================================

-- 2a: Delete compatibility records for old broad BMW models
DELETE FROM product_vehicle_compatibility
WHERE model_id IN (
  SELECT id FROM vehicle_models
  WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW')
  AND name IN ('1 Serie', '2 Serie', '3 Serie', '4 Serie', '5 Serie', '6 Serie', '7 Serie', 'M3', 'X1', 'X3', 'X4', 'X5', 'X6', 'Z4')
);

-- 2b: Delete old broad BMW models
DELETE FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW')
AND name IN ('1 Serie', '2 Serie', '3 Serie', '4 Serie', '5 Serie', '6 Serie', '7 Serie', 'M3', 'X1', 'X3', 'X4', 'X5', 'X6', 'Z4');

-- 2c: Insert BMW generation models (1-Serie)
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '1-Serie E87', '1-serie-e87', 2004, 2011
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '1-Serie E87');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '1-Serie F20', '1-serie-f20', 2011, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '1-Serie F20');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '1-Serie F40', '1-serie-f40', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '1-Serie F40');

-- 2-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '2-Serie F22', '2-serie-f22', 2014, 2021
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '2-Serie F22');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '2-Serie F44', '2-serie-f44', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '2-Serie F44');

-- 3-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '3-Serie E46', '3-serie-e46', 1998, 2005
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '3-Serie E46');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '3-Serie E90', '3-serie-e90', 2005, 2012
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '3-Serie E90');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '3-Serie F30', '3-serie-f30', 2012, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '3-Serie F30');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '3-Serie G20', '3-serie-g20', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '3-Serie G20');

-- 4-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '4-Serie F32', '4-serie-f32', 2013, 2020
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '4-Serie F32');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '4-Serie G22', '4-serie-g22', 2020, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '4-Serie G22');

-- 5-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '5-Serie E39', '5-serie-e39', 1997, 2003
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '5-Serie E39');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '5-Serie E60', '5-serie-e60', 2003, 2010
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '5-Serie E60');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '5-Serie F10', '5-serie-f10', 2010, 2017
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '5-Serie F10');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '5-Serie G30', '5-serie-g30', 2017, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '5-Serie G30');

-- 6-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '6-Serie E63', '6-serie-e63', 2003, 2010
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '6-Serie E63');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '6-Serie F06/F12', '6-serie-f06-f12', 2011, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '6-Serie F06/F12');

-- 7-Serie
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '7-Serie E65', '7-serie-e65', 2001, 2008
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '7-Serie E65');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '7-Serie F01', '7-serie-f01', 2008, 2015
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '7-Serie F01');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), '7-Serie G11', '7-serie-g11', 2015, 2022
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = '7-Serie G11');

-- M3
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'M3 E46', 'm3-e46', 2000, 2006
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'M3 E46');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'M3 E90', 'm3-e90', 2007, 2013
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'M3 E90');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'M3 F80', 'm3-f80', 2014, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'M3 F80');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'M3 G80', 'm3-g80', 2020, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'M3 G80');

-- X1
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X1 E84', 'x1-e84', 2009, 2015
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X1 E84');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X1 F48', 'x1-f48', 2015, 2022
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X1 F48');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X1 U11', 'x1-u11', 2022, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X1 U11');

-- X3
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X3 E83', 'x3-e83', 2003, 2010
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X3 E83');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X3 F25', 'x3-f25', 2010, 2017
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X3 F25');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X3 G01', 'x3-g01', 2017, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X3 G01');

-- X4
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X4 F26', 'x4-f26', 2014, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X4 F26');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X4 G02', 'x4-g02', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X4 G02');

-- X5
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X5 E53', 'x5-e53', 1999, 2006
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X5 E53');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X5 E70', 'x5-e70', 2006, 2013
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X5 E70');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X5 F15', 'x5-f15', 2013, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X5 F15');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X5 G05', 'x5-g05', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X5 G05');

-- X6
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X6 E71', 'x6-e71', 2007, 2014
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X6 E71');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X6 F16', 'x6-f16', 2014, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X6 F16');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'X6 G06', 'x6-g06', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'X6 G06');

-- Z4
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'Z4 E85', 'z4-e85', 2002, 2008
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'Z4 E85');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'Z4 E89', 'z4-e89', 2009, 2016
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'Z4 E89');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'BMW'), 'Z4 G29', 'z4-g29', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW') AND name = 'Z4 G29');

-- 2d: Re-create BMW product compatibility records
-- Each INSERT checks for existing records to ensure idempotency

-- BMW 1-Serie E87 Android Navigatie → 1-Serie E87
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2004, 2011
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 1-Serie E87 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '1-Serie E87' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 1-Serie F20 Android Navigatie → 1-Serie F20
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2011, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 1-Serie F20 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '1-Serie F20' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 2-Serie Android Navigatie → 2-Serie F22
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2014, 2021
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 2-Serie Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '2-Serie F22' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Alpine iLX-705E46 → 3-Serie E46 (NULL years)
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, NULL, NULL
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Alpine iLX-705E46'
AND vm.name = 'BMW' AND vmod.name = '3-Serie E46' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 3-Serie E90 Android Navigatie → 3-Serie E90
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2005, 2012
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 3-Serie E90 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '3-Serie E90' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 3/4-Serie F30 Android Navigatie → 3-Serie F30
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 3/4-Serie F30 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '3-Serie F30' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 3/4-Serie EVO Android Navigatie → 3-Serie G20
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 3/4-Serie EVO Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '3-Serie G20' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 3/4-Serie F30 Android Navigatie → 4-Serie F32
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 3/4-Serie F30 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '4-Serie F32' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 3/4-Serie EVO Android Navigatie → 4-Serie G22
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 3/4-Serie EVO Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '4-Serie G22' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 5-Serie E60 Android Navigatie → 5-Serie E60
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2003, 2010
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 5-Serie E60 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '5-Serie E60' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 5-Serie F07 GT Android Navigatie → 5-Serie F10
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2017
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 5-Serie F07 GT Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '5-Serie F10' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 5-Serie F10 Android Navigatie → 5-Serie F10
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2017
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 5-Serie F10 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '5-Serie F10' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 5-Serie G30 Android Navigatie → 5-Serie G30
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2023
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 5-Serie G30 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '5-Serie G30' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 6-Serie Android Navigatie → 6-Serie F06/F12
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2011, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 6-Serie Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '6-Serie F06/F12' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 7-Serie E65 Android Navigatie → 7-Serie E65
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2001, 2008
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 7-Serie E65 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '7-Serie E65' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW E65 CDC Simulate Optical Fiber Box → 7-Serie E65
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2001, 2008
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW E65 CDC Simulate Optical Fiber Box'
AND vm.name = 'BMW' AND vmod.name = '7-Serie E65' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 7-Serie F01 Android Navigatie → 7-Serie F01
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2008, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 7-Serie F01 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '7-Serie F01' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW 7-Serie G11 Android Navigatie → 7-Serie G11
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2022
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW 7-Serie G11 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = '7-Serie G11' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW X1 Android Navigatie → X1 E84
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW X1 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'X1 E84' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW X3/X4 Android Navigatie → X3 F25
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2017
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW X3/X4 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'X3 F25' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW X3/X4 Android Navigatie → X4 F26
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2014, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW X3/X4 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'X4 F26' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW X5/X6 Android Navigatie → X5 E70
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2007, 2014
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW X5/X6 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'X5 E70' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW X5/X6 Android Navigatie → X6 E71
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2007, 2014
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW X5/X6 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'X6 E71' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- BMW Z4 Android Navigatie → Z4 E89
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2023
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'BMW Z4 Android Navigatie'
AND vm.name = 'BMW' AND vmod.name = 'Z4 E89' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- iDrive Knop voor BMW Z4 E89 → Z4 E89
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'iDrive Knop voor BMW Z4 E89'
AND vm.name = 'BMW' AND vmod.name = 'Z4 E89' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);


-- =============================================
-- PART 3: AUDI
-- =============================================

-- 3a: Delete compatibility records for old broad Audi models
DELETE FROM product_vehicle_compatibility
WHERE model_id IN (
  SELECT id FROM vehicle_models
  WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi')
  AND name IN ('A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'Q3', 'Q5', 'Q7', 'TT')
);

-- 3b: Delete old broad Audi models
DELETE FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi')
AND name IN ('A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'Q3', 'Q5', 'Q7', 'TT');

-- 3c: Insert Audi generation models
-- A1
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A1 8X', 'a1-8x', 2010, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A1 8X');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A1 GB', 'a1-gb', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A1 GB');

-- A3
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A3 8L', 'a3-8l', 1996, 2003
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A3 8L');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A3 8P', 'a3-8p', 2003, 2012
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A3 8P');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A3 8V', 'a3-8v', 2012, 2020
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A3 8V');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A3 8Y', 'a3-8y', 2020, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A3 8Y');

-- A4
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A4 B5', 'a4-b5', 1994, 2001
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A4 B5');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A4 B6', 'a4-b6', 2001, 2005
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A4 B6');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A4 B7', 'a4-b7', 2005, 2008
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A4 B7');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A4 B8', 'a4-b8', 2008, 2015
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A4 B8');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A4 B9', 'a4-b9', 2015, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A4 B9');

-- A5
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A5 8T', 'a5-8t', 2007, 2016
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A5 8T');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A5 F5', 'a5-f5', 2016, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A5 F5');

-- A6
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A6 C5', 'a6-c5', 1997, 2004
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A6 C5');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A6 C6', 'a6-c6', 2004, 2011
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A6 C6');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A6 C7', 'a6-c7', 2011, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A6 C7');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A6 C8', 'a6-c8', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A6 C8');

-- A7
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A7 4G', 'a7-4g', 2010, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A7 4G');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'A7 4K', 'a7-4k', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'A7 4K');

-- Q3
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q3 8U', 'q3-8u', 2011, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q3 8U');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q3 F3', 'q3-f3', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q3 F3');

-- Q5
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q5 8R', 'q5-8r', 2008, 2017
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q5 8R');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q5 FY', 'q5-fy', 2017, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q5 FY');

-- Q7
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q7 4L', 'q7-4l', 2006, 2015
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q7 4L');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'Q7 4M', 'q7-4m', 2015, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'Q7 4M');

-- TT
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'TT 8N', 'tt-8n', 1998, 2006
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'TT 8N');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'TT 8J', 'tt-8j', 2006, 2014
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'TT 8J');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Audi'), 'TT 8S', 'tt-8s', 2014, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi') AND name = 'TT 8S');

-- 3d: Re-create Audi product compatibility records

-- Audi A1 Android Navigatie (MMI 3G+) → A1 8X
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A1 Android Navigatie (MMI 3G+)'
AND vm.name = 'Audi' AND vmod.name = 'A1 8X' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A1 Android Navigatie (RMC) → A1 8X
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A1 Android Navigatie (RMC)'
AND vm.name = 'Audi' AND vmod.name = 'A1 8X' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A3 Android Navigatie (MIB) → A3 8V
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2014, 2020
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A3 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'A3 8V' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (MMI 3G) → A4 B8
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (MMI 3G)'
AND vm.name = 'Audi' AND vmod.name = 'A4 B8' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (non-MMI) → A4 B8
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (non-MMI)'
AND vm.name = 'Audi' AND vmod.name = 'A4 B8' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (MIB) → A4 B9
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2020
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'A4 B9' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (MMI 3G) → A5 8T
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (MMI 3G)'
AND vm.name = 'Audi' AND vmod.name = 'A5 8T' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (non-MMI) → A5 8T
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2009, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (non-MMI)'
AND vm.name = 'Audi' AND vmod.name = 'A5 8T' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A4/A5 Android Navigatie (MIB) → A5 F5
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2020
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A4/A5 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'A5 F5' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6 Android Navigatie (MMI 2G) → A6 C6
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2005, 2009
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6 Android Navigatie (MMI 2G)'
AND vm.name = 'Audi' AND vmod.name = 'A6 C6' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6 Android Navigatie (MMI 3G) → A6 C6
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2011
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6 Android Navigatie (MMI 3G)'
AND vm.name = 'Audi' AND vmod.name = 'A6 C6' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (MIB) → A6 C7
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6L/A7 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'A6 C7' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (MMI 3G+) → A6 C7
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6L/A7 Android Navigatie (MMI 3G+)'
AND vm.name = 'Audi' AND vmod.name = 'A6 C7' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (RMC 6.5") → A6 C7
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name LIKE 'Audi A6L/A7 Android Navigatie (RMC 6.5%'
AND vm.name = 'Audi' AND vmod.name = 'A6 C7' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (MIB) → A7 4G
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6L/A7 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'A7 4G' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (MMI 3G+) → A7 4G
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi A6L/A7 Android Navigatie (MMI 3G+)'
AND vm.name = 'Audi' AND vmod.name = 'A7 4G' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi A6L/A7 Android Navigatie (RMC 6.5") → A7 4G
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name LIKE 'Audi A6L/A7 Android Navigatie (RMC 6.5%'
AND vm.name = 'Audi' AND vmod.name = 'A7 4G' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q3 Android Navigatie (MMI 3G+) → Q3 8U
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q3 Android Navigatie (MMI 3G+)'
AND vm.name = 'Audi' AND vmod.name = 'Q3 8U' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q3 Android Navigatie (RMC) → Q3 8U
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q3 Android Navigatie (RMC)'
AND vm.name = 'Audi' AND vmod.name = 'Q3 8U' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q5 Android Navigatie (MMI 3G) → Q5 8R
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q5 Android Navigatie (MMI 3G)'
AND vm.name = 'Audi' AND vmod.name = 'Q5 8R' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q5 Android Navigatie (non-MMI) → Q5 8R
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q5 Android Navigatie (non-MMI)'
AND vm.name = 'Audi' AND vmod.name = 'Q5 8R' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q5 Android Navigatie (MIB) → Q5 FY
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2018, 2020
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q5 Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'Q5 FY' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q7 Android Navigatie (MMI 2G) → Q7 4L
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2006, 2009
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q7 Android Navigatie (MMI 2G)'
AND vm.name = 'Audi' AND vmod.name = 'Q7 4L' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi Q7 Android Navigatie (MMI 3G) → Q7 4L
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi Q7 Android Navigatie (MMI 3G)'
AND vm.name = 'Audi' AND vmod.name = 'Q7 4L' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi TT Android Navigatie (MIB) → TT 8J (as per dev DB)
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2014, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi TT Android Navigatie (MIB)'
AND vm.name = 'Audi' AND vmod.name = 'TT 8J' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Audi TT Android Navigatie (RNS-E) → TT 8J
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2006, 2014
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Audi TT Android Navigatie (RNS-E)'
AND vm.name = 'Audi' AND vmod.name = 'TT 8J' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);


-- =============================================
-- PART 4: MERCEDES-BENZ
-- =============================================

-- 4a: Delete compatibility records for old broad Mercedes models
DELETE FROM product_vehicle_compatibility
WHERE model_id IN (
  SELECT id FROM vehicle_models
  WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz')
  AND name IN ('A-Klasse', 'C-Klasse', 'E-Klasse', 'CLA-Klasse', 'GLA-Klasse', 'GLC-Klasse', 'GLE-Klasse')
);

-- 4b: Delete old broad Mercedes models (only the ones being replaced with generations)
DELETE FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz')
AND name IN ('A-Klasse', 'C-Klasse', 'E-Klasse', 'CLA-Klasse', 'GLA-Klasse', 'GLC-Klasse', 'GLE-Klasse');

-- 4c: Insert Mercedes generation models
-- A-Klasse
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'A-Klasse W176', 'a-klasse-w176', 2012, 2018
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'A-Klasse W176');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'A-Klasse W177', 'a-klasse-w177', 2018, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'A-Klasse W177');

-- C-Klasse
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'C-Klasse W204', 'c-klasse-w204', 2007, 2014
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'C-Klasse W204');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'C-Klasse W205', 'c-klasse-w205', 2014, 2021
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'C-Klasse W205');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'C-Klasse W206', 'c-klasse-w206', 2021, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'C-Klasse W206');

-- E-Klasse
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'E-Klasse W211', 'e-klasse-w211', 2002, 2009
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'E-Klasse W211');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'E-Klasse W212', 'e-klasse-w212', 2009, 2016
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'E-Klasse W212');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'E-Klasse W213', 'e-klasse-w213', 2016, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'E-Klasse W213');

-- CLA
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'CLA C117', 'cla-c117', 2013, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'CLA C117');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'CLA C118', 'cla-c118', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'CLA C118');

-- GLA
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLA X156', 'gla-x156', 2013, 2020
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLA X156');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLA H247', 'gla-h247', 2020, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLA H247');

-- GLB
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLB X247', 'glb-x247', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLB X247');

-- GLC
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLC X253', 'glc-x253', 2015, 2022
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLC X253');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLC X254', 'glc-x254', 2022, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLC X254');

-- GLE
INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLE W166', 'gle-w166', 2015, 2019
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLE W166');

INSERT INTO vehicle_models (id, make_id, name, slug, start_year, end_year)
SELECT gen_random_uuid(), (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz'), 'GLE W167', 'gle-w167', 2019, NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicle_models WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLE W167');

-- 4d: Update start_year/end_year on existing Mercedes models that may be missing them
UPDATE vehicle_models SET start_year = 2005, end_year = 2018
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'B-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 1999, end_year = 2014
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'CL-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 2004, end_year = 2010
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'CLS-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 1979
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'G-Klasse' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2006, end_year = 2012
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GL-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 2008, end_year = 2015
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLK-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 2013
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'GLS-Klasse' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 1997, end_year = 2011
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'ML-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 1998
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'S-Klasse' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2001
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'SL-Klasse' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2016, end_year = 2020
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'SLC-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 1996, end_year = 2011
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'SLK-Klasse' AND (start_year IS NULL OR end_year IS NULL);

UPDATE vehicle_models SET start_year = 2006
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'Sprinter' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2003
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'V-Klasse' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2003
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'Vito' AND start_year IS NULL;

UPDATE vehicle_models SET start_year = 2017, end_year = 2020
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz') AND name = 'X-Klasse' AND (start_year IS NULL OR end_year IS NULL);

-- 4e: Re-create Mercedes product compatibility records (using actual product names from dev DB)

-- Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5) → A-Klasse W176
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'A-Klasse W176' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0) → A-Klasse W176
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'A-Klasse W176' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5) → CLA C117
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'CLA C117' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0) → CLA C117
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'CLA C117' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0) → G-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'G-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5) → GLA X156
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA-Klasse Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLA X156' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0) → GLA X156
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz A/GLA/CLA/G-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLA X156' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz B-Klasse W246 Android Navigatie (NTG 4.5) → B-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2011, 2014
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz B-Klasse W246 Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'B-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz B-Klasse W246 Android Navigatie (NTG 5.0) → B-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz B-Klasse W246 Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'B-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C-Klasse W204 Android Navigatie (NTG 4.0) → C-Klasse W204
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2008, 2010
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C-Klasse W204 Android Navigatie (NTG 4.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'C-Klasse W204' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C-Klasse W204 Android Navigatie (NTG 4.5) → C-Klasse W204
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2011, 2014
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C-Klasse W204 Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'C-Klasse W204' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0) → C-Klasse W205
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'C-Klasse W205' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0) → GLC X253
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLC X253' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0) → V-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2018
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'V-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0) → X-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2017, 2020
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz C/GLC/V/X-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'X-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz CLS-Klasse W218 Android Navigatie (NTG 4.5) → CLS-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2013
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz CLS-Klasse W218 Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'CLS-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz CLS-Klasse W218 Android Navigatie (NTG 5.0) → CLS-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2014, 2017
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz CLS-Klasse W218 Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'CLS-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 4.0) → E-Klasse W212
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2010, 2012
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 4.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'E-Klasse W212' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 4.5) → E-Klasse W212
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'E-Klasse W212' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 5.0) → E-Klasse W212
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2016
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz E-Klasse W212 Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'E-Klasse W212' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz GLE/GLS-Klasse Android Navigatie (NTG 5.0) → GLE W166
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz GLE/GLS-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLE W166' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz GLE/GLS-Klasse Android Navigatie (NTG 5.0) → GLS-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2015, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz GLE/GLS-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLS-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz GLK-Klasse X204 Android Navigatie (NTG 4.0) → GLK-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2008, 2012
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz GLK-Klasse X204 Android Navigatie (NTG 4.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLK-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz GLK-Klasse X204 Android Navigatie (NTG 4.5) → GLK-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz GLK-Klasse X204 Android Navigatie (NTG 4.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GLK-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz ML/GL-Klasse Android Navigatie (NTG 4.5/4.7) → GL-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz ML/GL-Klasse Android Navigatie (NTG 4.5/4.7)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'GL-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz ML/GL-Klasse Android Navigatie (NTG 4.5/4.7) → ML-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2012, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz ML/GL-Klasse Android Navigatie (NTG 4.5/4.7)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'ML-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz S-Klasse W221/CL W216 Android Navigatie (NTG 3.0/3.5) → CL-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2006, 2013
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz S-Klasse W221/CL W216 Android Navigatie (NTG 3.0/3.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'CL-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz S-Klasse W221/CL W216 Android Navigatie (NTG 3.0/3.5) → S-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2006, 2013
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz S-Klasse W221/CL W216 Android Navigatie (NTG 3.0/3.5)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'S-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz SL/SLC-Klasse Android Navigatie (NTG 5.0) → SL-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz SL/SLC-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'SL-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz SL/SLC-Klasse Android Navigatie (NTG 5.0) → SLC-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2016, 2019
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz SL/SLC-Klasse Android Navigatie (NTG 5.0)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'SLC-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz SL/SLK-Klasse Android Navigatie (NTG 4.5/4.7) → SL-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz SL/SLK-Klasse Android Navigatie (NTG 4.5/4.7)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'SL-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes-Benz SL/SLK-Klasse Android Navigatie (NTG 4.5/4.7) → SLK-Klasse
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, 2013, 2015
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Mercedes-Benz SL/SLK-Klasse Android Navigatie (NTG 4.5/4.7)'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'SLK-Klasse' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id);

-- Mercedes Sprinter products
-- 3e Remlicht camera MB Sprinter en VW Crafter → Sprinter (NULL years)
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, NULL, NULL
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name LIKE '3e Remlicht camera MB Sprinter%'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'Sprinter' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id AND pvc.make_id = vm.id);

-- Pioneer SPH-EVO-107DAB-C-S → Sprinter
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, NULL, NULL
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Pioneer SPH-EVO-107DAB-C-S'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'Sprinter' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id AND pvc.make_id = vm.id);

-- Pioneer SPH-EVO-107DAB-S → Sprinter
INSERT INTO product_vehicle_compatibility (id, product_id, make_id, model_id, year_from, year_to)
SELECT gen_random_uuid(), p.id, vm.id, vmod.id, NULL, NULL
FROM products p, vehicle_makes vm, vehicle_models vmod
WHERE p.name = 'Pioneer SPH-EVO-107DAB-S'
AND vm.name = 'Mercedes-Benz' AND vmod.name = 'Sprinter' AND vmod.make_id = vm.id
AND NOT EXISTS (SELECT 1 FROM product_vehicle_compatibility pvc WHERE pvc.product_id = p.id AND pvc.model_id = vmod.id AND pvc.make_id = vm.id);


-- =============================================
-- PART 5: VERIFICATION QUERIES
-- =============================================

-- Verify VW generation models
SELECT 'VW Models' as check_type, count(*) as count
FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Volkswagen')
AND name LIKE 'Golf%' OR name LIKE 'Polo%' OR name LIKE 'Passat%' OR name LIKE 'Tiguan%';

-- Verify BMW generation models
SELECT 'BMW Models' as check_type, count(*) as count
FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'BMW');

-- Verify Audi generation models
SELECT 'Audi Models' as check_type, count(*) as count
FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Audi');

-- Verify Mercedes generation models
SELECT 'Mercedes Models' as check_type, count(*) as count
FROM vehicle_models
WHERE make_id = (SELECT id FROM vehicle_makes WHERE name = 'Mercedes-Benz');

-- Verify no broad models remain
SELECT 'Remaining broad models (should be 0)' as check_type, count(*) as count
FROM vehicle_models
WHERE name IN ('Golf', 'Polo', 'Passat', 'Tiguan', '1 Serie', '2 Serie', '3 Serie', '4 Serie', '5 Serie', '6 Serie', '7 Serie', 'M3', 'X1', 'X3', 'X4', 'X5', 'X6', 'Z4', 'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'Q3', 'Q5', 'Q7', 'TT', 'A-Klasse', 'C-Klasse', 'E-Klasse', 'CLA-Klasse', 'GLA-Klasse', 'GLC-Klasse', 'GLE-Klasse');

-- Verify all generation models have start_year set
SELECT 'Models missing start_year (should be 0)' as check_type, count(*) as count
FROM vehicle_models
WHERE make_id IN (SELECT id FROM vehicle_makes WHERE name IN ('BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz'))
AND start_year IS NULL;

-- Verify product compatibility counts per brand
SELECT vmk.name as make, count(*) as compat_count
FROM product_vehicle_compatibility pvc
JOIN vehicle_makes vmk ON pvc.make_id = vmk.id
WHERE vmk.name IN ('BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz')
GROUP BY vmk.name
ORDER BY vmk.name;

-- Show all generation models with their compatibility count
SELECT vmk.name as make, vm.name as model, vm.start_year, vm.end_year,
  (SELECT count(*) FROM product_vehicle_compatibility pvc WHERE pvc.model_id = vm.id) as product_count
FROM vehicle_models vm
JOIN vehicle_makes vmk ON vm.make_id = vmk.id
WHERE vmk.name IN ('BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz')
ORDER BY vmk.name, vm.name;

COMMIT;
