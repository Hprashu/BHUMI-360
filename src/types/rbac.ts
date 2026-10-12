// ============================================================
// BHUMI 360 - RBAC & PERMISSION DEFINITIONS (PHASE 2)
// ============================================================

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
  // Dashboard
  | 'dashboard.view'
  // Projects
  | 'project.view'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'project.assign_officer'
  | 'project.change_status'
  | 'project.view_financials'
  | 'project.view_documents'
  | 'project.manage_documents'
  | 'project.link_parcels'
  | 'project.export'
  // Parcels
  | 'parcel.view'
  | 'parcel.create'
  | 'parcel.update'
  | 'parcel.delete'
  // GIS
  | 'gis.view'
  | 'gis.manage_layers'
  // Survey
  | 'survey.view'
  | 'survey.create'
  | 'survey.update'
  | 'survey.verify'
  // Approval
  | 'approval.view'
  | 'approval.approve'
  | 'approval.reject'
  // Compensation
  | 'compensation.view'
  | 'compensation.create'
  | 'compensation.update'
  | 'compensation.approve'
  // R&R
  | 'rr.view'
  | 'rr.create'
  | 'rr.update'
  // Document
  | 'document.view'
  | 'document.upload'
  | 'document.update'
  | 'document.delete'
  // Notification
  | 'notification.view'
  | 'notification.manage'
  // Analytics
  | 'analytics.view'
  | 'report.generate'
  // Audit
  | 'audit.view'
  // User Management
  | 'user.view'
  | 'user.create'
  | 'user.update'
  | 'user.deactivate'
  // Role Management
  | 'role.view'
  | 'role.manage'
  // Permission Directory
  | 'permission.view'
  // Department Management
  | 'department.view'
  | 'department.manage'
  // Integrations & System
  | 'integration.view'
  | 'integration.manage'
  | 'system.manage';

export interface Permission {
  id: string;
  key: PermissionKey;
  displayName: string;
  description: string;
  module: string;
  action: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
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

export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  roleId: UserRole;
  departmentId: string;
  departmentName?: string;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  role: Role;
  permissions: PermissionKey[];
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}
