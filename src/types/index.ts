export type AcquisitionStage =
  | 'IDENTIFICATION'
  | 'SURVEY'
  | 'VERIFICATION'
  | 'PROPOSAL'
  | 'APPROVAL'
  | 'COMPENSATION'
  | 'RR'
  | 'POSSESSION'
  | 'COMPLETION';

export type StageStatus = 'completed' | 'current' | 'pending' | 'delayed' | 'blocked';

export type ParcelStatus =
  | 'IDENTIFIED'
  | 'UNDER_SURVEY'
  | 'UNDER_VERIFICATION'
  | 'UNDER_APPROVAL'
  | 'UNDER_COMPENSATION'
  | 'ACQUIRED'
  | 'DISPUTED'
  | 'POSSESSION_TAKEN';

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

export interface StageInfo {
  id: AcquisitionStage;
  stepNumber: number;
  label: string;
  description: string;
  defaultResponsibleRole: UserRole;
  averageDays: number;
}

export interface ProjectStageProgress {
  stage: AcquisitionStage;
  status: StageStatus;
  completedDate?: string;
  targetDate?: string;
  completionPercentage: number;
  assignedOfficer: string;
  slaDays: number;
  actualDays?: number;
}

export type ProjectType =
  | 'NATIONAL_HIGHWAY'
  | 'STATE_HIGHWAY'
  | 'RAILWAY'
  | 'METRO_TRANSIT'
  | 'IRRIGATION'
  | 'AIRPORT'
  | 'INDUSTRIAL_DEVELOPMENT'
  | 'POWER_INFRASTRUCTURE'
  | 'WATER_INFRASTRUCTURE'
  | 'URBAN_DEVELOPMENT'
  | 'PUBLIC_UTILITY'
  | 'OTHER'
  // Legacy aliases for backward compatibility
  | 'HIGHWAY'
  | 'RENEWABLE_ENERGY'
  | 'INDUSTRIAL_CORRIDOR'
  | 'URBAN_METRO';

export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'LAND_IDENTIFICATION'
  | 'SURVEY'
  | 'ACQUISITION_IN_PROGRESS'
  | 'COMPENSATION_IN_PROGRESS'
  | 'RR_IN_PROGRESS'
  | 'POSSESSION'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED'
  // Legacy aliases for backward compatibility
  | 'ACTIVE'
  | 'ON_SCHEDULE'
  | 'DELAYED'
  | 'UNDER_REVIEW';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'BLOCKED';

export interface ProjectLifecycleEvent {
  id: string;
  projectId: string;
  previousStatus: ProjectStatus;
  newStatus: ProjectStatus;
  changedBy: string;
  changedAt: string;
  reason: string;
  remarks?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  documentType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'ARCHIVED';
  description?: string;
  fileSize?: string;
  storageReference?: string;
}

export interface Project {
  id: string;
  // Project identifiers (supports both new projectCode and legacy code)
  projectCode?: string;
  code: string;
  // Project names (supports both new projectName and legacy name)
  projectName?: string;
  name: string;
  description: string;
  projectType?: ProjectType;
  type?: ProjectType;
  departmentId?: string;
  state: string;
  district: string;
  subDistrict: string;
  village?: string;
  locationDescription?: string;
  implementingAgency?: string;
  nodalAgency?: string;
  projectOfficerId?: string;
  leadOfficer?: string;
  startDate: string;
  expectedCompletionDate?: string;
  targetCompletion?: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  // Financial metrics
  estimatedCost?: number; // In INR Crores
  landRequiredArea?: number; // In Acres
  totalAreaAcres?: number; // Alias
  totalParcelsRequired?: number;
  parcelsCount?: number; // Alias
  acquiredParcels?: number;
  acquiredParcelsCount?: number; // Alias
  pendingParcels?: number;
  pendingParcelsCount?: number; // Alias
  disputedParcelsCount?: number;
  compensationBudget?: number; // In INR Crores
  compensationBudgetCr?: number; // Alias
  compensationPaid?: number; // In INR Crores
  compensationDisbursedCr?: number; // Alias
  rrBudget?: number; // In INR Crores
  rrSpent?: number; // In INR Crores
  rrFamiliesCount?: number;
  rrFamiliesRehabilitated?: number;
  progressPercentage?: number;
  progressPercent?: number; // Alias
  currentStage?: AcquisitionStage;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  stages?: ProjectStageProgress[];
  lifecycleEvents?: ProjectLifecycleEvent[];
  linkedParcels?: Parcel[];
}

export interface Parcel {
  id: string;
  parcelCode: string;
  projectId: string;
  projectName: string;
  surveyNumber: string;
  subDivision: string;
  areaAcres: number;
  areaSqm: number;
  state: string;
  district: string;
  subDistrict: string;
  village: string;
  landType: 'Private Agricultural' | 'Private Commercial' | 'Government Wasteland' | 'Grama Kantham / Abadi' | 'Forest Land' | 'Wetland';
  status: ParcelStatus;
  currentStage: AcquisitionStage;
  ownerName: string;
  ownerKhataNo: string;
  ownerAadhaarMasked: string;
  ownerMobileMasked: string;
  totalAwardAmount: number; // in INR
  compensationPaidAmount: number; // in INR
  compensationStatus: 'Eligible' | 'Award Passed' | 'Disbursed' | 'Partially Disbursed' | 'Pending Bank Details' | 'Disputed Escrow';
  rrRequired: boolean;
  rrStatus: 'Not Applicable' | 'Survey Pending' | 'Entitlement Formulated' | 'Plot Allocated' | 'Package Disbursed';
  possessionDate?: string;
  polygonPoints: [number, number][]; // Localized coordinates for GIS simulation
  disputeNotes?: string;
  documentsCount: number;
  lastUpdated: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  stage: AcquisitionStage;
  status: 'Success' | 'In Progress' | 'Warning' | 'Pending';
  remarks: string;
  documentRef?: string;
  tamperEvidentHash: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'approval' | 'compensation' | 'survey' | 'rr' | 'document' | 'system' | 'alert';
  priority: 'urgent' | 'high' | 'normal';
  timestamp: string;
  isRead: boolean;
  linkRoute?: string;
  entityId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  ipAddressMasked: string;
  integrityHash: string;
}

export interface RoleProfile {
  role: UserRole;
  name: string;
  designation: string;
  title?: string;
  department: string;
  jurisdiction: string;
  responsibilities?: string[];
  canApprove: boolean;
  canDisburse: boolean;
  canEditParcels: boolean;
  canConductSurvey: boolean;
}

export interface LocationHierarchyConfig {
  stateLabel: string;
  districtLabel: string;
  subDistrictLabel: string; // e.g., Mandal / Tehsil / Taluka
  villageLabel: string;
  surveyLabel: string;
  currentState: string;
  currentDistrict: string;
  currentSubDistrictType: 'Tehsil' | 'Mandal' | 'Taluka' | 'Sub-Division';
}

export interface SearchResult {
  id: string;
  category: 'PROJECT' | 'PARCEL' | 'SURVEY NUMBER' | 'LANDOWNER' | 'VILLAGE' | 'DOCUMENT';
  title: string;
  subtitle: string;
  badge: string;
  route: string;
  meta?: string;
}

export * from './auth';
