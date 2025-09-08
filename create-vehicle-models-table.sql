-- CREATE VEHICLE_MODELS TABLE FOR PRODUCTION DATABASE
-- Dit maakt de ontbrekende tabel aan

CREATE TABLE IF NOT EXISTS vehicle_models (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL,
    make_id VARCHAR NOT NULL REFERENCES vehicle_makes(id),
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Verify table creation
SELECT 'Table created successfully' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicle_models' 
ORDER BY ordinal_position;

-- Now add some test data
INSERT INTO vehicle_models (name, slug, make_id, start_year, end_year) VALUES
('A1', 'a1-audi', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2010, 2025),
('A3', 'a3-audi', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2012, 2025),
('A4', 'a4-audi', '5cf12dcd-0f3e-4785-8e7a-9430360b9901', 2008, 2025);

-- Final verification
SELECT COUNT(*) as total_models FROM vehicle_models;
SELECT vm.name as make, vmod.name as model, vmod.start_year, vmod.end_year
FROM vehicle_models vmod 
JOIN vehicle_makes vm ON vmod.make_id = vm.id;