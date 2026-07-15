-- Create schema
CREATE SCHEMA IF NOT EXISTS moto_mate;

-- Users table
CREATE TABLE moto_mate.users (
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
CREATE TABLE moto_mate.motorcycles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES moto_mate.users(id),
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

CREATE INDEX idx_motorcycles_user_id ON moto_mate.motorcycles(user_id);

-- Maintenance templates table
CREATE TABLE moto_mate.maintenance_templates (
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

CREATE INDEX idx_maintenance_templates_category ON moto_mate.maintenance_templates(category);

-- Maintenance schedules table
CREATE TABLE moto_mate.maintenance_schedules (
    id UUID PRIMARY KEY,
    motorcycle_id UUID NOT NULL REFERENCES moto_mate.motorcycles(id),
    template_id UUID NOT NULL REFERENCES moto_mate.maintenance_templates(id),
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

CREATE INDEX idx_maintenance_schedules_motorcycle_id ON moto_mate.maintenance_schedules(motorcycle_id);

-- Service logs table
CREATE TABLE moto_mate.service_logs (
    id UUID PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES moto_mate.maintenance_schedules(id),
    motorcycle_id UUID NOT NULL REFERENCES moto_mate.motorcycles(id),
    template_id UUID NOT NULL REFERENCES moto_mate.maintenance_templates(id),
    mileage_at_service INTEGER NOT NULL,
    date_of_service DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Break-in tracker table
CREATE TABLE moto_mate.break_in_tracker (
    id UUID PRIMARY KEY,
    motorcycle_id UUID UNIQUE NOT NULL REFERENCES moto_mate.motorcycles(id),
    initial_mileage INTEGER NOT NULL,
    break_in_limit INTEGER NOT NULL DEFAULT 500,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Device tokens table
CREATE TABLE moto_mate.device_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES moto_mate.users(id),
    token TEXT NOT NULL,
    platform VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_device_tokens_user_id ON moto_mate.device_tokens(user_id);
CREATE INDEX idx_dedvice_tokens_token ON moto_mate.device_tokens(token);

-- Notification log table
CREATE TABLE moto_mate.notification_log (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES moto_mate.users(id),
    schedule_id UUID REFERENCES moto_mate.maintenance_schedules(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'SENT',
    type VARCHAR(50)
);
