-- Add cost column to service_logs table
ALTER TABLE moto_mate.service_logs ADD COLUMN cost DECIMAL(10, 2);
