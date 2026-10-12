// ============================================================
// BHUMI 360 - USER REPOSITORY (PHASE 2 MASTER SEED DATA)
// ============================================================
import { User } from '../types/rbac';

export const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    employeeCode: 'BHUMI-ADM-001',
    name: 'Satyajit Raychoudhury, IAS',
    email: 'admin@bhumi360.demo',
    phone: '+91 94370 12001',
    roleId: 'SUPER_ADMIN',
    departmentId: 'dept_dist_coll',
    departmentName: 'Office of the District Collector & District Magistrate',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 18:30 IST',
    createdAt: '2026-01-01',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_project',
    employeeCode: 'NHAI-PO-042',
    name: 'Er. Debabrata Mohapatra',
    email: 'project@bhumi360.demo',
    phone: '+91 98611 44521',
    roleId: 'PROJECT_OFFICER',
    departmentId: 'dept_nhai_piu',
    departmentName: 'NHAI Project Implementation Unit - Coastal Corridor',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 14:15 IST',
    createdAt: '2026-01-05',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_land',
    employeeCode: 'OAS-LAO-019',
    name: 'Dr. Bijay Ketan Patnaik, OAS (SAG)',
    email: 'land@bhumi360.demo',
    phone: '+91 94372 88410',
    roleId: 'LAND_ACQUISITION_OFFICER',
    departmentId: 'dept_cala_gjm',
    departmentName: 'Competent Authority for Land Acquisition (CALA) - Ganjam Desk',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 17:05 IST',
    createdAt: '2026-01-08',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_gis',
    employeeCode: 'GIS-ORSAC-088',
    name: 'Priyadarshini Sahu, M.Tech (Geoinformatics)',
    email: 'gis@bhumi360.demo',
    phone: '+91 94380 33119',
    roleId: 'GIS_OFFICER',
    departmentId: 'dept_survey_dir',
    departmentName: 'Directorate of Land Records, Surveys & Cadastral Mapping',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 16:45 IST',
    createdAt: '2026-01-10',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_survey',
    employeeCode: 'SURV-DK-104',
    name: 'Krushna Chandra Pradhan',
    email: 'survey@bhumi360.demo',
    phone: '+91 99371 90223',
    roleId: 'SURVEY_OFFICER',
    departmentId: 'dept_survey_dir',
    departmentName: 'Directorate of Land Records, Surveys & Cadastral Mapping',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 11:20 IST',
    createdAt: '2026-01-12',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_finance',
    employeeCode: 'OFS-FIN-031',
    name: 'Manoj Kumar Nayak, OFS (Sr. Class-I)',
    email: 'finance@bhumi360.demo',
    phone: '+91 94371 55609',
    roleId: 'FINANCE_OFFICER',
    departmentId: 'dept_finance_treasury',
    departmentName: 'Land Acquisition Treasury & Direct Benefit Transfer Cell',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 15:50 IST',
    createdAt: '2026-01-15',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_rr',
    employeeCode: 'OAS-RR-007',
    name: 'Ananya Tripathy, OAS-I',
    email: 'rr@bhumi360.demo',
    phone: '+91 98530 67123',
    roleId: 'RR_OFFICER',
    departmentId: 'dept_rr_cell',
    departmentName: 'Rehabilitation & Resettlement Directorate (R&R Desk)',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 13:00 IST',
    createdAt: '2026-01-18',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_authority',
    employeeCode: 'IAS-COLL-002',
    name: 'Divyajyoti Parida, IAS (Collector & DM)',
    email: 'authority@bhumi360.demo',
    phone: '+91 94370 00042',
    roleId: 'APPROVING_AUTHORITY',
    departmentId: 'dept_dist_coll',
    departmentName: 'Office of the District Collector & District Magistrate',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 18:00 IST',
    createdAt: '2026-01-05',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_audit',
    employeeCode: 'CAG-AUD-502',
    name: 'Subrat Kumar Das, IA&AS',
    email: 'audit@bhumi360.demo',
    phone: '+91 94373 11890',
    roleId: 'AUDITOR',
    departmentId: 'dept_dist_coll',
    departmentName: 'Office of the Principal Accountant General (Audit)',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 10:15 IST',
    createdAt: '2026-01-20',
    updatedAt: '2026-09-14',
  },
  {
    id: 'usr_citizen',
    employeeCode: 'CITIZEN-PCL-00421',
    name: 'Ramesh Chandra Behera (Khatiyan Owner)',
    email: 'citizen@bhumi360.demo',
    phone: '+91 94374 77890',
    roleId: 'CITIZEN',
    departmentId: 'dept_cala_gjm',
    departmentName: 'Beneficiary & Citizen Grievance Portal',
    status: 'ACTIVE',
    lastLoginAt: '2026-09-14 09:30 IST',
    createdAt: '2026-02-01',
    updatedAt: '2026-09-14',
  },
];

class UserRepository {
  private users: User[];

  constructor() {
    const cached = localStorage.getItem('bhumi360_users');
    if (cached) {
      try {
        this.users = JSON.parse(cached);
      } catch {
        this.users = [...SEED_USERS];
      }
    } else {
      this.users = [...SEED_USERS];
      this.persist();
    }
  }

  private persist() {
    try {
      localStorage.setItem('bhumi360_users', JSON.stringify(this.users));
    } catch {
      // safe fallback
    }
  }

  async getAll(): Promise<User[]> {
    return [...this.users];
  }

  async getById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    return (
      this.users.find(
        (u) =>
          u.email.toLowerCase() === normalized ||
          u.employeeCode.toLowerCase() === normalized
      ) || null
    );
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.users.push(newUser);
    this.persist();
    return newUser;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.persist();
    return this.users[index];
  }

  async updateStatus(id: string, status: User['status']): Promise<User | null> {
    return this.update(id, { status });
  }

  async updateLastLogin(id: string): Promise<void> {
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    await this.update(id, { lastLoginAt: dateStr });
  }
}

export const userRepository = new UserRepository();
