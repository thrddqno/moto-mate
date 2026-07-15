-- Add missing vin and notes columns to motorcycles table
ALTER TABLE moto_mate.motorcycles ADD COLUMN vin VARCHAR(50);
ALTER TABLE moto_mate.motorcycles ADD COLUMN notes TEXT;
