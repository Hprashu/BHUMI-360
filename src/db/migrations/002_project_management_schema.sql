-- ============================================================
-- BHUMI 360 - PHASE 3: PROJECT MANAGEMENT & LIFECYCLE SCHEMA
-- Migration Version: 002_project_management_schema.sql
-- Target: PostgreSQL 15+ with PostGIS 3.3+
-- Description: Extends project table with state-agnostic locations,
--              lifecycle history, documents vault, and parcel mappings.
-- ============================================================

-- 1. Upgrade Project Type and Status Enumerations
DO $$ BEGIN
    -- Add new project types if not already existing
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'NATIONAL_HIGHWAY';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'STATE_HIGHWAY';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'METRO_TRANSIT';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'IRRIGATION';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'AIRPORT';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'INDUSTRIAL_DEVELOPMENT';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'POWER_INFRASTRUCTURE';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'WATER_INFRASTRUCTURE';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'URBAN_DEVELOPMENT';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'PUBLIC_UTILITY';
    ALTER TYPE project_type_enum ADD VALUE IF NOT EXISTS 'OTHER';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- Add granular lifecycle status values
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'LAND_IDENTIFICATION';
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'SURVEY';
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'ACQUISITION_IN_PROGRESS';
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'COMPENSATION_IN_PROGRESS';
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'RR_IN_PROGRESS';
    ALTER TYPE project_status_enum ADD VALUE IF NOT EXISTS 'POSSESSION';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Project Priority Enum
DO $$ BEGIN
    CREATE TYPE project_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Alter Projects Table to incorporate all Phase 3 attributes
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS project_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'National Infrastructure Zone',
    ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'General District',
    ADD COLUMN IF NOT EXISTS sub_district VARCHAR(100) DEFAULT 'Tehsil',
    ADD COLUMN IF NOT EXISTS village VARCHAR(100),
    ADD COLUMN IF NOT EXISTS location_description TEXT,
    ADD COLUMN IF NOT EXISTS implementing_agency VARCHAR(255) DEFAULT 'National Infrastructure Directorate',
    ADD COLUMN IF NOT EXISTS project_officer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS expected_completion_date DATE,
    ADD COLUMN IF NOT EXISTS actual_completion_date DATE,
    ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS land_required_area NUMERIC(12, 4) DEFAULT 0.0000,
    ADD COLUMN IF NOT EXISTS total_parcels_required INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS acquired_parcels INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pending_parcels INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS compensation_budget NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS compensation_paid NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS rr_budget NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS rr_spent NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC(5, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;

-- Synchronize legacy name column if project_name is populated
UPDATE projects SET project_name = name WHERE project_name IS NULL AND name IS NOT NULL;
UPDATE projects SET land_required_area = total_area_acres WHERE land_required_area = 0 AND total_area_acres IS NOT NULL;

-- 4. Project Lifecycle Events Table
CREATE TABLE IF NOT EXISTS project_lifecycle_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(36) NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    remarks TEXT
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_project_id ON project_lifecycle_events(project_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_changed_at ON project_lifecycle_events(changed_at DESC);

-- 5. Project Documents Table
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    description TEXT,
    storage_reference VARCHAR(500),
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    size_bytes BIGINT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'VERIFIED',
    uploaded_by VARCHAR(36) REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_docs_project_id ON project_documents(project_id);

-- 6. Project Parcels Association Table
CREATE TABLE IF NOT EXISTS project_parcels (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by VARCHAR(36) REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    UNIQUE(project_id, parcel_id)
);

CREATE INDEX IF NOT EXISTS idx_proj_parcels_proj ON project_parcels(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_parcels_pcl ON project_parcels(parcel_id);
