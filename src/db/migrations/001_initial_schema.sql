-- ============================================================
-- BHUMI 360 - POSTGRESQL + POSTGIS INITIAL DATABASE MIGRATION
-- Migration Version: 001_initial_schema.sql
-- Target: PostgreSQL 15+ with PostGIS 3.3+
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerations
CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN',
    'PROJECT_OFFICER',
    'LAND_ACQUISITION_OFFICER',
    'GIS_OFFICER',
    'SURVEY_OFFICER',
    'FINANCE_OFFICER',
    'RR_OFFICER',
    'APPROVING_AUTHORITY',
    'AUDITOR',
    'CITIZEN'
);

CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');
CREATE TYPE project_type_enum AS ENUM ('HIGHWAY', 'RAILWAY', 'RENEWABLE_ENERGY', 'INDUSTRIAL_CORRIDOR', 'URBAN_METRO');
CREATE TYPE project_status_enum AS ENUM ('DRAFT', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE parcel_status_enum AS ENUM (
    'IDENTIFIED', 'UNDER_SURVEY', 'UNDER_VERIFICATION', 'UNDER_APPROVAL',
    'UNDER_COMPENSATION', 'ACQUIRED', 'DISPUTED', 'POSSESSION_TAKEN'
);
CREATE TYPE acquisition_stage_enum AS ENUM (
    'IDENTIFICATION', 'SURVEY', 'VERIFICATION', 'PROPOSAL', 'APPROVAL',
    'COMPENSATION', 'RR', 'POSSESSION', 'COMPLETION'
);
CREATE TYPE notification_type_enum AS ENUM ('APPROVAL', 'COMPENSATION', 'SURVEY', 'RR', 'DOCUMENT', 'SYSTEM', 'ALERT');
CREATE TYPE priority_enum AS ENUM ('normal', 'high', 'urgent');

-- 3. Location Hierarchy (State-Agnostic)
CREATE TABLE states (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    regional_subdistrict_term VARCHAR(50) DEFAULT 'Tehsil',
    regional_village_term VARCHAR(50) DEFAULT 'Revenue Village',
    regional_plot_term VARCHAR(50) DEFAULT 'Khasra No.',
    regional_officer_term VARCHAR(50) DEFAULT 'Patwari',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    state_id VARCHAR(36) NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subdistricts (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    district_id VARCHAR(36) NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Tehsil',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE villages (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    subdistrict_id VARCHAR(36) NOT NULL REFERENCES subdistricts(id) ON DELETE CASCADE,
    census_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Departments
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Roles & Permissions (Centralized RBAC)
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name user_role_enum UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 6. Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id user_role_enum NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    status user_status_enum DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Projects
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_type project_type_enum NOT NULL,
    state_id VARCHAR(36) REFERENCES states(id),
    district_id VARCHAR(36) REFERENCES districts(id),
    status project_status_enum DEFAULT 'PLANNING',
    priority VARCHAR(20) DEFAULT 'HIGH',
    start_date DATE,
    target_completion_date DATE,
    total_area_acres NUMERIC(12, 4) DEFAULT 0,
    total_budget_inr NUMERIC(16, 2) DEFAULT 0,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Land Parcels (with PostGIS geometry)
CREATE TABLE land_parcels (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    parcel_code VARCHAR(50) UNIQUE NOT NULL,
    survey_number VARCHAR(100) NOT NULL,
    area NUMERIC(10, 4) NOT NULL,
    area_unit VARCHAR(20) DEFAULT 'ACRES',
    land_type VARCHAR(50) NOT NULL,
    acquisition_status parcel_status_enum DEFAULT 'IDENTIFIED',
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    village_id VARCHAR(36) REFERENCES villages(id),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Acquisition Cases
CREATE TABLE acquisition_cases (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parcel_id VARCHAR(36) NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
    current_stage acquisition_stage_enum DEFAULT 'IDENTIFICATION',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    assigned_to VARCHAR(36) REFERENCES users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Surveys
CREATE TABLE surveys (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    parcel_id VARCHAR(36) NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
    survey_number VARCHAR(100) NOT NULL,
    survey_date DATE NOT NULL,
    survey_officer_id VARCHAR(36) REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    dgps_point_count INT DEFAULT 0,
    boundary_verification_hash VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Approvals
CREATE TABLE approvals (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    case_id VARCHAR(36) NOT NULL REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    approval_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    requested_by VARCHAR(36) REFERENCES users(id),
    approved_by VARCHAR(36) REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    dsc_token_fingerprint VARCHAR(64),
    comments TEXT
);

-- 12. Compensations
CREATE TABLE compensations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    case_id VARCHAR(36) NOT NULL REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    eligible_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    approved_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    disbursed_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'DRAFT',
    pfms_transaction_reference VARCHAR(100),
    disbursed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Rehabilitation & Resettlement (R&R) Cases
CREATE TABLE rr_cases (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    case_id VARCHAR(36) NOT NULL REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    eligible_family_count INT DEFAULT 0,
    benefit_status VARCHAR(50) DEFAULT 'ELIGIBILITY_SURVEY',
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Documents
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    storage_reference VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    priority priority_enum DEFAULT 'normal',
    read_at TIMESTAMP WITH TIME ZONE,
    link_route VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Cryptographic Audit Ledger (Append-Only)
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    actor_user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_id VARCHAR(64) NOT NULL,
    ip_address_masked VARCHAR(45) NOT NULL,
    integrity_hash VARCHAR(64) NOT NULL,
    metadata JSONB
);

-- 17. GIS Data Sources
CREATE TABLE gis_data_sources (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    status VARCHAR(30) DEFAULT 'CONNECTED',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gis_layers (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    source_id VARCHAR(36) REFERENCES gis_data_sources(id) ON DELETE CASCADE,
    layer_name VARCHAR(100) NOT NULL,
    display_title VARCHAR(150) NOT NULL,
    geometry_type VARCHAR(30) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    opacity NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Spatial and Performance Indexes
CREATE INDEX idx_parcels_geom ON land_parcels USING GIST (geom);
CREATE INDEX idx_parcels_project_id ON land_parcels (project_id);
CREATE INDEX idx_cases_parcel_id ON acquisition_cases (parcel_id);
CREATE INDEX idx_cases_stage ON acquisition_cases (current_stage);
CREATE INDEX idx_audit_actor ON audit_logs (actor_user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX idx_notifications_user ON notifications (user_id, read_at);
