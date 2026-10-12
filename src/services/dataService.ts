import {
  ACQUISITION_STAGES,
  DEMO_AUDIT_LOGS,
  DEMO_NOTIFICATIONS,
  DEMO_PARCELS,
  DEMO_PROJECTS,
  DEMO_ROLES,
  PARCEL_421_TIMELINE,
} from '../data/mockData';
import {
  AcquisitionStage,
  AuditEvent,
  NotificationItem,
  Parcel,
  Project,
  RoleProfile,
  SearchResult,
  StageInfo,
  TimelineEvent,
  UserRole,
} from '../types';

export interface DashboardKPIs {
  activeProjects: number;
  totalParcels: number;
  acquiredParcels: number;
  pendingAcquisition: number;
  compensationDisbursedCr: number;
  compensationBudgetCr: number;
  rrCompletedFamilies: number;
  rrTotalFamilies: number;
  delayedCases: number;
  pendingApprovals: number;
}

export class DataService {
  /**
   * Retrieves high-level KPI metrics for executive and operational dashboards.
   */
  public static async getDashboardKPIs(): Promise<DashboardKPIs> {
    return {
      activeProjects: 24,
      totalParcels: 12486,
      acquiredParcels: 8942,
      pendingAcquisition: 2731,
      compensationDisbursedCr: 184.6,
      compensationBudgetCr: 245.0,
      rrCompletedFamilies: 6284,
      rrTotalFamilies: 7850,
      delayedCases: 317,
      pendingApprovals: 86,
    };
  }

  /**
   * Retrieves all infrastructure projects.
   */
  public static async getProjects(): Promise<Project[]> {
    return DEMO_PROJECTS;
  }

  /**
   * Retrieves single project with full lifecycle stages.
   */
  public static async getProjectById(id: string): Promise<Project | undefined> {
    return DEMO_PROJECTS.find((p) => p.id.toLowerCase() === id.toLowerCase() || p.code.toLowerCase() === id.toLowerCase());
  }

  /**
   * Retrieves all land parcels with optional filter by project, village, or status.
   */
  public static async getParcels(filter?: {
    projectId?: string;
    status?: string;
    search?: string;
    village?: string;
  }): Promise<Parcel[]> {
    let result = [...DEMO_PARCELS];

    if (filter?.projectId) {
      result = result.filter((p) => p.projectId.toLowerCase() === filter.projectId?.toLowerCase());
    }

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((p) => p.status === filter.status);
    }

    if (filter?.village && filter.village !== 'ALL') {
      result = result.filter((p) => p.village.toLowerCase().includes(filter.village?.toLowerCase() || ''));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.parcelCode.toLowerCase().includes(q) ||
          p.surveyNumber.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Retrieves a single parcel for Parcel 360 view.
   */
  public static async getParcelById(id: string): Promise<Parcel | undefined> {
    return DEMO_PARCELS.find(
      (p) =>
        p.id.toLowerCase() === id.toLowerCase() ||
        p.parcelCode.toLowerCase() === id.toLowerCase() ||
        p.surveyNumber.toLowerCase() === id.toLowerCase()
    );
  }

  /**
   * Retrieves complete vertical timeline for a given parcel.
   */
  public static async getParcelTimeline(parcelId: string): Promise<TimelineEvent[]> {
    // In Phase 1, returns the detailed audit-backed timeline for Parcel PCL-00421
    return PARCEL_421_TIMELINE;
  }

  /**
   * Retrieves the 9 acquisition lifecycle definition stages.
   */
  public static getAcquisitionStages(): StageInfo[] {
    return ACQUISITION_STAGES;
  }

  /**
   * Retrieves system notifications.
   */
  public static async getNotifications(): Promise<NotificationItem[]> {
    return DEMO_NOTIFICATIONS;
  }

  /**
   * Retrieves tamper-evident audit logs.
   */
  public static async getAuditLogs(): Promise<AuditEvent[]> {
    return DEMO_AUDIT_LOGS;
  }

  /**
   * Retrieves simulated role profile metadata.
   */
  public static getRoleProfile(role: UserRole): RoleProfile {
    return DEMO_ROLES[role] || DEMO_ROLES.SUPER_ADMIN;
  }

  /**
   * Universal search across all entities (Projects, Parcels, Surveys, Owners, Documents).
   */
  public static async universalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Projects
    DEMO_PROJECTS.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          category: 'PROJECT',
          title: p.name,
          subtitle: `${p.code} • ${p.district}, ${p.state} • ${p.parcelsCount} parcels`,
          badge: p.status,
          route: `/projects/${p.id}`,
          meta: `${p.progressPercent}% complete`,
        });
      }
    });

    // Parcels & Survey Numbers
    DEMO_PARCELS.forEach((p) => {
      if (
        p.parcelCode.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          category: 'PARCEL',
          title: `Parcel ${p.parcelCode} (Survey ${p.surveyNumber})`,
          subtitle: `${p.village} • ${p.areaAcres} acres • ${p.ownerName}`,
          badge: p.status.replace('_', ' '),
          route: `/parcels/${p.id}`,
          meta: `Stage: ${p.currentStage}`,
        });
      }

      // Landowners
      if (p.ownerName.toLowerCase().includes(q)) {
        results.push({
          id: `owner-${p.id}`,
          category: 'LANDOWNER',
          title: p.ownerName,
          subtitle: `Owner of Survey ${p.surveyNumber}, ${p.village} (${p.parcelCode})`,
          badge: p.compensationStatus,
          route: `/parcels/${p.id}`,
          meta: `Khata: ${p.ownerKhataNo}`,
        });
      }
    });

    // Specific survey matches
    if (q.includes('sy') || q.includes('survey') || q.includes('/') || q.match(/\d+/)) {
      DEMO_PARCELS.forEach((p) => {
        if (p.surveyNumber.toLowerCase().includes(q) && !results.some((r) => r.id === p.id)) {
          results.push({
            id: `sy-${p.id}`,
            category: 'SURVEY NUMBER',
            title: `Survey No. ${p.surveyNumber}`,
            subtitle: `${p.village}, ${p.district} (${p.areaAcres} acres)`,
            badge: p.landType,
            route: `/parcels/${p.id}`,
          });
        }
      });
    }

    return results;
  }
}
