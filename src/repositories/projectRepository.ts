// ============================================================
// BHUMI 360 - PROJECT REPOSITORY (PHASE 3)
// Full state-agnostic persistence layer with in-memory & localStorage fallback
// ============================================================

import { DEMO_PARCELS, DEMO_PROJECTS } from '../data/mockData';
import { canTransitionStatus, calculateProjectHealth } from '../lib/projectHealth';
import { auditRepository } from './auditRepository';
import {
  Parcel,
  Project,
  ProjectDocument,
  ProjectLifecycleEvent,
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from '../types';

const STORAGE_KEY = 'bhumi360_projects_v3';
const DOCUMENTS_STORAGE_KEY = 'bhumi360_project_documents_v3';

export interface ProjectFilters {
  status?: string;
  priority?: string;
  projectType?: string;
  departmentId?: string;
  state?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProjectInput {
  projectCode: string;
  projectName: string;
  description: string;
  projectType: ProjectType;
  departmentId?: string;
  state: string;
  district: string;
  subDistrict: string;
  village?: string;
  locationDescription?: string;
  implementingAgency: string;
  projectOfficerId?: string;
  leadOfficer?: string;
  startDate: string;
  expectedCompletionDate: string;
  priority: ProjectPriority;
  initialStatus?: ProjectStatus;
  estimatedCost?: number;
  landRequiredArea: number;
  totalParcelsRequired: number;
  compensationBudget?: number;
  rrBudget?: number;
}

export interface UpdateProjectInput {
  projectName?: string;
  description?: string;
  projectType?: ProjectType;
  departmentId?: string;
  state?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
  locationDescription?: string;
  implementingAgency?: string;
  projectOfficerId?: string;
  leadOfficer?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  priority?: ProjectPriority;
  estimatedCost?: number;
  landRequiredArea?: number;
  totalParcelsRequired?: number;
  compensationBudget?: number;
  rrBudget?: number;
}

class ProjectRepository {
  private projects: Project[] = [];
  private documentsMap: Record<string, ProjectDocument[]> = {};

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // 1. Initialize projects from localStorage or mockData
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        this.projects = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse cached projects, resetting to defaults.', e);
        this.projects = this.seedDefaults();
      }
    } else {
      this.projects = this.seedDefaults();
      this.saveProjects();
    }

    // 2. Initialize project documents
    const storedDocs = typeof window !== 'undefined' ? localStorage.getItem(DOCUMENTS_STORAGE_KEY) : null;
    if (storedDocs) {
      try {
        this.documentsMap = JSON.parse(storedDocs);
      } catch (e) {
        console.warn('Failed to parse cached project documents, resetting to defaults.', e);
        this.documentsMap = this.seedDefaultDocuments();
      }
    } else {
      this.documentsMap = this.seedDefaultDocuments();
      this.saveDocuments();
    }
  }

  private seedDefaults(): Project[] {
    return DEMO_PROJECTS.map((p, idx) => {
      const pType = (p.type || 'NATIONAL_HIGHWAY') as ProjectType;
      const pStatus = (p.status === 'ACTIVE' ? 'ACQUISITION_IN_PROGRESS' : p.status === 'DELAYED' ? 'SURVEY' : 'PLANNING') as ProjectStatus;
      const pPriority: ProjectPriority = idx === 0 ? 'CRITICAL' : idx === 1 ? 'HIGH' : idx === 2 ? 'MEDIUM' : 'LOW';
      const code = p.code || `PRJ-${idx + 100}`;
      const name = p.name || `Corridor Project ${code}`;

      const events: ProjectLifecycleEvent[] = [
        {
          id: `evt-init-${p.id}`,
          projectId: p.id,
          previousStatus: 'DRAFT',
          newStatus: 'PLANNING',
          changedBy: 'P.O. Rajesh Sharma',
          changedAt: '2025-01-10T10:00:00.000Z',
          reason: 'Project corridor initiated and statutory scheme approved.',
          remarks: 'Approved by State Infrastructure Steering Committee.',
        },
        {
          id: `evt-stage2-${p.id}`,
          projectId: p.id,
          previousStatus: 'PLANNING',
          newStatus: 'LAND_IDENTIFICATION',
          changedBy: 'Dr. Arvinder Singh (CALA)',
          changedAt: '2025-02-15T14:30:00.000Z',
          reason: 'Corridor alignment pinned and Section 11 preliminary notification initiated.',
          remarks: 'Gazette notice dispatched for verification.',
        },
        {
          id: `evt-stage3-${p.id}`,
          projectId: p.id,
          previousStatus: 'LAND_IDENTIFICATION',
          newStatus: pStatus,
          changedBy: 'Dr. Arvinder Singh (CALA)',
          changedAt: '2025-05-20T11:15:00.000Z',
          reason: 'Statutory milestone transition into active execution.',
          remarks: 'DGPS survey field books consolidated and verification ongoing.',
        },
      ];

      return {
        ...p,
        projectCode: code,
        code: code,
        projectName: name,
        name: name,
        projectType: pType,
        type: pType,
        status: pStatus,
        priority: pPriority,
        landRequiredArea: p.totalAreaAcres || 1200,
        totalAreaAcres: p.totalAreaAcres || 1200,
        totalParcelsRequired: p.parcelsCount || 300,
        parcelsCount: p.parcelsCount || 300,
        acquiredParcels: p.acquiredParcelsCount || 0,
        acquiredParcelsCount: p.acquiredParcelsCount || 0,
        pendingParcels: p.pendingParcelsCount || 0,
        pendingParcelsCount: p.pendingParcelsCount || 0,
        compensationBudget: p.compensationBudgetCr || 50,
        compensationBudgetCr: p.compensationBudgetCr || 50,
        compensationPaid: p.compensationDisbursedCr || 0,
        compensationDisbursedCr: p.compensationDisbursedCr || 0,
        rrBudget: 15.5,
        rrSpent: 8.2,
        progressPercentage: p.progressPercent || 50,
        progressPercent: p.progressPercent || 50,
        expectedCompletionDate: p.targetCompletion || '31 Dec 2026',
        targetCompletion: p.targetCompletion || '31 Dec 2026',
        implementingAgency: p.nodalAgency || 'National Infrastructure Directorate',
        nodalAgency: p.nodalAgency || 'National Infrastructure Directorate',
        leadOfficer: p.leadOfficer || 'Project Executive Officer',
        lifecycleEvents: events,
      };
    });
  }

  private seedDefaultDocuments(): Record<string, ProjectDocument[]> {
    const docs: Record<string, ProjectDocument[]> = {};

    this.projects.forEach((proj) => {
      docs[proj.id] = [
        {
          id: `doc-${proj.id}-1`,
          projectId: proj.id,
          name: `${proj.projectCode || proj.code}_Gazette_Section_11.pdf`,
          documentType: 'Statutory Gazette Notification (Sec 11)',
          uploadedBy: 'Dr. Arvinder Singh (CALA)',
          uploadedAt: '2025-02-16 11:30 IST',
          status: 'VERIFIED',
          fileSize: '4.2 MB',
          description: 'Official state extraordinary gazette publication notification.',
        },
        {
          id: `doc-${proj.id}-2`,
          projectId: proj.id,
          name: `${proj.projectCode || proj.code}_Feasibility_Corridor_Alignment.pdf`,
          documentType: 'Corridor Feasibility Study & DPR',
          uploadedBy: 'Technical Review Consultant',
          uploadedAt: '2025-01-14 09:15 IST',
          status: 'VERIFIED',
          fileSize: '18.7 MB',
          description: 'Detailed Project Report (DPR) alignment and chainage schedules.',
        },
        {
          id: `doc-${proj.id}-3`,
          projectId: proj.id,
          name: `${proj.projectCode || proj.code}_SIA_Social_Impact_Report.pdf`,
          documentType: 'Social Impact Assessment (SIA) Study',
          uploadedBy: 'State Administrative Research Cell',
          uploadedAt: '2025-03-02 16:45 IST',
          status: 'VERIFIED',
          fileSize: '6.4 MB',
          description: 'Public hearing objections, PAF census, and Gram Sabha minutes.',
        },
      ];
    });

    return docs;
  }

  private saveProjects(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
      } catch (e) {
        console.warn('Failed to persist projects to localStorage', e);
      }
    }
  }

  private saveDocuments(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(this.documentsMap));
      } catch (e) {
        console.warn('Failed to persist project documents to localStorage', e);
      }
    }
  }

  public getAll(filters?: ProjectFilters): { projects: Project[]; total: number; page: number; limit: number } {
    let filtered = [...this.projects];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.projectCode && p.projectCode.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.projectName && p.projectName.toLowerCase().includes(q)) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.state && p.state.toLowerCase().includes(q)) ||
          (p.district && p.district.toLowerCase().includes(q)) ||
          (p.subDistrict && p.subDistrict.toLowerCase().includes(q)) ||
          (p.leadOfficer && p.leadOfficer.toLowerCase().includes(q)) ||
          (p.implementingAgency && p.implementingAgency.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      filtered = filtered.filter((p) => p.priority === filters.priority);
    }

    if (filters?.projectType && filters.projectType !== 'ALL') {
      filtered = filtered.filter((p) => p.projectType === filters.projectType || p.type === filters.projectType);
    }

    if (filters?.state && filters.state !== 'ALL') {
      filtered = filtered.filter((p) => p.state === filters.state);
    }

    if (filters?.district && filters.district !== 'ALL') {
      filtered = filtered.filter((p) => p.district === filters.district);
    }

    const total = filtered.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      projects: paginated,
      total,
      page,
      limit,
    };
  }

  public getById(id: string): Project | null {
    const proj = this.projects.find((p) => p.id === id || p.code === id || p.projectCode === id);
    if (!proj) return null;

    // Attach linked parcels
    const linked = DEMO_PARCELS.filter((parcel) => parcel.projectId === proj.id);
    return {
      ...proj,
      linkedParcels: linked,
    };
  }

  public getByCode(code: string): Project | null {
    return this.projects.find((p) => p.code.toLowerCase() === code.toLowerCase() || p.projectCode.toLowerCase() === code.toLowerCase()) || null;
  }

  public create(input: CreateProjectInput, userId: string = 'system_user'): { success: boolean; project?: Project; error?: string } {
    // 1. Check duplicate code
    const existing = this.getByCode(input.projectCode);
    if (existing) {
      return { success: false, error: `Project Code '${input.projectCode}' already exists in the system.` };
    }

    // 2. Validate input
    if (!input.projectName || input.projectName.trim().length < 3) {
      return { success: false, error: 'Project Name must have at least 3 characters.' };
    }
    if (!input.state || !input.district) {
      return { success: false, error: 'State and District are required location fields.' };
    }
    if (input.landRequiredArea < 0 || input.totalParcelsRequired < 0) {
      return { success: false, error: 'Land area and parcel counts cannot be negative.' };
    }

    const id = `PRJ-${new Date().getFullYear()}-${String(this.projects.length + 1).padStart(4, '0')}`;
    const initialStatus = input.initialStatus || 'DRAFT';

    const initialEvent: ProjectLifecycleEvent = {
      id: `evt-${Date.now()}`,
      projectId: id,
      previousStatus: 'DRAFT',
      newStatus: initialStatus,
      changedBy: input.leadOfficer || userId,
      changedAt: new Date().toISOString(),
      reason: 'Initial creation of project scheme in BHUMI 360.',
      remarks: 'Registered via Project Management Module.',
    };

    const newProject: Project = {
      id,
      projectCode: input.projectCode.toUpperCase().trim(),
      code: input.projectCode.toUpperCase().trim(),
      projectName: input.projectName.trim(),
      name: input.projectName.trim(),
      description: input.description || '',
      projectType: input.projectType,
      type: input.projectType,
      departmentId: input.departmentId,
      state: input.state,
      district: input.district,
      subDistrict: input.subDistrict,
      village: input.village || '',
      locationDescription: input.locationDescription || '',
      implementingAgency: input.implementingAgency || 'National Infrastructure Directorate',
      nodalAgency: input.implementingAgency || 'National Infrastructure Directorate',
      projectOfficerId: input.projectOfficerId,
      leadOfficer: input.leadOfficer || 'Project Officer',
      startDate: input.startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: input.expectedCompletionDate,
      targetCompletion: input.expectedCompletionDate,
      status: initialStatus,
      priority: input.priority || 'MEDIUM',
      estimatedCost: input.estimatedCost || 0,
      landRequiredArea: Number(input.landRequiredArea) || 0,
      totalAreaAcres: Number(input.landRequiredArea) || 0,
      totalParcelsRequired: Number(input.totalParcelsRequired) || 0,
      parcelsCount: Number(input.totalParcelsRequired) || 0,
      acquiredParcels: 0,
      acquiredParcelsCount: 0,
      pendingParcels: Number(input.totalParcelsRequired) || 0,
      pendingParcelsCount: Number(input.totalParcelsRequired) || 0,
      disputedParcelsCount: 0,
      compensationBudget: input.compensationBudget || 0,
      compensationBudgetCr: input.compensationBudget || 0,
      compensationPaid: 0,
      compensationDisbursedCr: 0,
      rrBudget: input.rrBudget || 0,
      rrSpent: 0,
      rrFamiliesCount: 0,
      rrFamiliesRehabilitated: 0,
      progressPercentage: 0,
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      lifecycleEvents: [initialEvent],
      stages: [],
    };

    this.projects.unshift(newProject);
    this.saveProjects();

    // Record Audit Event
    auditRepository.recordEvent({
      action: 'PROJECT_CREATED',
      entity: 'PROJECT',
      entityId: id,
      details: `Created new project corridor '${newProject.projectName}' (${newProject.projectCode}) in ${newProject.state}.`,
    });

    return { success: true, project: newProject };
  }

  public update(id: string, input: UpdateProjectInput, userId: string = 'system_user'): { success: boolean; project?: Project; error?: string } {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { success: false, error: `Project with ID '${id}' not found.` };
    }

    const current = this.projects[idx];
    const updated: Project = {
      ...current,
      projectName: input.projectName ?? current.projectName,
      name: input.projectName ?? current.name,
      description: input.description ?? current.description,
      projectType: input.projectType ?? current.projectType,
      type: input.projectType ?? current.type,
      departmentId: input.departmentId ?? current.departmentId,
      state: input.state ?? current.state,
      district: input.district ?? current.district,
      subDistrict: input.subDistrict ?? current.subDistrict,
      village: input.village ?? current.village,
      locationDescription: input.locationDescription ?? current.locationDescription,
      implementingAgency: input.implementingAgency ?? current.implementingAgency,
      nodalAgency: input.implementingAgency ?? current.nodalAgency,
      projectOfficerId: input.projectOfficerId ?? current.projectOfficerId,
      leadOfficer: input.leadOfficer ?? current.leadOfficer,
      startDate: input.startDate ?? current.startDate,
      expectedCompletionDate: input.expectedCompletionDate ?? current.expectedCompletionDate,
      targetCompletion: input.expectedCompletionDate ?? current.targetCompletion,
      priority: input.priority ?? current.priority,
      estimatedCost: input.estimatedCost ?? current.estimatedCost,
      landRequiredArea: input.landRequiredArea ?? current.landRequiredArea,
      totalAreaAcres: input.landRequiredArea ?? current.totalAreaAcres,
      totalParcelsRequired: input.totalParcelsRequired ?? current.totalParcelsRequired,
      parcelsCount: input.totalParcelsRequired ?? current.parcelsCount,
      compensationBudget: input.compensationBudget ?? current.compensationBudget,
      compensationBudgetCr: input.compensationBudget ?? current.compensationBudgetCr,
      rrBudget: input.rrBudget ?? current.rrBudget,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    this.projects[idx] = updated;
    this.saveProjects();

    auditRepository.recordEvent({
      action: 'PROJECT_UPDATED',
      entity: 'PROJECT',
      entityId: id,
      details: `Updated parameters for project '${updated.projectName}' (${updated.projectCode}).`,
    });

    return { success: true, project: updated };
  }

  public changeStatus(
    id: string,
    newStatus: ProjectStatus,
    reason: string,
    remarks: string = '',
    user: { id: string; name: string; role: string }
  ): { success: boolean; project?: Project; error?: string } {
    const proj = this.getById(id);
    if (!proj) return { success: false, error: `Project '${id}' not found.` };

    const validation = canTransitionStatus(proj.status, newStatus);
    if (!validation.allowed) {
      return { success: false, error: validation.reason || 'Invalid status transition.' };
    }

    const previousStatus = proj.status;
    const event: ProjectLifecycleEvent = {
      id: `evt-${Date.now()}`,
      projectId: proj.id,
      previousStatus,
      newStatus,
      changedBy: `${user.name} (${user.role})`,
      changedAt: new Date().toISOString(),
      reason: reason || 'Statutory lifecycle milestone transition.',
      remarks,
    };

    const updatedEvents = [event, ...(proj.lifecycleEvents || [])];

    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = {
        ...this.projects[idx],
        status: newStatus,
        lifecycleEvents: updatedEvents,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      };
      this.saveProjects();
    }

    auditRepository.recordEvent({
      action: 'PROJECT_STATUS_CHANGED',
      entity: 'PROJECT',
      entityId: id,
      details: `Project '${proj.projectName}' status transitioned from '${previousStatus}' to '${newStatus}'. Reason: ${reason}`,
    });

    return { success: true, project: this.projects[idx] };
  }

  public delete(id: string, userId: string = 'system_user'): { success: boolean; error?: string } {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: `Project '${id}' not found.` };

    const removed = this.projects.splice(idx, 1)[0];
    this.saveProjects();

    auditRepository.recordEvent({
      action: 'PROJECT_DELETED',
      entity: 'PROJECT',
      entityId: id,
      details: `Archived/Deleted project corridor '${removed.projectName}' (${removed.projectCode}).`,
    });

    return { success: true };
  }

  public getTimeline(id: string): ProjectLifecycleEvent[] {
    const proj = this.getById(id);
    return proj?.lifecycleEvents || [];
  }

  public getParcels(id: string): Parcel[] {
    return DEMO_PARCELS.filter((p) => p.projectId === id);
  }

  public linkParcel(projectId: string, parcelId: string, userId: string = 'system_user'): { success: boolean; error?: string } {
    const proj = this.getById(projectId);
    if (!proj) return { success: false, error: 'Project not found.' };

    const parcel = DEMO_PARCELS.find((p) => p.id === parcelId);
    if (!parcel) return { success: false, error: 'Parcel not found.' };

    parcel.projectId = projectId;
    parcel.projectName = proj.projectName || proj.name;

    // Increment count on project
    const idx = this.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      this.projects[idx].parcelsCount = (this.projects[idx].parcelsCount || 0) + 1;
      this.projects[idx].totalParcelsRequired = (this.projects[idx].totalParcelsRequired || 0) + 1;
      this.saveProjects();
    }

    auditRepository.recordEvent({
      action: 'PROJECT_PARCEL_LINKED',
      entity: 'PROJECT',
      entityId: projectId,
      details: `Attached parcel ${parcel.parcelCode} (Survey No. ${parcel.surveyNumber}) to project '${proj.projectName}'.`,
    });

    return { success: true };
  }

  public unlinkParcel(projectId: string, parcelId: string, userId: string = 'system_user'): { success: boolean; error?: string } {
    const proj = this.getById(projectId);
    if (!proj) return { success: false, error: 'Project not found.' };

    const parcel = DEMO_PARCELS.find((p) => p.id === parcelId);
    if (!parcel) return { success: false, error: 'Parcel not found.' };

    parcel.projectId = 'UNASSIGNED';
    parcel.projectName = 'Unassigned';

    const idx = this.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      this.projects[idx].parcelsCount = Math.max(0, (this.projects[idx].parcelsCount || 1) - 1);
      this.projects[idx].totalParcelsRequired = Math.max(0, (this.projects[idx].totalParcelsRequired || 1) - 1);
      this.saveProjects();
    }

    auditRepository.recordEvent({
      action: 'PROJECT_PARCEL_UNLINKED',
      entity: 'PROJECT',
      entityId: projectId,
      details: `Detached parcel ${parcel.parcelCode} (Survey No. ${parcel.surveyNumber}) from project '${proj.projectName}'.`,
    });

    return { success: true };
  }

  public getDocuments(projectId: string): ProjectDocument[] {
    return this.documentsMap[projectId] || [];
  }

  public addDocument(
    projectId: string,
    docInput: { name: string; documentType: string; description?: string; fileSize?: string },
    user: { id: string; name: string; role: string }
  ): { success: boolean; document?: ProjectDocument; error?: string } {
    const proj = this.getById(projectId);
    if (!proj) return { success: false, error: 'Project not found.' };

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      projectId,
      name: docInput.name,
      documentType: docInput.documentType,
      description: docInput.description || '',
      fileSize: docInput.fileSize || '1.8 MB',
      status: 'VERIFIED',
      uploadedBy: `${user.name} (${user.role})`,
      uploadedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    if (!this.documentsMap[projectId]) {
      this.documentsMap[projectId] = [];
    }

    this.documentsMap[projectId].unshift(newDoc);
    this.saveDocuments();

    auditRepository.recordEvent({
      action: 'PROJECT_DOCUMENT_ADDED',
      entity: 'PROJECT',
      entityId: projectId,
      details: `Deposited document '${newDoc.name}' (${newDoc.documentType}) in project vault.`,
    });

    return { success: true, document: newDoc };
  }

  public getKPIs(): {
    totalProjects: number;
    activeProjects: number;
    atRiskProjects: number;
    completedProjects: number;
    totalLandAcquiredAcres: number;
    totalLandRequiredAcres: number;
    pendingApprovalsCount: number;
    compensationPendingCr: number;
    rrCasesPending: number;
  } {
    let totalLandAcquiredAcres = 0;
    let totalLandRequiredAcres = 0;
    let activeProjects = 0;
    let atRiskProjects = 0;
    let completedProjects = 0;
    let compensationPendingCr = 0;
    let rrCasesPending = 0;

    this.projects.forEach((p) => {
      totalLandRequiredAcres += p.landRequiredArea || p.totalAreaAcres || 0;
      totalLandAcquiredAcres += (p.acquiredParcels || p.acquiredParcelsCount || 0) * 2.8; // synthetic estimation
      if (p.status === 'COMPLETED') completedProjects++;
      else activeProjects++;

      const health = calculateProjectHealth(p);
      if (health.health === 'AT_RISK' || health.health === 'DELAYED' || health.health === 'BLOCKED') {
        atRiskProjects++;
      }

      const budget = p.compensationBudget || p.compensationBudgetCr || 0;
      const paid = p.compensationPaid || p.compensationDisbursedCr || 0;
      compensationPendingCr += Math.max(0, budget - paid);

      const rrTotal = p.rrFamiliesCount || 0;
      const rrDone = p.rrFamiliesRehabilitated || 0;
      rrCasesPending += Math.max(0, rrTotal - rrDone);
    });

    return {
      totalProjects: this.projects.length,
      activeProjects,
      atRiskProjects,
      completedProjects,
      totalLandAcquiredAcres: Math.round(totalLandAcquiredAcres),
      totalLandRequiredAcres: Math.round(totalLandRequiredAcres),
      pendingApprovalsCount: 28, // Synthetic statutory SLA queue count
      compensationPendingCr: Number(compensationPendingCr.toFixed(1)),
      rrCasesPending,
    };
  }
}

export const projectRepository = new ProjectRepository();
