// ============================================================
// BHUMI 360 - CENTRALIZED API CLIENT & DOMAIN APIS (PHASE 2)
// Clean separation of concerns between React views & backend services
// ============================================================
import { authService } from './authService';
import { userRepository } from '../repositories/userRepository';
import { departmentRepository } from '../repositories/departmentRepository';
import { auditRepository } from '../repositories/auditRepository';
import { projectRepository, ProjectFilters, CreateProjectInput, UpdateProjectInput } from '../repositories/projectRepository';
import { ALL_PERMISSIONS, ROLE_DEFINITIONS } from '../lib/permissions';
import { Department, Permission, Role, User, UserRole, UserStatus } from '../types/rbac';
import { AuditEvent, Project, ProjectDocument, ProjectLifecycleEvent, ProjectStatus } from '../types';
import { validateCreateUser, validateUpdateUser, validateCreateDepartment } from '../lib/validation';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 1. Auth API
export const authApi = {
  async login(email: string, password?: string, rememberMe?: boolean) {
    return authService.login({ email, password, rememberMe });
  },
  async logout() {
    return authService.logout();
  },
  getCurrentUser() {
    return authService.getCurrentUser();
  },
  getCurrentSession() {
    return authService.getCurrentSession();
  },
};

// 2. User API
export const userApi = {
  async getAll(): Promise<ApiResponse<User[]>> {
    if (!authService.hasPermission('user.view')) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to view the user directory.' },
      };
    }
    const users = await userRepository.getAll();
    return { success: true, data: users };
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    if (!authService.hasPermission('user.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } };
    }
    const user = await userRepository.getById(id);
    if (!user) return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
    return { success: true, data: user };
  },

  async create(payload: unknown): Promise<ApiResponse<User>> {
    if (!authService.hasPermission('user.create')) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Super Admin or authorized officer role required to provision users.' },
      };
    }

    const validation = validateCreateUser(payload);
    if (!validation.success) {
      return {
        success: false,
        error: { code: 'VALIDATION_FAILED', message: validation.errors?.[0]?.message || 'Validation error', details: validation.errors },
      };
    }

    const newUser = await userRepository.create(validation.data!);
    const current = authService.getCurrentUser();
    await auditRepository.logEvent({
      actor: current?.name || 'ADMIN',
      role: current?.roleId || 'SUPER_ADMIN',
      action: 'USER_CREATED',
      entity: 'USER_ACCOUNT',
      entityId: newUser.employeeCode,
      newValue: `Account created for ${newUser.name} (${newUser.roleId}) in department ${newUser.departmentId}`,
    });

    return { success: true, data: newUser };
  },

  async update(id: string, payload: unknown): Promise<ApiResponse<User>> {
    if (!authService.hasPermission('user.update')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission user.update required.' } };
    }

    const validation = validateUpdateUser(payload);
    if (!validation.success) {
      return {
        success: false,
        error: { code: 'VALIDATION_FAILED', message: validation.errors?.[0]?.message || 'Validation error' },
      };
    }

    const updated = await userRepository.update(id, validation.data!);
    if (!updated) return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };

    const current = authService.getCurrentUser();
    await auditRepository.logEvent({
      actor: current?.name || 'ADMIN',
      role: current?.roleId || 'SUPER_ADMIN',
      action: 'USER_UPDATED',
      entity: 'USER_ACCOUNT',
      entityId: updated.employeeCode,
      newValue: `Updated profile attributes for ${updated.name}`,
    });

    return { success: true, data: updated };
  },

  async setStatus(id: string, status: UserStatus): Promise<ApiResponse<User>> {
    if (!authService.hasPermission('user.deactivate')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission user.deactivate required.' } };
    }

    const updated = await userRepository.updateStatus(id, status);
    if (!updated) return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };

    const current = authService.getCurrentUser();
    await auditRepository.logEvent({
      actor: current?.name || 'ADMIN',
      role: current?.roleId || 'SUPER_ADMIN',
      action: status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'USER_ACCOUNT',
      entityId: updated.employeeCode,
      newValue: `Status changed to ${status}`,
    });

    return { success: true, data: updated };
  },

  async toggleStatus(id: string): Promise<ApiResponse<User>> {
    const user = await userRepository.getById(id);
    if (!user) return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.setStatus(id, nextStatus);
  },
};

// 3. Role API
export const roleApi = {
  async getAll(): Promise<ApiResponse<Role[]>> {
    if (!authService.hasPermission('role.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission role.view required.' } };
    }
    return { success: true, data: ROLE_DEFINITIONS };
  },

  async getByName(roleName: UserRole): Promise<ApiResponse<Role>> {
    const role = ROLE_DEFINITIONS.find((r) => r.name === roleName);
    if (!role) return { success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } };
    return { success: true, data: role };
  },
};

// 4. Permission API
export const permissionApi = {
  async getAll(): Promise<ApiResponse<Permission[]>> {
    if (!authService.hasPermission('permission.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission permission.view required.' } };
    }
    return { success: true, data: ALL_PERMISSIONS };
  },
};

// 5. Department API
export const departmentApi = {
  async getAll(): Promise<ApiResponse<Department[]>> {
    if (!authService.hasPermission('department.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission department.view required.' } };
    }
    const depts = await departmentRepository.getAll();
    return { success: true, data: depts };
  },

  async create(payload: unknown): Promise<ApiResponse<Department>> {
    if (!authService.hasPermission('department.manage')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission department.manage required.' } };
    }

    const validation = validateCreateDepartment(payload);
    if (!validation.success) {
      return { success: false, error: { code: 'VALIDATION_FAILED', message: validation.errors?.[0]?.message || 'Validation error' } };
    }

    const newDept = await departmentRepository.create(validation.data!);
    const current = authService.getCurrentUser();
    await auditRepository.logEvent({
      actor: current?.name || 'ADMIN',
      role: current?.roleId || 'SUPER_ADMIN',
      action: 'DEPARTMENT_CREATED',
      entity: 'DEPARTMENT',
      entityId: newDept.code,
      newValue: `Created department ${newDept.name} in ${newDept.district}, ${newDept.state}`,
    });

    return { success: true, data: newDept };
  },
};

// 6. Audit API
export const auditApi = {
  async getAll(): Promise<ApiResponse<AuditEvent[]>> {
    if (!authService.hasPermission('audit.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission audit.view required.' } };
    }
    const logs = await auditRepository.getAll();
    return { success: true, data: logs };
  },
};

// 7. GIS & Spatial API (PostGIS Ready)
export const gisApi = {
  async getLayers() {
    return {
      success: true,
      data: [
        { id: 'parcels', name: 'Cadastral Land Parcels (Survey Numbers)', enabled: true, type: 'vector', opacity: 0.9 },
        { id: 'corridorAlignment', name: 'NHAI / Corridor Right of Way (RoW)', enabled: true, type: 'linear', opacity: 1.0 },
        { id: 'bufferZone', name: 'Statutory 100m Impact & Buffer Zone', enabled: true, type: 'buffer', opacity: 0.35 },
        { id: 'surveyNumbers', name: 'Survey Numbers & Centroid Labels', enabled: true, type: 'label', opacity: 1.0 },
        { id: 'disputedHighlights', name: 'Litigation & Encroachment Overlay', enabled: true, type: 'alert', opacity: 0.8 },
      ],
    };
  },

  async getParcels(filter?: { projectId?: string; search?: string; status?: string }) {
    if (!authService.hasPermission('gis.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission gis.view required.' } };
    }
    const { DataService } = await import('./dataService');
    const parcels = await DataService.getParcels(filter);
    return { success: true, data: parcels };
  },

  async getParcelById(id: string) {
    if (!authService.hasPermission('gis.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission gis.view required.' } };
    }
    const { DataService } = await import('./dataService');
    const parcel = await DataService.getParcelById(id);
    if (!parcel) return { success: false, error: { code: 'NOT_FOUND', message: 'Parcel not found in cadastral database.' } };
    return { success: true, data: parcel };
  },

  async updatePolygon(id: string, polygonPoints: [number, number][]) {
    if (!authService.hasPermission('gis.manage_layers')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission gis.manage_layers required.' } };
    }
    const current = authService.getCurrentUser();
    await auditRepository.logEvent({
      actor: current?.name || 'GIS_OFFICER',
      role: current?.roleId || 'GIS_OFFICER',
      action: 'SPATIAL_GEOMETRY_AMENDED',
      entity: 'PARCEL_POLYGON',
      entityId: id,
      newValue: `Updated boundary polygon with ${polygonPoints.length} georeferenced coordinates`,
    });
    return { success: true, data: { id, polygonPoints } };
  },
};

// ============================================================
// 8. Project Management API (Phase 3)
// Enforces RBAC permissions and coordinates with projectRepository
// ============================================================
export const projectApi = {
  async getAll(filters?: ProjectFilters): Promise<ApiResponse<{ projects: Project[]; total: number; page: number; limit: number }>> {
    if (!authService.hasPermission('project.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view required to list projects.' } };
    }
    const result = projectRepository.getAll(filters);
    return { success: true, data: result };
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    if (!authService.hasPermission('project.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view required to view project details.' } };
    }
    const proj = projectRepository.getById(id);
    if (!proj) {
      return { success: false, error: { code: 'NOT_FOUND', message: `Project with ID '${id}' was not found.` } };
    }
    return { success: true, data: proj };
  },

  async create(payload: CreateProjectInput): Promise<ApiResponse<Project>> {
    if (!authService.hasPermission('project.create')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.create required to register a new project.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.create(payload, current?.id || 'system_user');
    if (!result.success || !result.project) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: result.error || 'Failed to create project.' } };
    }
    return { success: true, data: result.project };
  },

  async update(id: string, payload: UpdateProjectInput): Promise<ApiResponse<Project>> {
    if (!authService.hasPermission('project.update')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.update required to modify project details.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.update(id, payload, current?.id || 'system_user');
    if (!result.success || !result.project) {
      return { success: false, error: { code: 'UPDATE_FAILED', message: result.error || 'Failed to update project.' } };
    }
    return { success: true, data: result.project };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (!authService.hasPermission('project.delete')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Super Admin or authorized authority required to archive projects.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.delete(id, current?.id || 'system_user');
    if (!result.success) {
      return { success: false, error: { code: 'DELETE_FAILED', message: result.error || 'Failed to delete project.' } };
    }
    return { success: true, data: true };
  },

  async changeStatus(
    id: string,
    newStatus: ProjectStatus,
    reason: string,
    remarks?: string
  ): Promise<ApiResponse<Project>> {
    if (!authService.hasPermission('project.change_status')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.change_status required to transition lifecycle stages.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.changeStatus(
      id,
      newStatus,
      reason,
      remarks,
      {
        id: current?.id || 'usr-anon',
        name: current?.name || 'Authorized Officer',
        role: current?.roleId || 'OFFICER',
      }
    );
    if (!result.success || !result.project) {
      return { success: false, error: { code: 'INVALID_TRANSITION', message: result.error || 'Failed to transition status.' } };
    }
    return { success: true, data: result.project };
  },

  async getTimeline(id: string): Promise<ApiResponse<ProjectLifecycleEvent[]>> {
    if (!authService.hasPermission('project.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view required.' } };
    }
    const events = projectRepository.getTimeline(id);
    return { success: true, data: events };
  },

  async getParcels(id: string) {
    if (!authService.hasPermission('project.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view required.' } };
    }
    const parcels = projectRepository.getParcels(id);
    return { success: true, data: parcels };
  },

  async linkParcel(projectId: string, parcelId: string): Promise<ApiResponse<boolean>> {
    if (!authService.hasPermission('project.link_parcels')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.link_parcels required.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.linkParcel(projectId, parcelId, current?.id);
    if (!result.success) {
      return { success: false, error: { code: 'LINK_FAILED', message: result.error || 'Failed to link parcel.' } };
    }
    return { success: true, data: true };
  },

  async unlinkParcel(projectId: string, parcelId: string): Promise<ApiResponse<boolean>> {
    if (!authService.hasPermission('project.link_parcels')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.link_parcels required.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.unlinkParcel(projectId, parcelId, current?.id);
    if (!result.success) {
      return { success: false, error: { code: 'UNLINK_FAILED', message: result.error || 'Failed to unlink parcel.' } };
    }
    return { success: true, data: true };
  },

  async getDocuments(projectId: string): Promise<ApiResponse<ProjectDocument[]>> {
    if (!authService.hasPermission('project.view_documents')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view_documents required to view the document vault.' } };
    }
    const docs = projectRepository.getDocuments(projectId);
    return { success: true, data: docs };
  },

  async addDocument(
    projectId: string,
    docData: { name: string; documentType: string; description?: string; fileSize?: string }
  ): Promise<ApiResponse<ProjectDocument>> {
    if (!authService.hasPermission('project.manage_documents')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.manage_documents required to upload to document vault.' } };
    }
    const current = authService.getCurrentUser();
    const result = projectRepository.addDocument(projectId, docData, {
      id: current?.id || 'usr-anon',
      name: current?.name || 'Project Officer',
      role: current?.roleId || 'PROJECT_OFFICER',
    });
    if (!result.success || !result.document) {
      return { success: false, error: { code: 'UPLOAD_FAILED', message: result.error || 'Failed to upload document.' } };
    }
    return { success: true, data: result.document };
  },

  async getKPIs() {
    if (!authService.hasPermission('project.view')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Permission project.view required.' } };
    }
    const kpis = projectRepository.getKPIs();
    return { success: true, data: kpis };
  },
};
