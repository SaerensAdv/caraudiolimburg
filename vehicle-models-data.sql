-- VEHICLE MODELS DATA VOOR CAR AUDIO LIMBURG PRODUCTION DATABASE
-- Copy/paste deze SQL statements in je production database

-- Insert vehicle models for all major car brands
-- This script references the vehicle_makes that should already exist from the previous script

-- AUDI MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES 
    ('A1', 'a1', 2010, 2025),
    ('A3', 'a3', 2012, 2025),
    ('A4', 'a4', 2015, 2025),
    ('A5', 'a5', 2016, 2025),
    ('A6', 'a6', 2018, 2025),
    ('Q3', 'q3', 2018, 2025),
    ('Q5', 'q5', 2016, 2025),
    ('Q7', 'q7', 2015, 2025),
    ('TT', 'tt', 2014, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'audi'
ON CONFLICT (slug, make_id) DO NOTHING;

-- BMW MODELS  
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('1 Series', '1-series', 2011, 2025),
    ('2 Series', '2-series', 2014, 2025),
    ('3 Series', '3-series', 2012, 2025),
    ('4 Series', '4-series', 2013, 2025),
    ('5 Series', '5-series', 2017, 2025),
    ('X1', 'x1', 2015, 2025),
    ('X3', 'x3', 2017, 2025),
    ('X5', 'x5', 2018, 2025),
    ('Z4', 'z4', 2018, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'bmw'
ON CONFLICT (slug, make_id) DO NOTHING;

-- MERCEDES-BENZ MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('A-Class', 'a-class', 2018, 2025),
    ('B-Class', 'b-class', 2019, 2025),
    ('C-Class', 'c-class', 2021, 2025),
    ('E-Class', 'e-class', 2016, 2025),
    ('GLA', 'gla', 2020, 2025),
    ('GLC', 'glc', 2019, 2025),
    ('GLE', 'gle', 2019, 2025),
    ('S-Class', 's-class', 2020, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'mercedes-benz'
ON CONFLICT (slug, make_id) DO NOTHING;

-- VOLKSWAGEN MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Golf', 'golf', 2019, 2025),
    ('Polo', 'polo', 2017, 2025),
    ('Passat', 'passat', 2014, 2025),
    ('Tiguan', 'tiguan', 2016, 2025),
    ('T-Cross', 't-cross', 2019, 2025),
    ('T-Roc', 't-roc', 2017, 2025),
    ('Arteon', 'arteon', 2017, 2025),
    ('ID.3', 'id3', 2020, 2025),
    ('ID.4', 'id4', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'volkswagen'
ON CONFLICT (slug, make_id) DO NOTHING;

-- FORD MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Fiesta', 'fiesta', 2017, 2023),
    ('Focus', 'focus', 2018, 2025),
    ('Kuga', 'kuga', 2019, 2025),
    ('Puma', 'puma', 2019, 2025),
    ('Mustang', 'mustang', 2015, 2025),
    ('Explorer', 'explorer', 2019, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'ford'
ON CONFLICT (slug, make_id) DO NOTHING;

-- OPEL MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Corsa', 'corsa', 2019, 2025),
    ('Astra', 'astra', 2021, 2025),
    ('Mokka', 'mokka', 2020, 2025),
    ('Grandland', 'grandland', 2017, 2025),
    ('Insignia', 'insignia', 2017, 2025),
    ('Crossland', 'crossland', 2017, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'opel'
ON CONFLICT (slug, make_id) DO NOTHING;

-- TOYOTA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Yaris', 'yaris', 2020, 2025),
    ('Corolla', 'corolla', 2019, 2025),
    ('C-HR', 'c-hr', 2016, 2025),
    ('RAV4', 'rav4', 2018, 2025),
    ('Camry', 'camry', 2018, 2025),
    ('Highlander', 'highlander', 2019, 2025),
    ('Prius', 'prius', 2016, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'toyota'
ON CONFLICT (slug, make_id) DO NOTHING;

-- RENAULT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Clio', 'clio', 2019, 2025),
    ('Megane', 'megane', 2020, 2025),
    ('Captur', 'captur', 2019, 2025),
    ('Kadjar', 'kadjar', 2015, 2025),
    ('Scenic', 'scenic', 2016, 2025),
    ('Talisman', 'talisman', 2015, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'renault'
ON CONFLICT (slug, make_id) DO NOTHING;

-- PEUGEOT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('208', '208', 2019, 2025),
    ('308', '308', 2021, 2025),
    ('408', '408', 2022, 2025),
    ('2008', '2008', 2019, 2025),
    ('3008', '3008', 2016, 2025),
    ('5008', '5008', 2017, 2025),
    ('508', '508', 2018, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'peugeot'
ON CONFLICT (slug, make_id) DO NOTHING;

-- CITROEN MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('C1', 'c1', 2014, 2024),
    ('C3', 'c3', 2016, 2025),
    ('C4', 'c4', 2020, 2025),
    ('C5 Aircross', 'c5-aircross', 2018, 2025),
    ('Berlingo', 'berlingo', 2018, 2025),
    ('SpaceTourer', 'spacetourer', 2016, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'citroen'
ON CONFLICT (slug, make_id) DO NOTHING;

-- NISSAN MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Micra', 'micra', 2017, 2025),
    ('Juke', 'juke', 2019, 2025),
    ('Qashqai', 'qashqai', 2021, 2025),
    ('X-Trail', 'x-trail', 2022, 2025),
    ('Leaf', 'leaf', 2017, 2025),
    ('Ariya', 'ariya', 2022, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'nissan'
ON CONFLICT (slug, make_id) DO NOTHING;

-- MAZDA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('2', '2', 2019, 2025),
    ('3', '3', 2019, 2025),
    ('6', '6', 2018, 2025),
    ('CX-3', 'cx-3', 2015, 2025),
    ('CX-5', 'cx-5', 2017, 2025),
    ('CX-30', 'cx-30', 2019, 2025),
    ('CX-60', 'cx-60', 2022, 2025),
    ('MX-5', 'mx-5', 2015, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'mazda'
ON CONFLICT (slug, make_id) DO NOTHING;

-- HONDA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Civic', 'civic', 2022, 2025),
    ('Jazz', 'jazz', 2020, 2025),
    ('HR-V', 'hr-v', 2021, 2025),
    ('CR-V', 'cr-v', 2018, 2025),
    ('Accord', 'accord', 2020, 2025),
    ('e:Ny1', 'eny1', 2023, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'honda'
ON CONFLICT (slug, make_id) DO NOTHING;

-- HYUNDAI MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('i10', 'i10', 2019, 2025),
    ('i20', 'i20', 2020, 2025),
    ('i30', 'i30', 2017, 2025),
    ('Kona', 'kona', 2017, 2025),
    ('Tucson', 'tucson', 2020, 2025),
    ('Santa Fe', 'santa-fe', 2018, 2025),
    ('IONIQ 5', 'ioniq-5', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'hyundai'
ON CONFLICT (slug, make_id) DO NOTHING;

-- KIA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Picanto', 'picanto', 2017, 2025),
    ('Rio', 'rio', 2017, 2025),
    ('Ceed', 'ceed', 2018, 2025),
    ('Stonic', 'stonic', 2017, 2025),
    ('Niro', 'niro', 2022, 2025),
    ('Sportage', 'sportage', 2022, 2025),
    ('Sorento', 'sorento', 2020, 2025),
    ('EV6', 'ev6', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'kia'
ON CONFLICT (slug, make_id) DO NOTHING;

-- SKODA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Fabia', 'fabia', 2021, 2025),
    ('Scala', 'scala', 2019, 2025),
    ('Octavia', 'octavia', 2019, 2025),
    ('Kamiq', 'kamiq', 2019, 2025),
    ('Karoq', 'karoq', 2017, 2025),
    ('Kodiaq', 'kodiaq', 2016, 2025),
    ('Superb', 'superb', 2019, 2025),
    ('Enyaq', 'enyaq', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'skoda'
ON CONFLICT (slug, make_id) DO NOTHING;

-- SEAT MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Ibiza', 'ibiza', 2017, 2025),
    ('Leon', 'leon', 2020, 2025),
    ('Arona', 'arona', 2017, 2025),
    ('Ateca', 'ateca', 2016, 2025),
    ('Tarraco', 'tarraco', 2018, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'seat'
ON CONFLICT (slug, make_id) DO NOTHING;

-- VOLVO MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('XC40', 'xc40', 2017, 2025),
    ('XC60', 'xc60', 2017, 2025),
    ('XC90', 'xc90', 2015, 2025),
    ('V60', 'v60', 2018, 2025),
    ('V90', 'v90', 2016, 2025),
    ('S60', 's60', 2019, 2025),
    ('S90', 's90', 2016, 2025),
    ('C40', 'c40', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'volvo'
ON CONFLICT (slug, make_id) DO NOTHING;

-- SUZUKI MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Ignis', 'ignis', 2016, 2025),
    ('Swift', 'swift', 2017, 2025),
    ('Vitara', 'vitara', 2015, 2025),
    ('S-Cross', 's-cross', 2021, 2025),
    ('Jimny', 'jimny', 2018, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'suzuki'
ON CONFLICT (slug, make_id) DO NOTHING;

-- DACIA MODELS
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year)
SELECT model_name, model_slug, vm.id, start_year, end_year
FROM vehicle_makes vm
CROSS JOIN (
  VALUES
    ('Sandero', 'sandero', 2020, 2025),
    ('Duster', 'duster', 2017, 2025),
    ('Spring', 'spring', 2021, 2025),
    ('Logan', 'logan', 2020, 2025),
    ('Jogger', 'jogger', 2021, 2025)
) AS models(model_name, model_slug, start_year, end_year)
WHERE vm.slug = 'dacia'
ON CONFLICT (slug, make_id) DO NOTHING;

-- VERIFICATION QUERY
SELECT 
    vm.name as make_name,
    COUNT(vmod.id) as model_count
FROM vehicle_makes vm
LEFT JOIN vehicle_models vmod ON vm.id = vmod.make_id
WHERE vm.slug IN ('audi', 'bmw', 'mercedes-benz', 'volkswagen', 'ford', 'opel', 'toyota', 'renault', 'peugeot', 'citroen', 'nissan', 'mazda', 'honda', 'hyundai', 'kia', 'skoda', 'seat', 'volvo', 'suzuki', 'dacia')
GROUP BY vm.id, vm.name
ORDER BY vm.name;