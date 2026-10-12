export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROJECT_OFFICER'
  | 'LAND_ACQUISITION_OFFICER'
  | 'GIS_OFFICER'
  | 'SURVEY_OFFICER'
  | 'FINANCE_OFFICER'
  | 'RR_OFFICER'
  | 'APPROVING_AUTHORITY'
  | 'AUDITOR'
  | 'CITIZEN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type PermissionKey =
  | 'dashboard.view'
  | 'project.view'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'parcel.view'
  | 'parcel.create'
  | 'parcel.update'
  | 'parcel.delete'
  | 'gis.view'
  | 'gis.manage_layers'
  | 'survey.view'
  | 'survey.create'
  | 'survey.update'
  | 'survey.verify'
  | 'approval.view'
  | 'approval.approve'
  | 'approval.reject'
  | 'compensation.view'
  | 'compensation.create'
  | 'compensation.update'
  | 'compensation.approve'
  | 'rr.view'
  | 'rr.create'
  | 'rr.update'
  | 'document.view'
  | 'document.upload'
  | 'document.update'
  | 'document.delete'
  | 'notification.view'
  | 'notification.manage'
  | 'analytics.view'
  | 'report.generate'
  | 'audit.view'
  | 'user.view'
  | 'user.create'
  | 'user.update'
  | 'user.deactivate'
  | 'role.view'
  | 'role.manage'
  | 'permission.view'
  | 'department.view'
  | 'department.manage'
  | 'integration.view'
  | 'integration.manage'
  | 'system.manage';

export interface PermissionDefinition {
  id: string;
  key: PermissionKey;
  displayName: string;
  description: string;
  module:
    | 'dashboard'
    | 'project'
    | 'parcel'
    | 'gis'
    | 'survey'
    | 'approval'
    | 'compensation'
    | 'rr'
    | 'document'
    | 'notification'
    | 'analytics'
    | 'audit'
    | 'user'
    | 'role'
    | 'permission'
    | 'department'
    | 'integration'
    | 'system';
  action: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  state: string;
  district: string;
  status: 'ACTIVE' | 'INACTIVE';
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  roleId: string;
  roleDisplayName: string;
  departmentId: string;
  departmentName: string;
  status: UserStatus;
  lastLoginAt?: string;
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDefinition {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: PermissionKey[];
  assignedUsersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresAt: string;
}

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  requestId: string;
  ipAddressMasked: string;
  integrityHash: string;
  metadata?: Record<string, unknown>;
}
