-- V6: Add icon, is_system, created_by_user_id columns to maintenance_templates

ALTER TABLE moto_mate.maintenance_templates 
ADD COLUMN icon VARCHAR(10),
ADD COLUMN is_system BOOLEAN DEFAULT TRUE,
ADD COLUMN created_by_user_id UUID;

-- Seed emoji icons for existing templates
UPDATE moto_mate.maintenance_templates SET icon = '🛢️' WHERE name = 'Oil Change';
UPDATE moto_mate.maintenance_templates SET icon = '⚡' WHERE name = 'Spark Plug Replacement';
UPDATE moto_mate.maintenance_templates SET icon = '🌬️' WHERE name = 'Air Filter Cleaning';
UPDATE moto_mate.maintenance_templates SET icon = '🔧' WHERE name = 'Valve Clearance Check';
UPDATE moto_mate.maintenance_templates SET icon = '⛓️' WHERE name = 'Chain Lube';
UPDATE moto_mate.maintenance_templates SET icon = '🔗' WHERE name = 'Chain Adjustment';
UPDATE moto_mate.maintenance_templates SET icon = '🔩' WHERE name = 'Chain/Sprocket Replacement';
UPDATE moto_mate.maintenance_templates SET icon = '🛑' WHERE name = 'Brake Pad Inspection';
UPDATE moto_mate.maintenance_templates SET icon = '💧' WHERE name = 'Brake Fluid Flush';
UPDATE moto_mate.maintenance_templates SET icon = '🔘' WHERE name = 'Tire Pressure Check';
UPDATE moto_mate.maintenance_templates SET icon = '🔄' WHERE name = 'Tire Replacement';
UPDATE moto_mate.maintenance_templates SET icon = '🔋' WHERE name = 'Battery Check';
UPDATE moto_mate.maintenance_templates SET icon = '💡' WHERE name = 'Lighting Check';
UPDATE moto_mate.maintenance_templates SET icon = '🧊' WHERE name = 'Coolant Check';
UPDATE moto_mate.maintenance_templates SET icon = '🪝' WHERE name = 'Cable Lubrication';
UPDATE moto_mate.maintenance_templates SET icon = '🔩' WHERE name = 'Fork Oil Change';
UPDATE moto_mate.maintenance_templates SET icon = '🖐️' WHERE name = 'Clutch Adjustment';
UPDATE moto_mate.maintenance_templates SET icon = '🎮' WHERE name = 'Throttle Cable Adjustment';
UPDATE moto_mate.maintenance_templates SET icon = '📋' WHERE name = 'LTO Registration';
