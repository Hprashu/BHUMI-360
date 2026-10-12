// ============================================================
// BHUMI 360 - CENTRALIZED ROLE-PERMISSION MATRIX & HELPERS
// ============================================================
import { Permission, PermissionKey, Role, UserRole } from '../types/rbac';

export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'p_dash_01', key: 'dashboard.view', displayName: 'View Executive Dashboard', description: 'Access KPI metrics, corridor maps, and SLA milestones', module: 'dashboard', action: 'view', createdAt: '2026-01-01' },
  
  // Projects
  { id: 'p_prj_01', key: 'project.view', displayName: 'View Projects', description: 'Browse linear corridor infrastructure projects', module: 'project', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_prj_02', key: 'project.create', displayName: 'Create Project Corridor', description: 'Initialize new linear infrastructure acquisition scheme', module: 'project', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_prj_03', key: 'project.update', displayName: 'Update Project Details', description: 'Modify corridor parameters, chainages, and targets', module: 'project', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_prj_04', key: 'project.delete', displayName: 'Delete / Archive Project', description: 'Archive obsolete or canceled infrastructure projects', module: 'project', action: 'delete', createdAt: '2026-01-01' },
  { id: 'p_prj_05', key: 'project.assign_officer', displayName: 'Assign Project Officer', description: 'Designate or reassign nodal project authority and SLAO', module: 'project', action: 'assign_officer', createdAt: '2026-01-01' },
  { id: 'p_prj_06', key: 'project.change_status', displayName: 'Transition Project Status', description: 'Advance or transition project through statutory lifecycle stages', module: 'project', action: 'change_status', createdAt: '2026-01-01' },
  { id: 'p_prj_07', key: 'project.view_financials', displayName: 'View Project Financials', description: 'Access granular project budgets, award disbursal, and R&R allocations', module: 'project', action: 'view_financials', createdAt: '2026-01-01' },
  { id: 'p_prj_08', key: 'project.view_documents', displayName: 'View Project Documents', description: 'Access project notifications, gazette publications, and feasibility reports', module: 'project', action: 'view_documents', createdAt: '2026-01-01' },
  { id: 'p_prj_09', key: 'project.manage_documents', displayName: 'Manage Project Documents', description: 'Upload, index, and archive official project notifications and files', module: 'project', action: 'manage_documents', createdAt: '2026-01-01' },
  { id: 'p_prj_10', key: 'project.link_parcels', displayName: 'Link & Unlink Parcels', description: 'Attach or detach revenue land parcels to project corridor scope', module: 'project', action: 'link_parcels', createdAt: '2026-01-01' },
  { id: 'p_prj_11', key: 'project.export', displayName: 'Export Project Data', description: 'Export project registers, schedules, and summary reports to CSV/JSON', module: 'project', action: 'export', createdAt: '2026-01-01' },

  // Parcels
  { id: 'p_pcl_01', key: 'parcel.view', displayName: 'View Cadastral Parcels', description: 'Inspect land parcel records, Survey/Khasra numbers, and ownership', module: 'parcel', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_pcl_02', key: 'parcel.create', displayName: 'Add Cadastral Parcel', description: 'Onboard new revenue plot into corridor acquisition schedule', module: 'parcel', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_pcl_03', key: 'parcel.update', displayName: 'Update Parcel Details', description: 'Mutate parcel attributes, area classification, and sub-divisions', module: 'parcel', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_pcl_04', key: 'parcel.delete', displayName: 'De-notify / Remove Parcel', description: 'De-notify parcel under statutory Section 93 provisions', module: 'parcel', action: 'delete', createdAt: '2026-01-01' },

  // GIS
  { id: 'p_gis_01', key: 'gis.view', displayName: 'View GIS Command Center', description: 'Access spatial vector layers, RoW corridor alignment, and basemaps', module: 'gis', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_gis_02', key: 'gis.manage_layers', displayName: 'Manage GIS Layers & OGC WFS', description: 'Configure GeoServer endpoints, buffer distances, and vector styles', module: 'gis', action: 'manage_layers', createdAt: '2026-01-01' },

  // Survey
  { id: 'p_srv_01', key: 'survey.view', displayName: 'View Survey Reports', description: 'Access DGPS drone orthomosaics, ETS field books, and boundary markers', module: 'survey', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_srv_02', key: 'survey.create', displayName: 'Submit Field Survey', description: 'Upload DGPS coordinates and field measurement book (FMB) scans', module: 'survey', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_srv_03', key: 'survey.update', displayName: 'Amend Survey Demarcation', description: 'Correct ground boundary coordinates and obstruction inventories', module: 'survey', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_srv_04', key: 'survey.verify', displayName: 'Verify & Sign Survey (FMB)', description: 'Statutory verification of cadastral boundary coordinates', module: 'survey', action: 'verify', createdAt: '2026-01-01' },

  // Approvals
  { id: 'p_app_01', key: 'approval.view', displayName: 'View Statutory Approvals', description: 'Monitor Section 11, 19, and 23 gazette notifications and sanctions', module: 'approval', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_app_02', key: 'approval.approve', displayName: 'Grant Statutory Approval', description: 'Digitally approve acquisition notifications with DSC token', module: 'approval', action: 'approve', createdAt: '2026-01-01' },
  { id: 'p_app_03', key: 'approval.reject', displayName: 'Reject / Return with Remarks', description: 'Return proposal for objection resolution or boundary re-survey', module: 'approval', action: 'reject', createdAt: '2026-01-01' },

  // Compensation
  { id: 'p_cmp_01', key: 'compensation.view', displayName: 'View Compensation Awards', description: 'View Section 26 market valuation, solatium, and interest schedules', module: 'compensation', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_cmp_02', key: 'compensation.create', displayName: 'Draft Compensation Award', description: 'Calculate basic value, multiplying factors, and solatium awards', module: 'compensation', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_cmp_03', key: 'compensation.update', displayName: 'Update Valuation Appraisals', description: 'Amend tree, crop, and structural civil valuation appraisals', module: 'compensation', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_cmp_04', key: 'compensation.approve', displayName: 'Authorize PFMS DBT Payout', description: 'Sanction direct benefit transfer disbursement to escrow/beneficiary', module: 'compensation', action: 'approve', createdAt: '2026-01-01' },

  // R&R
  { id: 'p_rr_01', key: 'rr.view', displayName: 'View R&R Schemes', description: 'Review displaced family census, entitlement matrices, and resettlement sites', module: 'rr', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_rr_02', key: 'rr.create', displayName: 'Enlist Affected Family', description: 'Enroll PAF/PDF households under Second Schedule entitlements', module: 'rr', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_rr_03', key: 'rr.update', displayName: 'Disburse R&R Grants', description: 'Allot resettlement plots, subsistence allowances, and training kits', module: 'rr', action: 'update', createdAt: '2026-01-01' },

  // Document Vault
  { id: 'p_doc_01', key: 'document.view', displayName: 'Access Cadastral Vault', description: 'View gazette notifications, sale deeds, and title documents', module: 'document', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_doc_02', key: 'document.upload', displayName: 'Upload Legal Documents', description: 'Deposit georeferenced TIFFs, DigiLocker certificates, and deeds', module: 'document', action: 'upload', createdAt: '2026-01-01' },
  { id: 'p_doc_03', key: 'document.update', displayName: 'Index & Tag Documents', description: 'Modify cadastral document metadata and OCR indexing tags', module: 'document', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_doc_04', key: 'document.delete', displayName: 'Purge / Invalidate Document', description: 'Revoke superseded deed or invalid survey attachment', module: 'document', action: 'delete', createdAt: '2026-01-01' },

  // Notification
  { id: 'p_not_01', key: 'notification.view', displayName: 'View Notifications', description: 'Receive statutory SLA alerts, milestone alerts, and objections', module: 'notification', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_not_02', key: 'notification.manage', displayName: 'Broadcast Escalations', description: 'Dispatch priority summons, reminders, and ministerial briefs', module: 'notification', action: 'manage', createdAt: '2026-01-01' },

  // Analytics
  { id: 'p_anl_01', key: 'analytics.view', displayName: 'View Analytics & MIS', description: 'Corridor capital expenditure burn, bottleneck heatmaps, and forecasts', module: 'analytics', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_anl_02', key: 'report.generate', displayName: 'Export Statutory Reports', description: 'Generate PM Gati Shakti, RFCTLARR Form 1-7, and CAG audit packs', module: 'analytics', action: 'report', createdAt: '2026-01-01' },

  // Audit
  { id: 'p_aud_01', key: 'audit.view', displayName: 'View Cryptographic Audit Trail', description: 'Inspect SHA-256 Merkle chain logs, access history, and mutation proofs', module: 'audit', action: 'view', createdAt: '2026-01-01' },

  // Administration (Users, Roles, Departments)
  { id: 'p_usr_01', key: 'user.view', displayName: 'View User Directory', description: 'Access roster of departmental acquisition officers and personnel', module: 'user', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_usr_02', key: 'user.create', displayName: 'Provision User Account', description: 'Onboard revenue officers, surveyors, and field specialists', module: 'user', action: 'create', createdAt: '2026-01-01' },
  { id: 'p_usr_03', key: 'user.update', displayName: 'Update User Profile', description: 'Modify department assignments, phone numbers, and job roles', module: 'user', action: 'update', createdAt: '2026-01-01' },
  { id: 'p_usr_04', key: 'user.deactivate', displayName: 'Suspend / Deactivate User', description: 'Revoke active system credentials and digital sign access', module: 'user', action: 'deactivate', createdAt: '2026-01-01' },

  { id: 'p_rol_01', key: 'role.view', displayName: 'View Role Catalog', description: 'Inspect role specifications and assigned permission sets', module: 'role', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_rol_02', key: 'role.manage', displayName: 'Configure Role Permissions', description: 'Tune permission matrices for CALA, SLAO, and desk authorities', module: 'role', action: 'manage', createdAt: '2026-01-01' },

  { id: 'p_prm_01', key: 'permission.view', displayName: 'View Permission Directory', description: 'Inspect system-wide functional permission codes', module: 'permission', action: 'view', createdAt: '2026-01-01' },

  { id: 'p_dpt_01', key: 'department.view', displayName: 'View Department Directory', description: 'Browse state revenue departments, CALA cells, and survey units', module: 'department', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_dpt_02', key: 'department.manage', displayName: 'Manage Departments', description: 'Create and configure multi-state acquisition departments', module: 'department', action: 'manage', createdAt: '2026-01-01' },

  { id: 'p_int_01', key: 'integration.view', displayName: 'View Gateway Integrations', description: 'Inspect PFMS, DigiLocker, and GeoServer bridge latencies', module: 'integration', action: 'view', createdAt: '2026-01-01' },
  { id: 'p_int_02', key: 'integration.manage', displayName: 'Configure Integrations', description: 'Update webhook URLs, certificate tokens, and sync frequencies', module: 'integration', action: 'manage', createdAt: '2026-01-01' },
  { id: 'p_sys_01', key: 'system.manage', displayName: 'Manage System Architecture', description: 'Configure global multi-state terminology and encryption anchors', module: 'system', action: 'manage', createdAt: '2026-01-01' },
];

export const ROLE_PERMISSION_MAPPING: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.key),

  PROJECT_OFFICER: [
    'dashboard.view',
    'project.view',
    'project.create',
    'project.update',
    'project.assign_officer',
    'project.change_status',
    'project.view_financials',
    'project.view_documents',
    'project.manage_documents',
    'project.link_parcels',
    'project.export',
    'parcel.view',
    'gis.view',
    'approval.view',
    'analytics.view',
    'report.generate',
    'document.view',
    'notification.view',
  ],

  LAND_ACQUISITION_OFFICER: [
    'dashboard.view',
    'project.view',
    'project.update',
    'project.change_status',
    'project.view_financials',
    'project.view_documents',
    'project.manage_documents',
    'project.link_parcels',
    'project.export',
    'parcel.view',
    'parcel.update',
    'gis.view',
    'survey.view',
    'survey.verify',
    'approval.view',
    'compensation.view',
    'document.view',
    'notification.view',
  ],

  GIS_OFFICER: [
    'dashboard.view',
    'project.view',
    'project.link_parcels',
    'parcel.view',
    'gis.view',
    'gis.manage_layers',
    'survey.view',
    'document.view',
    'notification.view',
  ],

  SURVEY_OFFICER: [
    'dashboard.view',
    'project.view',
    'parcel.view',
    'parcel.update',
    'gis.view',
    'survey.view',
    'survey.create',
    'survey.update',
    'document.view',
    'document.upload',
    'notification.view',
  ],

  FINANCE_OFFICER: [
    'dashboard.view',
    'project.view',
    'project.view_financials',
    'project.view_documents',
    'project.export',
    'parcel.view',
    'compensation.view',
    'compensation.create',
    'compensation.update',
    'compensation.approve',
    'report.generate',
    'document.view',
    'notification.view',
    'analytics.view',
  ],

  RR_OFFICER: [
    'dashboard.view',
    'project.view',
    'project.view_financials',
    'project.view_documents',
    'parcel.view',
    'rr.view',
    'rr.create',
    'rr.update',
    'document.view',
    'notification.view',
  ],

  APPROVING_AUTHORITY: [
    'dashboard.view',
    'project.view',
    'project.change_status',
    'project.view_financials',
    'project.view_documents',
    'project.export',
    'parcel.view',
    'approval.view',
    'approval.approve',
    'approval.reject',
    'analytics.view',
    'report.generate',
    'notification.view',
  ],

  AUDITOR: [
    'dashboard.view',
    'project.view',
    'project.view_financials',
    'project.view_documents',
    'project.export',
    'parcel.view',
    'audit.view',
    'analytics.view',
    'report.generate',
    'document.view',
    'notification.view',
  ],

  CITIZEN: [
    'dashboard.view', // Restricted citizen view
    'parcel.view',    // Only public search
    'notification.view',
  ],
};

export const ROLE_DEFINITIONS: Role[] = [
  {
    id: 'role_super_admin',
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'National System Governance, RBAC delegation, cryptographic key custody, and multi-tenant oversight.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.SUPER_ADMIN,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_project_officer',
    name: 'PROJECT_OFFICER',
    displayName: 'Project Officer',
    description: 'Corridor planning, chainage alignment management, timeline monitoring, and multi-agency coordination.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.PROJECT_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_lao',
    name: 'LAND_ACQUISITION_OFFICER',
    displayName: 'Land Acquisition Officer (CALA / SLAO)',
    description: 'Competent Authority for Land Acquisition, statutory hearing conductor, Section 15 objection adjudicator.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.LAND_ACQUISITION_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_gis_officer',
    name: 'GIS_OFFICER',
    displayName: 'GIS & Remote Sensing Officer',
    description: 'Cadastral spatial layer management, RoW corridor alignment, drone orthomosaic rectification, GeoServer sync.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.GIS_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_survey_officer',
    name: 'SURVEY_OFFICER',
    displayName: 'Survey & Demarcation Officer',
    description: 'Field DGPS surveys, ETS pegging, Field Measurement Book (FMB) generation, and physical pegging verifications.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.SURVEY_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_finance_officer',
    name: 'FINANCE_OFFICER',
    displayName: 'Finance & Compensation Officer',
    description: 'Section 26-30 solatium calculations, escrow fund escrow, PFMS DBT direct benefit transfer execution.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.FINANCE_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_rr_officer',
    name: 'RR_OFFICER',
    displayName: 'Rehabilitation & Resettlement (R&R) Officer',
    description: 'Project Affected Family (PAF/PDF) census, Second Schedule entitlements, resettlement site allotment.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.RR_OFFICER,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_approving_authority',
    name: 'APPROVING_AUTHORITY',
    displayName: 'Approving Authority (Collector / Ministry)',
    description: 'District Collector or Ministry Sanctioning Authority for preliminary and final declaration gazettes.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.APPROVING_AUTHORITY,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_auditor',
    name: 'AUDITOR',
    displayName: 'Independent Statutory Auditor',
    description: 'CAG, CVC, and Vigilance oversight. Tamper-evident ledger inspection, discrepancy and fraud risk tracking.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.AUDITOR,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'role_citizen',
    name: 'CITIZEN',
    displayName: 'Citizen / Landowner',
    description: 'Landowner and public portal access for Section 15 objections, compensation status tracking, and notices.',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSION_MAPPING.CITIZEN,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

// Authorization Helpers
export function hasPermission(userPermissions: PermissionKey[] | undefined, permission: PermissionKey): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions: PermissionKey[] | undefined, permissions: PermissionKey[]): boolean {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: PermissionKey[] | undefined, permissions: PermissionKey[]): boolean {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}

export function hasRole(currentRole: UserRole | undefined, requiredRole: UserRole): boolean {
  return currentRole === requiredRole;
}

export function hasAnyRole(currentRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!currentRole) return false;
  return requiredRoles.includes(currentRole);
}
