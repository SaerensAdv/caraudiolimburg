-- VEHICLE MODELS DATA - EENVOUDIGE VERSIE ZONDER CONFLICT HANDLING
-- Copy/paste deze SQL statements in je production database

-- AUDI MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A1', 'a1-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2010, 2025),
('A3', 'a3-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2012, 2025),
('A4', 'a4-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2015, 2025),
('A5', 'a5-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2016, 2025),
('A6', 'a6-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2018, 2025),
('Q3', 'q3-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2018, 2025),
('Q5', 'q5-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2016, 2025),
('Q7', 'q7-audi', (SELECT id FROM vehicle_makes WHERE slug = 'audi'), 2015, 2025);

-- BMW MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('1 Series', '1-series-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2011, 2025),
('2 Series', '2-series-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2014, 2025),
('3 Series', '3-series-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2012, 2025),
('4 Series', '4-series-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2013, 2025),
('5 Series', '5-series-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2017, 2025),
('X1', 'x1-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2015, 2025),
('X3', 'x3-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2017, 2025),
('X5', 'x5-bmw', (SELECT id FROM vehicle_makes WHERE slug = 'bmw'), 2018, 2025);

-- MERCEDES-BENZ MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A-Class', 'a-class-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2018, 2025),
('B-Class', 'b-class-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('C-Class', 'c-class-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2021, 2025),
('E-Class', 'e-class-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2016, 2025),
('GLA', 'gla-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2020, 2025),
('GLC', 'glc-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025),
('GLE', 'gle-mercedes', (SELECT id FROM vehicle_makes WHERE slug = 'mercedes-benz'), 2019, 2025);

-- VOLKSWAGEN MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Golf', 'golf-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025),
('Polo', 'polo-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2017, 2025),
('Passat', 'passat-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2014, 2025),
('Tiguan', 'tiguan-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2016, 2025),
('T-Cross', 't-cross-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2019, 2025),
('T-Roc', 't-roc-vw', (SELECT id FROM vehicle_makes WHERE slug = 'volkswagen'), 2017, 2025);

-- FORD MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Fiesta', 'fiesta-ford', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2017, 2023),
('Focus', 'focus-ford', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2018, 2025),
('Kuga', 'kuga-ford', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2019, 2025),
('Puma', 'puma-ford', (SELECT id FROM vehicle_makes WHERE slug = 'ford'), 2019, 2025);

-- OPEL MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Corsa', 'corsa-opel', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2019, 2025),
('Astra', 'astra-opel', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2021, 2025),
('Mokka', 'mokka-opel', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2020, 2025),
('Grandland', 'grandland-opel', (SELECT id FROM vehicle_makes WHERE slug = 'opel'), 2017, 2025);

-- TOYOTA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Yaris', 'yaris-toyota', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2020, 2025),
('Corolla', 'corolla-toyota', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2019, 2025),
('C-HR', 'c-hr-toyota', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2016, 2025),
('RAV4', 'rav4-toyota', (SELECT id FROM vehicle_makes WHERE slug = 'toyota'), 2018, 2025);

-- RENAULT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Clio', 'clio-renault', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2019, 2025),
('Megane', 'megane-renault', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2020, 2025),
('Captur', 'captur-renault', (SELECT id FROM vehicle_makes WHERE slug = 'renault'), 2019, 2025);

-- PEUGEOT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('208', '208-peugeot', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2019, 2025),
('308', '308-peugeot', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2021, 2025),
('3008', '3008-peugeot', (SELECT id FROM vehicle_makes WHERE slug = 'peugeot'), 2016, 2025);

-- DACIA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('Sandero', 'sandero-dacia', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2020, 2025),
('Duster', 'duster-dacia', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2017, 2025),
('Spring', 'spring-dacia', (SELECT id FROM vehicle_makes WHERE slug = 'dacia'), 2021, 2025);

-- VERIFICATION: Check how many models were added
SELECT 
    vm.name as make_name,
    COUNT(vmod.id) as model_count
FROM vehicle_makes vm
LEFT JOIN vehicle_models vmod ON vm.id = vmod.make_id
GROUP BY vm.id, vm.name
ORDER BY model_count DESC, vm.name;