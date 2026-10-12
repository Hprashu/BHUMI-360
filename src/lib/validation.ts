// ============================================================
// BHUMI 360 - REQUEST SCHEMA VALIDATION ENGINE
// Enterprise Input Validation for Auth, Users, Roles & Data
// ============================================================
import { UserRole, UserStatus } from '../types/rbac';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationErrorDetail[];
}

// 1. Login Credentials Validation
export interface LoginPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export function validateLogin(payload: unknown): ValidationResult<LoginPayload> {
  const errors: ValidationErrorDetail[] = [];
  if (!payload || typeof payload !== 'object') {
    return { success: false, errors: [{ field: 'root', message: 'Invalid payload structure' }] };
  }

  const p = payload as Record<string, unknown>;
  const email = typeof p.email === 'string' ? p.email.trim() : '';

  if (!email) {
    errors.push({ field: 'email', message: 'Email or official user identifier is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/^[a-zA-Z0-9._-]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email or employee username format' });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? { email, password: String(p.password || ''), rememberMe: Boolean(p.rememberMe) } : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// 2. User Creation Validation
export interface CreateUserPayload {
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  roleId: UserRole;
  departmentId: string;
}

export function validateCreateUser(payload: unknown): ValidationResult<CreateUserPayload> {
  const errors: ValidationErrorDetail[] = [];
  if (!payload || typeof payload !== 'object') {
    return { success: false, errors: [{ field: 'root', message: 'Invalid payload' }] };
  }

  const p = payload as Record<string, unknown>;

  if (!p.employeeCode || typeof p.employeeCode !== 'string' || p.employeeCode.trim().length < 3) {
    errors.push({ field: 'employeeCode', message: 'Employee code must be at least 3 characters' });
  }

  if (!p.name || typeof p.name !== 'string' || p.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name must be at least 2 characters' });
  }

  if (!p.email || typeof p.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    errors.push({ field: 'email', message: 'Valid official email address is required' });
  }

  if (!p.phone || typeof p.phone !== 'string' || !/^\+?[0-9]{10,13}$/.test(p.phone.replace(/[\s-]/g, ''))) {
    errors.push({ field: 'phone', message: 'Valid 10-digit phone number is required' });
  }

  const validRoles: UserRole[] = [
    'SUPER_ADMIN', 'PROJECT_OFFICER', 'LAND_ACQUISITION_OFFICER', 'GIS_OFFICER',
    'SURVEY_OFFICER', 'FINANCE_OFFICER', 'RR_OFFICER', 'APPROVING_AUTHORITY', 'AUDITOR', 'CITIZEN'
  ];
  if (!p.roleId || !validRoles.includes(p.roleId as UserRole)) {
    errors.push({ field: 'roleId', message: 'Valid institutional role designation must be selected' });
  }

  if (!p.departmentId || typeof p.departmentId !== 'string') {
    errors.push({ field: 'departmentId', message: 'Department assignment is mandatory' });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? (p as unknown as CreateUserPayload) : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// 3. User Update Validation
export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  roleId?: UserRole;
  departmentId?: string;
  status?: UserStatus;
}

export function validateUpdateUser(payload: unknown): ValidationResult<UpdateUserPayload> {
  const errors: ValidationErrorDetail[] = [];
  if (!payload || typeof payload !== 'object') {
    return { success: false, errors: [{ field: 'root', message: 'Invalid payload' }] };
  }

  const p = payload as Record<string, unknown>;

  if (p.name !== undefined && (typeof p.name !== 'string' || p.name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (p.phone !== undefined && (typeof p.phone !== 'string' || !/^\+?[0-9]{10,13}$/.test(p.phone.replace(/[\s-]/g, '')))) {
    errors.push({ field: 'phone', message: 'Valid 10-digit phone number is required' });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? (p as unknown as UpdateUserPayload) : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// 4. Department Creation Validation
export interface CreateDepartmentPayload {
  code: string;
  name: string;
  description: string;
  state: string;
  district: string;
}

export function validateCreateDepartment(payload: unknown): ValidationResult<CreateDepartmentPayload> {
  const errors: ValidationErrorDetail[] = [];
  if (!payload || typeof payload !== 'object') {
    return { success: false, errors: [{ field: 'root', message: 'Invalid payload' }] };
  }

  const p = payload as Record<string, unknown>;

  if (!p.code || typeof p.code !== 'string' || p.code.trim().length < 2) {
    errors.push({ field: 'code', message: 'Department code must be at least 2 characters' });
  }

  if (!p.name || typeof p.name !== 'string' || p.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Department name must be at least 3 characters' });
  }

  if (!p.state || typeof p.state !== 'string') {
    errors.push({ field: 'state', message: 'State jurisdiction is required' });
  }

  if (!p.district || typeof p.district !== 'string') {
    errors.push({ field: 'district', message: 'District jurisdiction is required' });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? (p as unknown as CreateDepartmentPayload) : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}
