-- V5: Add notification settings to users and maintenance_schedules

-- Add reminder threshold fields to users
ALTER TABLE moto_mate.users 
ADD COLUMN reminder_threshold_days INTEGER DEFAULT 7,
ADD COLUMN reminder_threshold_percent INTEGER DEFAULT 10;

-- Add notification toggle to maintenance_schedules
ALTER TABLE moto_mate.maintenance_schedules 
ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE;
