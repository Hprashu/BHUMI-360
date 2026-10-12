// ============================================================
// BHUMI 360 - DEPARTMENT REPOSITORY (STATE-AGNOSTIC)
// ============================================================
import { Department } from '../types/rbac';

const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept_cala_gjm',
    code: 'CALA-GJM-01',
    name: 'Competent Authority for Land Acquisition (CALA) - Ganjam Desk',
    description: 'Statutory land acquisition hearings, notifications, and compensation awards under Section 3G NH Act / RFCTLARR Act 2013.',
    state: 'Odisha',
    district: 'Ganjam',
    status: 'ACTIVE',
    userCount: 3,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'dept_nhai_piu',
    code: 'NHAI-PIU-BBSR',
    name: 'NHAI Project Implementation Unit - Coastal Corridor',
    description: 'Corridor right-of-way planning, alignment design, chainage progression, and executing agency coordination.',
    state: 'Odisha',
    district: 'Khordha',
    status: 'ACTIVE',
    userCount: 4,
    createdAt: '2026-01-12',
    updatedAt: '2026-01-12',
  },
  {
    id: 'dept_survey_dir',
    code: 'REV-SURVEY-DK',
    name: 'Directorate of Land Records, Surveys & Cadastral Mapping',
    description: 'Ground DGPS surveys, Electronic Total Station pegging, drone orthomosaics, and Field Measurement Book (FMB) verification.',
    state: 'Odisha',
    district: 'Ganjam',
    status: 'ACTIVE',
    userCount: 5,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dept_finance_treasury',
    code: 'FIN-REV-DISB',
    name: 'Land Acquisition Treasury & Direct Benefit Transfer Cell',
    description: 'Section 26-30 market solatium valuation calculations, escrow accounting, and PFMS Direct Benefit Transfer (DBT) disbursement.',
    state: 'Odisha',
    district: 'Ganjam',
    status: 'ACTIVE',
    userCount: 2,
    createdAt: '2026-01-18',
    updatedAt: '2026-01-18',
  },
  {
    id: 'dept_rr_cell',
    code: 'RR-COMM-CELL',
    name: 'Rehabilitation & Resettlement Directorate (R&R Desk)',
    description: 'Second Schedule family entitlement census, resettlement site allotment, subsistence grants, and livelihood restoration.',
    state: 'Odisha',
    district: 'Ganjam',
    status: 'ACTIVE',
    userCount: 2,
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
  {
    id: 'dept_dist_coll',
    code: 'DIST-COLL-OFF',
    name: 'Office of the District Collector & District Magistrate',
    description: 'District Sanctioning Authority for preliminary declarations, dispute adjudication, and inter-departmental taskforce reviews.',
    state: 'Odisha',
    district: 'Ganjam',
    status: 'ACTIVE',
    userCount: 2,
    createdAt: '2026-01-05',
    updatedAt: '2026-01-05',
  },
];

class DepartmentRepository {
  private departments: Department[];

  constructor() {
    const cached = localStorage.getItem('bhumi360_departments');
    if (cached) {
      try {
        this.departments = JSON.parse(cached);
      } catch {
        this.departments = [...SEED_DEPARTMENTS];
      }
    } else {
      this.departments = [...SEED_DEPARTMENTS];
      this.persist();
    }
  }

  private persist() {
    try {
      localStorage.setItem('bhumi360_departments', JSON.stringify(this.departments));
    } catch {
      // safe fallback
    }
  }

  async getAll(): Promise<Department[]> {
    return [...this.departments];
  }

  async getById(id: string): Promise<Department | null> {
    return this.departments.find((d) => d.id === id) || null;
  }

  async create(dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'userCount' | 'status'> & { status?: 'ACTIVE' | 'INACTIVE' }): Promise<Department> {
    const newDept: Department = {
      ...dept,
      status: dept.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      id: `dept_${Date.now()}`,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.departments.push(newDept);
    this.persist();
    return newDept;
  }

  async update(id: string, updates: Partial<Department>): Promise<Department | null> {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    this.departments[index] = {
      ...this.departments[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.persist();
    return this.departments[index];
  }
}

export const departmentRepository = new DepartmentRepository();
