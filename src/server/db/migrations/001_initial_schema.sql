-- ====================================================================
-- BHUMI 360: National Land Acquisition & Management Platform
-- Initial Database Migration: Schema Definition (PostgreSQL + PostGIS)
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- Enable PostGIS geospatial extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(64) PRIMARY KEY,
    key VARCHAR(128) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    description TEXT,
    module VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLE_PERMISSIONS TABLE (Many-to-Many junction)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(64) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    employee_code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    email VARCHAR(256) UNIQUE NOT NULL,
    phone VARCHAR(32),
    password_hash VARCHAR(512) NOT NULL,
    role_id VARCHAR(64) REFERENCES roles(id) ON DELETE RESTRICT,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE RESTRICT,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. LOCATION HIERARCHY / ADMINISTRATIVE UNITS TABLE (State-agnostic)
CREATE TABLE IF NOT EXISTS administrative_units (
    id VARCHAR(64) PRIMARY KEY,
    unit_level VARCHAR(32) NOT NULL CHECK (unit_level IN ('STATE', 'DISTRICT', 'SUB_DISTRICT', 'VILLAGE', 'LOCALITY')),
    name VARCHAR(256) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    state_ref VARCHAR(128) NOT NULL,
    district_ref VARCHAR(128),
    sub_district_type VARCHAR(64) DEFAULT 'Tehsil', -- Tehsil / Mandal / Taluka / Sub-Division
    parent_id VARCHAR(64) REFERENCES administrative_units(id) ON DELETE SET NULL,
    geometry GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    project_code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    project_type VARCHAR(64) NOT NULL CHECK (project_type IN ('HIGHWAY', 'RAILWAY', 'RENEWABLE_ENERGY', 'INDUSTRIAL_CORRIDOR', 'URBAN_METRO')),
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(32) DEFAULT 'HIGH' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL')),
    start_date DATE,
    target_completion_date DATE,
    total_area_acres NUMERIC(12, 4) DEFAULT 0,
    compensation_budget_cr NUMERIC(12, 2) DEFAULT 0,
    corridor_geometry GEOMETRY(MultiLineString, 4326), -- PostGIS linear corridor alignment
    buffer_geometry GEOMETRY(MultiPolygon, 4326),   -- Right-of-Way (RoW) 100m impact buffer
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. LAND PARCELS TABLE
CREATE TABLE IF NOT EXISTS land_parcels (
    id VARCHAR(64) PRIMARY KEY,
    parcel_code VARCHAR(64) UNIQUE NOT NULL,
    survey_number VARCHAR(128) NOT NULL,
    sub_division VARCHAR(64),
    area_acres NUMERIC(10, 4) NOT NULL,
    area_sqm NUMERIC(12, 2),
    land_type VARCHAR(64) NOT NULL,
    acquisition_status VARCHAR(64) DEFAULT 'IDENTIFIED' CHECK (
        acquisition_status IN ('IDENTIFIED', 'UNDER_SURVEY', 'UNDER_VERIFICATION', 'UNDER_APPROVAL', 'UNDER_COMPENSATION', 'ACQUIRED', 'DISPUTED', 'POSSESSION_TAKEN')
    ),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    location_id VARCHAR(64) REFERENCES administrative_units(id) ON DELETE SET NULL,
    owner_name VARCHAR(256),
    owner_khata_no VARCHAR(128),
    geometry GEOMETRY(Polygon, 4326), -- PostGIS Cadastral Polygon
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ACQUISITION CASES TABLE
CREATE TABLE IF NOT EXISTS acquisition_cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(64) UNIQUE NOT NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    parcel_id VARCHAR(64) REFERENCES land_parcels(id) ON DELETE CASCADE,
    current_stage VARCHAR(32) NOT NULL CHECK (
        current_stage IN ('IDENTIFICATION', 'SURVEY', 'VERIFICATION', 'PROPOSAL', 'APPROVAL', 'COMPENSATION', 'RR', 'POSSESSION', 'COMPLETION')
    ),
    status VARCHAR(32) DEFAULT 'IN_PROGRESS' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'DISPUTED', 'COMPLETED')),
    priority VARCHAR(32) DEFAULT 'NORMAL',
    assigned_to VARCHAR(64) REFERENCES users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SURVEYS TABLE
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    parcel_id VARCHAR(64) REFERENCES land_parcels(id) ON DELETE CASCADE,
    survey_number VARCHAR(128) NOT NULL,
    survey_date DATE NOT NULL,
    survey_officer_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'OBJECTED')),
    dgps_control_points JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. APPROVALS TABLE
CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    approval_type VARCHAR(64) NOT NULL, -- Section 11 / Section 15 / Section 19 / Award
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'QUERY_RAISED')),
    requested_by VARCHAR(64) REFERENCES users(id),
    approved_by VARCHAR(64) REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    digital_signature_hash VARCHAR(256),
    comments TEXT
);

-- 12. COMPENSATION AWARDS TABLE
CREATE TABLE IF NOT EXISTS compensation_awards (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    market_rate_sqm NUMERIC(10, 2) NOT NULL,
    base_land_value NUMERIC(14, 2) NOT NULL,
    solatium_100_percent NUMERIC(14, 2) NOT NULL,
    additional_interest_12_percent NUMERIC(14, 2) DEFAULT 0,
    tree_structure_value NUMERIC(14, 2) DEFAULT 0,
    total_eligible_amount NUMERIC(14, 2) NOT NULL,
    approved_amount NUMERIC(14, 2) DEFAULT 0,
    disbursed_amount NUMERIC(14, 2) DEFAULT 0,
    pfms_voucher_number VARCHAR(128),
    status VARCHAR(32) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'SANCTIONED', 'DISBURSED', 'ESCROW_DISPUTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. REHABILITATION & RESETTLEMENT (RR) CASES
CREATE TABLE IF NOT EXISTS rr_cases (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES acquisition_cases(id) ON DELETE CASCADE,
    eligible_family_count INTEGER DEFAULT 1,
    alternate_house_allocated BOOLEAN DEFAULT FALSE,
    housing_plot_ref VARCHAR(128),
    one_time_grant_amount NUMERIC(12, 2) DEFAULT 500000.00,
    benefit_status VARCHAR(64) DEFAULT 'SURVEY_PENDING',
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. DOCUMENTS REPOSITORY
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    document_type VARCHAR(64) NOT NULL, -- GEOTIFF, FMB, GAZETTE_AWARD, DEED, AFFIDAVIT
    entity_type VARCHAR(64) NOT NULL,   -- PARCEL, PROJECT, SURVEY, APPROVAL
    entity_id VARCHAR(64) NOT NULL,
    storage_reference VARCHAR(512) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by VARCHAR(64) REFERENCES users(id),
    sha256_checksum VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    priority VARCHAR(16) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal')),
    read_at TIMESTAMP WITH TIME ZONE,
    link_route VARCHAR(256),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. AUDIT LOGS (Append-only tamper-evident ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(256) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    ip_address_masked VARCHAR(64) NOT NULL,
    integrity_hash VARCHAR(256) NOT NULL,
    request_id VARCHAR(128),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. GIS DATA SOURCES TABLE
CREATE TABLE IF NOT EXISTS gis_data_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(64) NOT NULL CHECK (type IN ('OPENSTREETMAP', 'GEOSERVER', 'WMS', 'WFS', 'ARCGIS_REST', 'GEOJSON_API', 'OFFICIAL_CADASTRAL_API')),
    base_url VARCHAR(512) NOT NULL,
    status VARCHAR(32) DEFAULT 'CONNECTED',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. GIS LAYERS TABLE
CREATE TABLE IF NOT EXISTS gis_layers (
    id VARCHAR(64) PRIMARY KEY,
    data_source_id VARCHAR(64) REFERENCES gis_data_sources(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    title VARCHAR(256) NOT NULL,
    layer_type VARCHAR(32) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    style_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SPATIAL AND PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_land_parcels_geom ON land_parcels USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_projects_corridor_geom ON projects USING GIST (corridor_geometry);
CREATE INDEX IF NOT EXISTS idx_projects_buffer_geom ON projects USING GIST (buffer_geometry);
CREATE INDEX IF NOT EXISTS idx_admin_units_geom ON administrative_units USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_parcels_project ON land_parcels(project_id);
CREATE INDEX IF NOT EXISTS idx_cases_project ON acquisition_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
