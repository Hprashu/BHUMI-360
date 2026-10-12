-- ====================================================================
-- BHUMI 360: National Land Acquisition & Management Platform
-- Seed Data Migration: Master Roles, Permissions & Departments
-- Migration: 002_seed_data.sql
-- ====================================================================

-- 1. SEED ROLES
INSERT INTO roles (id, name, display_name, description, status) VALUES
('role-super-admin', 'SUPER_ADMIN', 'Super Administrator', 'Apex administrative authority with universal permissions across all directorates.', 'ACTIVE'),
('role-proj-officer', 'PROJECT_OFFICER', 'Project Officer', 'Corridor proponent desk responsible for physical milestone scheduling and delivery.', 'ACTIVE'),
('role-lao', 'LAND_ACQUISITION_OFFICER', 'Land Acquisition Officer (CALA)', 'Competent Authority under Section 3G, gazette declarations, and possession delivery.', 'ACTIVE'),
('role-gis', 'GIS_OFFICER', 'GIS Officer', 'Geospatial vector mapping, PostGIS cadastral layers, drone orthomosaic alignment & buffer zones.', 'ACTIVE'),
('role-survey', 'SURVEY_OFFICER', 'Survey Officer', 'DGPS ground truthing, Joint Measurement Surveys (JMS), and Field Measurement Book demarcations.', 'ACTIVE'),
('role-finance', 'FINANCE_OFFICER', 'Finance & Compensation Officer', 'Statutory solatium determination, 12% additional interest calculation, and PFMS DBT releases.', 'ACTIVE'),
('role-rr', 'RR_OFFICER', 'R&R Officer', 'Project-affected family census, alternate housing allotment, and livelihood entitlement delivery.', 'ACTIVE'),
('role-authority', 'APPROVING_AUTHORITY', 'Approving Authority (Collector / SLAO)', 'Statutory gazette signing, award confirmation, public inquiry approval & dispute settlement.', 'ACTIVE'),
('role-auditor', 'AUDITOR', 'Auditor (CAG / State Oversight)', 'Independent procedural review, tamper-evident cryptographic hash verification & compliance oversight.', 'ACTIVE'),
('role-citizen', 'CITIZEN', 'Citizen / Landowner', 'Public inquiry portal for survey status, compensation entitlement verification, and Section 15 objections.', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DEPARTMENTS
INSERT INTO departments (id, code, name, description, state, district, status) VALUES
('dept-revenue', 'DEP-REV-01', 'State Directorate of Land Records & Revenue', 'Statutory custodian of cadastral records of rights (RoR), mutation deeds, and land classification registers.', 'Central Jurisdiction', 'Statewide Headquarters', 'ACTIVE'),
('dept-nhai', 'DEP-NHAI-02', 'National Highways & Linear Infrastructure Directorate', 'Corridor planning, Right-of-Way (RoW) alignment drafting, project scheduling, and funding management.', 'National Infrastructure Zone', 'Corridor Division', 'ACTIVE'),
('dept-survey', 'DEP-SURV-03', 'Cadastral Survey & Geospatial Directorate', 'Joint Measurement Surveys (JMS), DGPS ground control point benchmarks, and drone orthomosaic alignment.', 'National Infrastructure Zone', 'Field Survey Unit', 'ACTIVE'),
('dept-finance', 'DEP-FIN-04', 'Finance & Compensation Treasury Division', 'Assessment of Section 26-30 solatium, 12% additional interest, and PFMS Direct Benefit Transfer (DBT) execution.', 'National Infrastructure Zone', 'Treasury Branch', 'ACTIVE'),
('dept-rr', 'DEP-RR-05', 'Rehabilitation & Resettlement Directorate', 'Census of project-affected families (PAFs), alternate housing colony development, and skill livelihood grants.', 'National Infrastructure Zone', 'R&R Regional Desk', 'ACTIVE'),
('dept-collector', 'DEP-COLL-06', 'Office of the District Collector & District Magistrate', 'Statutory gazette notification authority, Section 15 objection adjudications, and award sanction approvals.', 'National Infrastructure Zone', 'Coastal & Valley District', 'ACTIVE'),
('dept-audit', 'DEP-CAG-07', 'Statutory Audit & Public Oversight Directorate', 'Independent procedural review, tamper-evident cryptographic hash verification, and compliance oversight.', 'Central Jurisdiction', 'Apex Vigilance Wing', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PERMISSIONS
INSERT INTO permissions (id, key, display_name, description, module, action) VALUES
('perm-dash-view', 'dashboard.view', 'View Dashboard', 'Access executive KPI dashboard', 'dashboard', 'view'),
('perm-prj-view', 'project.view', 'View Projects', 'Inspect infrastructure linear projects', 'project', 'view'),
('perm-prj-create', 'project.create', 'Create Projects', 'Initiate linear infrastructure corridors', 'project', 'create'),
('perm-prj-update', 'project.update', 'Update Projects', 'Modify corridor parameters', 'project', 'update'),
('perm-prj-delete', 'project.delete', 'Delete Projects', 'Archive or delete corridors', 'project', 'delete'),
('perm-pcl-view', 'parcel.view', 'View Parcels', 'Search cadastral parcels and survey numbers', 'parcel', 'view'),
('perm-pcl-create', 'parcel.create', 'Create Parcels', 'Register cadastral plots', 'parcel', 'create'),
('perm-pcl-update', 'parcel.update', 'Update Parcels', 'Modify ownership and area records', 'parcel', 'update'),
('perm-pcl-delete', 'parcel.delete', 'Delete Parcels', 'Remove plots from acquisition boundary', 'parcel', 'delete'),
('perm-gis-view', 'gis.view', 'View GIS Command Center', 'Inspect geospatial map layers', 'gis', 'view'),
('perm-gis-layers', 'gis.manage_layers', 'Manage GIS Layers', 'Configure WMS/WFS geospatial layers', 'gis', 'manage_layers'),
('perm-srv-view', 'survey.view', 'View Survey Records', 'Inspect Joint Measurement Survey records', 'survey', 'view'),
('perm-srv-create', 'survey.create', 'Create Survey Records', 'Record DGPS and ground measurement data', 'survey', 'create'),
('perm-srv-update', 'survey.update', 'Update Survey Records', 'Edit survey measurement data', 'survey', 'update'),
('perm-srv-verify', 'survey.verify', 'Verify Survey Records', 'Attest cadastral field surveys', 'survey', 'verify'),
('perm-app-view', 'approval.view', 'View Approvals', 'Inspect statutory declaration approvals', 'approval', 'view'),
('perm-app-approve', 'approval.approve', 'Sign Approvals', 'Digitally sign statutory declarations', 'approval', 'approve'),
('perm-app-reject', 'approval.reject', 'Reject Approvals', 'Return non-compliant proposals', 'approval', 'reject'),
('perm-cmp-view', 'compensation.view', 'View Compensation', 'Review Section 26-30 award calculations', 'compensation', 'view'),
('perm-cmp-create', 'compensation.create', 'Draft Compensation', 'Compute solatium and market rates', 'compensation', 'create'),
('perm-cmp-update', 'compensation.update', 'Update Compensation', 'Adjust apportionment and bank details', 'compensation', 'update'),
('perm-cmp-approve', 'compensation.approve', 'Approve Disbursal', 'Authorize treasury release vouchers', 'compensation', 'approve'),
('perm-rr-view', 'rr.view', 'View R&R Entitlements', 'Review displaced family benefits', 'rr', 'view'),
('perm-rr-create', 'rr.create', 'Create R&R Dossiers', 'Enroll project-affected families', 'rr', 'create'),
('perm-rr-update', 'rr.update', 'Update R&R Delivery', 'Mark housing and grant delivery', 'rr', 'update'),
('perm-doc-view', 'document.view', 'View Documents', 'Read deeds, maps, and gazettes', 'document', 'view'),
('perm-doc-upload', 'document.upload', 'Upload Documents', 'Upload FMB drawings and deeds', 'document', 'upload'),
('perm-doc-update', 'document.update', 'Update Documents', 'Update document classification tags', 'document', 'update'),
('perm-doc-delete', 'document.delete', 'Archive Documents', 'Archive superseded documents', 'document', 'delete'),
('perm-notif-view', 'notification.view', 'View Notifications', 'Receive operational alerts', 'notification', 'view'),
('perm-notif-manage', 'notification.manage', 'Manage Alerts', 'Configure alert policies', 'notification', 'manage'),
('perm-anl-view', 'analytics.view', 'View Analytics', 'Explore delivery velocity & bottleneck stats', 'analytics', 'view'),
('perm-anl-report', 'report.generate', 'Generate Reports', 'Export statutory compliance reports', 'analytics', 'generate'),
('perm-aud-view', 'audit.view', 'View Audit Ledger', 'Inspect cryptographic mutation trail', 'audit', 'view'),
('perm-usr-view', 'user.view', 'View Users', 'Inspect user directory', 'user', 'view'),
('perm-usr-create', 'user.create', 'Create Users', 'Provision officer accounts', 'user', 'create'),
('perm-usr-update', 'user.update', 'Update Users', 'Modify officer details', 'user', 'update'),
('perm-usr-deact', 'user.deactivate', 'Deactivate Users', 'Suspend or terminate access', 'user', 'deactivate'),
('perm-rol-view', 'role.view', 'View Roles', 'Inspect roles and permission mappings', 'role', 'view'),
('perm-rol-manage', 'role.manage', 'Manage Roles', 'Configure custom role policies', 'role', 'manage'),
('perm-prm-view', 'permission.view', 'View Permissions', 'Inspect master permission catalog', 'permission', 'view'),
('perm-dep-view', 'department.view', 'View Departments', 'Inspect administrative departments', 'department', 'view'),
('perm-dep-manage', 'department.manage', 'Manage Departments', 'Configure departmental jurisdictions', 'department', 'manage'),
('perm-int-view', 'integration.view', 'View Integrations', 'Monitor external API bridges', 'integration', 'view'),
('perm-int-manage', 'integration.manage', 'Manage Integrations', 'Configure gateway endpoints', 'integration', 'manage'),
('perm-sys-manage', 'system.manage', 'System Governance', 'Configure security and state terminology', 'system', 'manage')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED GIS DATA SOURCES
INSERT INTO gis_data_sources (id, name, type, base_url, status, description) VALUES
('ds-osm', 'OpenStreetMap Basemap', 'OPENSTREETMAP', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', 'CONNECTED', 'General reference cartography (not an official cadastral boundary source).'),
('ds-cadastral', 'National Cadastral GeoServer WFS', 'WFS', 'https://geoserver.bhumi.gov.in/geoserver/wfs', 'CONNECTED', 'Authoritative cadastral boundary shapes with survey numbers.')
ON CONFLICT (id) DO NOTHING;
