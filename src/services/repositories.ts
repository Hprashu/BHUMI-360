import { AuthUser, Department, PermissionDefinition, RoleDefinition, UserRole } from '../types/auth';
import { ALL_PERMISSIONS, DEFINED_ROLES, ROLE_PERMISSION_MATRIX } from '../data/permissionMatrix';
import { INITIAL_USERS, SEED_DEPARTMENTS } from '../data/seedData';
import { DEMO_PARCELS, DEMO_PROJECTS } from '../data/mockData';
import { Parcel, Project } from '../types';

// Central in-memory & local-persisted repository layer
class DepartmentRepository {
  private departments: Department[] = [];

  constructor() {
    const stored = localStorage.getItem('bhumi360_departments');
    if (stored) {
      this.departments = JSON.parse(stored);
    } else {
      this.departments = [...SEED_DEPARTMENTS];
      localStorage.setItem('bhumi360_departments', JSON.stringify(this.departments));
    }
  }

  public getAll(): Department[] {
    return [...this.departments];
  }

  public getById(id: string): Department | undefined {
    return this.departments.find((d) => d.id === id);
  }

  public create(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Department {
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.departments.push(newDept);
    localStorage.setItem('bhumi360_departments', JSON.stringify(this.departments));
    return newDept;
  }
}

class RoleRepository {
  private roles: RoleDefinition[] = [...DEFINED_ROLES];

  public getAll(): RoleDefinition[] {
    return [...this.roles];
  }

  public getByName(name: UserRole): RoleDefinition | undefined {
    return this.roles.find((r) => r.name === name);
  }

  public updatePermissions(roleName: UserRole, permissions: string[]): RoleDefinition {
    const role = this.roles.find((r) => r.name === roleName);
    if (!role) throw new Error('Role not found');
    role.permissions = permissions as any;
    role.updatedAt = new Date().toISOString();
    return role;
  }
}

class PermissionRepository {
  public getAll(): PermissionDefinition[] {
    return [...ALL_PERMISSIONS];
  }

  public getByModule(moduleName: string): PermissionDefinition[] {
    return ALL_PERMISSIONS.filter((p) => p.module === moduleName);
  }
}

class ProjectRepository {
  public getAll(): Project[] {
    return [...DEMO_PROJECTS];
  }

  public getById(id: string): Project | undefined {
    return DEMO_PROJECTS.find((p) => p.id === id || p.code === id);
  }
}

class ParcelRepository {
  public getAll(): Parcel[] {
    return [...DEMO_PARCELS];
  }

  public getById(id: string): Parcel | undefined {
    return DEMO_PARCELS.find((p) => p.id === id || p.parcelCode === id);
  }

  public getByProjectId(projectId: string): Parcel[] {
    return DEMO_PARCELS.filter((p) => p.projectId === projectId);
  }
}

class GISRepository {
  public getDataSources() {
    return [
      {
        id: 'ds-osm',
        name: 'OpenStreetMap Standard Carto',
        type: 'OPENSTREETMAP',
        baseUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        status: 'CONNECTED',
        description: 'Global basemap cartography (NOT an official cadastral boundary source).',
      },
      {
        id: 'ds-bhuvan',
        name: 'ISRO Bhuvan High-Resolution Satellite',
        type: 'WMS',
        baseUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
        status: 'CONNECTED',
        description: 'National remote sensing optical imagery and digital elevation models.',
      },
      {
        id: 'ds-cadastral-wfs',
        name: 'National Cadastral GeoServer (PostGIS)',
        type: 'WFS',
        baseUrl: 'https://geoserver.bhumi.gov.in/geoserver/wfs',
        status: 'CONNECTED',
        description: 'Authoritative state boundary shapefiles and georeferenced survey plots.',
      },
      {
        id: 'ds-drone',
        name: 'Drone Orthomosaic GeoTIFF Vault',
        type: 'GEOJSON_API',
        baseUrl: 'https://storage.bhumi.gov.in/ortho-mosaics',
        status: 'CONNECTED',
        description: 'Centimeter-precision UAV orthophoto mosaics for JMS verification.',
      },
    ];
  }
}

export const departmentRepository = new DepartmentRepository();
export const roleRepository = new RoleRepository();
export const permissionRepository = new PermissionRepository();
export const projectRepository = new ProjectRepository();
export const parcelRepository = new ParcelRepository();
export const gisRepository = new GISRepository();
