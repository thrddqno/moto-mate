-- Create schema
CREATE SCHEMA IF NOT EXISTS moto_mate;

-- Set search path
SET search_path TO moto_mate;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    unit_preference VARCHAR(10) DEFAULT 'km',
    reminder_digest_time TIME DEFAULT '08:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Motorcycles table
CREATE TABLE motorcycles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(50),
    initial_mileage INTEGER NOT NULL DEFAULT 0,
    current_mileage INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for motorcycles user_id
CREATE INDEX idx_motorcycles_user_id ON motorcycles(user_id);

-- Maintenance templates table
CREATE TABLE maintenance_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    default_interval_mileage INTEGER,
    default_interval_days INTEGER,
    is_special BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for maintenance_templates category
CREATE INDEX idx_maintenance_templates_category ON maintenance_templates(category);

-- Maintenance schedules table
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY,
    motorcycle_id UUID NOT NULL REFERENCES motorcycles(id),
    template_id UUID NOT NULL REFERENCES maintenance_templates(id),
    interval_type VARCHAR(10) NOT NULL,
    interval_mileage INTEGER,
    interval_days INTEGER,
    last_service_mileage INTEGER DEFAULT 0,
    last_service_date DATE,
    next_due_mileage INTEGER,
    next_due_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for maintenance_schedules motorcycle_id
CREATE INDEX idx_maintenance_schedules_motorcycle_id ON maintenance_schedules(motorcycle_id);

-- Service logs table
CREATE TABLE service_logs (
    id UUID PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id),
    motorcycle_id UUID NOT NULL REFERENCES motorcycles(id),
    template_id UUID NOT NULL REFERENCES maintenance_templates(id),
    mileage_at_service INTEGER NOT NULL,
    date_of_service DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Break-in tracker table
CREATE TABLE break_in_tracker (
    id UUID PRIMARY KEY,
    motorcycle_id UUID UNIQUE NOT NULL REFERENCES motorcycles(id),
    initial_mileage INTEGER NOT NULL,
    break_in_limit INTEGER NOT NULL DEFAULT 500,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Device tokens table
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    platform VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for device_tokens
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);

-- Notification log table
CREATE TABLE notification_log (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID REFERENCES maintenance_schedules(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'SENT',
    type VARCHAR(50)
);
