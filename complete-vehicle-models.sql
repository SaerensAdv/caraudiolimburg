-- COMPLETE VEHICLE MODELS DATASET FOR PRODUCTION
-- Voegt alle populaire auto modellen toe voor Car Audio Limburg

-- Get all vehicle make IDs first (reference for the script)
-- Audi: 5cf12dcd-0f3e-4785-8e7a-9430360b9901 (already confirmed)

-- Clear existing test data first
DELETE FROM vehicle_models;

-- AUDI MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A1', 'a1', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2010, 2025),
('A3', 'a3', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2012, 2025),
('A4', 'a4', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2008, 2025),
('A5', 'a5', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2016, 2025),
('A6', 'a6', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2011, 2025),
('A7', 'a7', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2018, 2025),
('A8', 'a8', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2017, 2025),
('Q2', 'q2', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2016, 2025),
('Q3', 'q3', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2018, 2025),
('Q5', 'q5', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2016, 2025),
('Q7', 'q7', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2015, 2025),
('Q8', 'q8', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2018, 2025),
('TT', 'tt', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2014, 2025),
('e-tron', 'e-tron', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2019, 2025);

-- BMW MODELS  
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('1 Series', '1-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2019, 2025),
('2 Series', '2-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2014, 2025),
('3 Series', '3-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2019, 2025),
('4 Series', '4-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2020, 2025),
('5 Series', '5-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2016, 2025),
('7 Series', '7-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2015, 2025),
('8 Series', '8-series', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2018, 2025),
('X1', 'x1', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2015, 2025),
('X2', 'x2', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2018, 2025),
('X3', 'x3', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2017, 2025),
('X4', 'x4', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2018, 2025),
('X5', 'x5', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2018, 2025),
('X6', 'x6', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2019, 2025),
('X7', 'x7', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2019, 2025),
('iX', 'ix', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2021, 2025),
('i4', 'i4', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2021, 2025);

-- MERCEDES-BENZ MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A-Class', 'a-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2018, 2025),
('B-Class', 'b-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2018, 2025),
('C-Class', 'c-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2021, 2025),
('E-Class', 'e-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2016, 2025),
('S-Class', 's-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2020, 2025),
('CLA', 'cla', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('CLS', 'cls', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2018, 2025),
('GLA', 'gla', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2020, 2025),
('GLB', 'glb', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('GLC', 'glc', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('GLE', 'gle', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('GLS', 'gls', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('G-Class', 'g-class', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2018, 2025),
('EQA', 'eqa', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2021, 2025),
('EQC', 'eqc', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025);

-- VOLKSWAGEN MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Golf', 'golf', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025),
('Polo', 'polo', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2017, 2025),
('Passat', 'passat', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025),
('Tiguan', 'tiguan', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2020, 2025),
('Touareg', 'touareg', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2018, 2025),
('T-Cross', 't-cross', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025),
('T-Roc', 't-roc', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2017, 2025),
('Arteon', 'arteon', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2017, 2025),
('ID.3', 'id3', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2020, 2025),
('ID.4', 'id4', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2021, 2025),
('ID.5', 'id5', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2024, 2025);

-- FORD MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Fiesta', 'fiesta', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2017, 2023),
('Focus', 'focus', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2018, 2025),
('Mondeo', 'mondeo', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2014, 2022),
('Kuga', 'kuga', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2019, 2025),
('EcoSport', 'ecosport', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2017, 2023),
('Puma', 'puma', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2019, 2025),
('Explorer', 'explorer', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2019, 2025),
('Mustang Mach-E', 'mustang-mach-e', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2021, 2025);

-- OPEL MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Corsa', 'corsa', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2019, 2025),
('Astra', 'astra', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2021, 2025),
('Insignia', 'insignia', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2017, 2025),
('Crossland', 'crossland', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2021, 2025),
('Mokka', 'mokka', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2020, 2025),
('Grandland', 'grandland', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2021, 2025),
('Combo', 'combo', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2018, 2025);

-- TOYOTA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Yaris', 'yaris', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2020, 2025),
('Corolla', 'corolla', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2019, 2025),
('Camry', 'camry', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2018, 2025),
('Prius', 'prius', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2016, 2025),
('C-HR', 'c-hr', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2016, 2025),
('RAV4', 'rav4', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2018, 2025),
('Highlander', 'highlander', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2020, 2025),
('bZ4X', 'bz4x', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2022, 2025);

-- RENAULT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Clio', 'clio', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2019, 2025),
('Megane', 'megane', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2020, 2025),
('Captur', 'captur', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2019, 2025),
('Kadjar', 'kadjar', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2018, 2025),
('Koleos', 'koleos', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2017, 2025),
('Talisman', 'talisman', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2015, 2022),
('ZOE', 'zoe', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2019, 2025);

-- PEUGEOT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('208', '208', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2019, 2025),
('308', '308', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2021, 2025),
('508', '508', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2018, 2025),
('2008', '2008', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2019, 2025),
('3008', '3008', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2016, 2025),
('5008', '5008', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2017, 2025),
('e-208', 'e-208', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2019, 2025);

-- DACIA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Sandero', 'sandero', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2020, 2025),
('Logan', 'logan', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2020, 2025),
('Duster', 'duster', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2021, 2025),
('Spring', 'spring', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2021, 2025),
('Jogger', 'jogger', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2021, 2025);

-- FINAL VERIFICATION
SELECT 'DATASET COMPLETE!' as status;
SELECT 
    vm.name as make,
    COUNT(vmod.id) as model_count
FROM vehicle_makes vm
LEFT JOIN vehicle_models vmod ON vm.id = vmod.make_id
GROUP BY vm.id, vm.name
ORDER BY vm.name;

SELECT COUNT(*) as total_models FROM vehicle_models;