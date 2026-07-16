-- V7: Replace seed maintenance templates with scooter-focused list
-- Replaces V2 data with intervals aligned to common scooter maintenance

-- Must delete dependent rows first to avoid FK violations (seed data only, no user data)
DELETE FROM moto_mate.notification_log;
DELETE FROM moto_mate.service_logs;
DELETE FROM moto_mate.maintenance_schedules;
DELETE FROM moto_mate.maintenance_templates;

INSERT INTO moto_mate.maintenance_templates (id, name, category, description, default_interval_mileage, default_interval_days, icon, is_special, is_public, is_system, created_at) VALUES
-- Engine
('b1c2d3e4-f5a6-7890-bcde-f12345678001', 'Engine Oil Change', 'ENGINE', 'Replace engine oil and filter', 1700, NULL, '🛢️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678002', 'CVT Cleaning', 'GENERAL', 'Clean CVT housing, belt, and pulleys', 5000, NULL, '⚙️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678003', 'Gear Oil Change', 'GENERAL', 'Replace final drive gear oil', 5000, NULL, '🛢️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678004', 'Air Filter Inspection', 'ENGINE', 'Inspect and clean air filter element', 5000, NULL, '🌬️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678005', 'Brake Pads Inspection/Change', 'BRAKES', 'Inspect brake pad thickness and replace if worn', 6000, NULL, '🛑', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678006', 'Air Filter Replacement', 'ENGINE', 'Replace air filter element', 8000, NULL, '🌬️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678007', 'Spark Plug Change', 'ENGINE', 'Replace spark plug', 10000, NULL, '⚡', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678008', 'Fuel Filter Change', 'ENGINE', 'Replace fuel filter', 12000, NULL, '⛽', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678009', 'Throttle Body Cleaning', 'ENGINE', 'Clean throttle body and IAC valve', 12000, NULL, '🎮', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678010', 'Drive Belt Replacement', 'GENERAL', 'Replace CVT drive belt', 18000, NULL, '🔄', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678011', 'Chain Drive Check', 'CHAIN', 'Inspect chain tension, sprockets, and lubrication', 20000, NULL, '⛓️', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678012', 'Tire Replacement', 'TIRES', 'Replace worn tires', 20000, NULL, '🔄', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678013', 'Coolant Replacement', 'COOLING', 'Replace engine coolant', 30000, NULL, '🧊', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678014', 'Coolant Flush', 'COOLING', 'Flush and replace coolant system', 30000, 730, '🧊', FALSE, TRUE, TRUE, NOW()),

-- Date-based only
('b1c2d3e4-f5a6-7890-bcde-f12345678015', 'Brake Fluid Change', 'BRAKES', 'Replace brake fluid', NULL, 365, '💧', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678016', 'Brake Hose Inspection', 'BRAKES', 'Inspect brake hoses for cracks and leaks', NULL, 365, '🔧', FALSE, TRUE, TRUE, NOW()),
('b1c2d3e4-f5a6-7890-bcde-f12345678017', 'Battery Check', 'ELECTRICAL', 'Check battery voltage, terminals, and charge', NULL, 365, '🔋', FALSE, TRUE, TRUE, NOW()),

-- Regulatory
('b1c2d3e4-f5a6-7890-bcde-f12345678018', 'LTO Registration', 'REGULATORY', 'Annual LTO registration renewal', NULL, 365, '📋', TRUE, TRUE, TRUE, NOW());
