-- Seed maintenance templates
-- Insert 19 common motorcycle maintenance tasks

INSERT INTO moto_mate.maintenance_templates (id, name, category, description, default_interval_mileage, default_interval_days, is_special, is_public, created_at) VALUES
-- Engine maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Oil Change', 'ENGINE', 'Regular engine oil change', 3000, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Spark Plug Replacement', 'ENGINE', 'Replace spark plugs', 12000, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Air Filter Cleaning', 'ENGINE', 'Clean or replace air filter', 6000, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Valve Clearance Check', 'ENGINE', 'Check and adjust valve clearance', 16000, NULL, FALSE, TRUE, NOW()),

-- Chain maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Chain Lube', 'CHAIN', 'Lubricate the chain', 500, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Chain Adjustment', 'CHAIN', 'Adjust chain tension', 1000, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Chain/Sprocket Replacement', 'CHAIN', 'Replace chain and sprockets', 30000, NULL, FALSE, TRUE, NOW()),

-- Brake maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Brake Pad Inspection', 'BRAKES', 'Inspect brake pad thickness', 5000, NULL, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Brake Fluid Flush', 'BRAKES', 'Flush and replace brake fluid', NULL, 730, FALSE, TRUE, NOW()),

-- Tire maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Tire Pressure Check', 'TIRES', 'Check and adjust tire pressure', NULL, 14, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Tire Replacement', 'TIRES', 'Replace worn tires', 15000, NULL, FALSE, TRUE, NOW()),

-- Electrical maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Battery Check', 'ELECTRICAL', 'Check battery health and charge', NULL, 90, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567813', 'Lighting Check', 'ELECTRICAL', 'Check all lights and signals', NULL, 30, FALSE, TRUE, NOW()),

-- Cooling maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567814', 'Coolant Check', 'COOLING', 'Check coolant level and condition', NULL, 180, FALSE, TRUE, NOW()),

-- General maintenance
('a1b2c3d4-e5f6-7890-abcd-ef1234567815', 'Cable Lubrication', 'GENERAL', 'Lubricate control cables', NULL, 90, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567816', 'Fork Oil Change', 'GENERAL', 'Change fork oil and seals', NULL, 730, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567817', 'Clutch Adjustment', 'GENERAL', 'Adjust clutch free play', NULL, 90, FALSE, TRUE, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567818', 'Throttle Cable Adjustment', 'GENERAL', 'Adjust throttle cable free play', NULL, 90, FALSE, TRUE, NOW()),

-- Regulatory
('a1b2c3d4-e5f6-7890-abcd-ef1234567819', 'LTO Registration', 'REGULATORY', 'Annual LTO registration renewal', NULL, 365, TRUE, TRUE, NOW());
