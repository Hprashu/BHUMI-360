// ============================================================
// BHUMI 360 - DATABASE ENTITY SCHEMAS & INTERFACES (PHASE 2)
// Designed for PostgreSQL + PostGIS Compatibility
// ============================================================
import { UserRole, UserStatus } from './rbac';

// 1. Generic Multi-State Administrative Location Hierarchy
export interface StateEntity {
  id: string;
  code: string; // e.g. "OD", "TS", "MH", "UP"
  name: string;
  regionalSubDistrictTerm: 'Tehsil' | 'Mandal' | 'Taluka' | 'Sub-Division' | 'Circle';
  regionalVillageTerm: 'Revenue Village' | 'Mauza' | 'Grama';
  regionalPlotTerm: 'Khasra No.' | 'Survey / Sub-Division No.' | 'Gut Number' | 'Dag Number';
  regionalOfficerTerm: 'Patwari' | 'VRO' | 'Talathi' | 'Karamchari' | 'Lekhpal';
  createdAt: string;
}

export interface DistrictEntity {
  id: string;
  stateId: string;
  code: string;
  name: string;
  headquarters: string;
  createdAt: string;
}

export interface SubDistrictEntity {
  id: string;
  districtId: string;
  code: string;
  name: string;
  type: string; // e.g., 'Tehsil', 'Mandal', 'Taluka'
  createdAt: string;
}

export interface VillageLocalityEntity {
  id: string;
  subDistrictId: string;
  censusCode: string;
  name: string;
  pinCode: string;
  createdAt: string;
}

// 2. Department Model
export interface DepartmentEntity {
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

// 3. User Model
export interface UserEntity {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  roleId: UserRole;
  departmentId: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 4. Project Model Foundation
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
  | 'ACTIVE'
  | 'ON_SCHEDULE'
  | 'DELAYED'
  | 'UNDER_REVIEW';

export interface ProjectLifecycleEventEntity {
  id: string;
  projectId: string;
  previousStatus: ProjectStatus;
  newStatus: ProjectStatus;
  changedBy: string;
  changedAt: string;
  reason: string;
  remarks?: string;
}

export interface ProjectDocumentEntity {
  id: string;
  projectId: string;
  name: string;
  documentType: string;
  description?: string;
  storageReference?: string;
  mimeType?: string;
  sizeBytes?: number;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'ARCHIVED';
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectEntity {
  id: string;
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
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedCost?: number; // In Crores
  landRequiredArea: number; // In Acres
  totalParcelsRequired: number;
  acquiredParcels: number;
  pendingParcels: number;
  compensationBudget: number; // In Crores
  compensationPaid: number; // In Crores
  rrBudget?: number; // In Crores
  rrSpent?: number; // In Crores
  progressPercentage: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 5. Land Parcel Model Foundation
export type LandType = 'AGRICULTURAL' | 'COMMERCIAL' | 'RESIDENTIAL' | 'GOVERNMENT_FOREST' | 'WASTELAND' | 'TRIBAL';
export type ParcelAcquisitionStatus =
  | 'IDENTIFIED'
  | 'UNDER_SURVEY'
  | 'UNDER_VERIFICATION'
  | 'UNDER_APPROVAL'
  | 'UNDER_COMPENSATION'
  | 'ACQUIRED'
  | 'DISPUTED'
  | 'POSSESSION_TAKEN';

export interface LandParcelEntity {
  id: string;
  parcelCode: string;
  surveyNumber: string;
  area: number;
  areaUnit: 'ACRES' | 'HECTARES' | 'SQ_METERS' | 'GUNTHA';
  landType: LandType;
  acquisitionStatus: ParcelAcquisitionStatus;
  projectId: string;
  locationId: string; // Village / Locality ID
  // PostGIS geometry representation or GeoJSON geometry object
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  createdAt: string;
  updatedAt: string;
}

// 6. Acquisition Case Model
export type AcquisitionCaseStage =
  | 'IDENTIFICATION'
  | 'SURVEY'
  | 'VERIFICATION'
  | 'PROPOSAL'
  | 'APPROVAL'
  | 'COMPENSATION'
  | 'RR'
  | 'POSSESSION'
  | 'COMPLETION';

export interface AcquisitionCaseEntity {
  id: string;
  caseNumber: string;
  projectId: string;
  parcelId: string;
  currentStage: AcquisitionCaseStage;
  status: 'ACTIVE' | 'PENDING_OBJECTION' | 'HEARING_SCHEDULED' | 'AWARD_DECLARED' | 'COMPLETED' | 'BLOCKED';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTo: string; // User ID
  openedAt: string;
  updatedAt: string;
}

// 7. Survey Model
export interface SurveyEntity {
  id: string;
  parcelId: string;
  surveyNumber: string;
  surveyDate: string;
  surveyOfficerId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
  dgpsPointCount?: number;
  boundaryVerificationHash?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Approval Model
export interface ApprovalEntity {
  id: string;
  caseId: string;
  approvalType: 'SECTION_11_PRELIMINARY' | 'SECTION_15_HEARING' | 'SECTION_19_DECLARATION' | 'SECTION_23_AWARD';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED_WITH_REMARKS';
  requestedBy: string; // User ID
  approvedBy?: string; // User ID (Collector / Ministry)
  requestedAt: string;
  approvedAt?: string;
  dscTokenFingerprint?: string;
  comments?: string;
}

// 9. Compensation Model
export interface CompensationEntity {
  id: string;
  caseId: string;
  eligibleAmount: number;
  approvedAmount: number;
  disbursedAmount: number;
  status: 'DRAFT' | 'CALCULATED' | 'SANCTIONED' | 'DISBURSED' | 'DISPUTED_ESCROW';
  pfmsTransactionReference?: string;
  disbursedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 10. R&R Model
export interface RRCaseEntity {
  id: string;
  caseId: string;
  eligibleFamilyCount: number;
  benefitStatus: 'ELIGIBILITY_SURVEY' | 'SCHEME_APPROVED' | 'HOUSING_ALLOTTED' | 'GRANTS_DISBURSED';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AUDITED';
  createdAt: string;
  updatedAt: string;
}

// 11. Document Model Foundation
export interface DocumentEntity {
  id: string;
  name: string;
  documentType: 'SECTION_NOTIFICATION' | 'FMB_SURVEY_SKETCH' | 'ROR_EXTRACT' | 'COMPENSATION_AWARD' | 'AADHAAR_ESIGN_PROOF';
  entityType: 'PARCEL' | 'PROJECT' | 'CASE' | 'DISPUTE';
  entityId: string;
  storageReference: string; // URI or S3/GCS bucket reference
  mimeType: string;
  size: number;
  uploadedBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

// 12. Notification Model
export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPROVAL' | 'COMPENSATION' | 'SURVEY' | 'RR' | 'DOCUMENT' | 'SYSTEM' | 'ALERT';
  priority: 'normal' | 'high' | 'urgent';
  readAt?: string;
  linkRoute?: string;
  createdAt: string;
}

// 13. Audit Log Model
export interface AuditLogEntity {
  id: string;
  actorUserId: string;
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

// 14. GIS Data Source Foundation
export type GISSourceType =
  | 'OPENSTREETMAP'
  | 'GEOSERVER'
  | 'WMS'
  | 'WFS'
  | 'ARCGIS_REST'
  | 'GEOJSON_API'
  | 'OFFICIAL_CADASTRAL_API';

export interface GISDataSourceEntity {
  id: string;
  name: string;
  type: GISSourceType;
  baseUrl: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'STANDBY' | 'ERROR';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GISLayerEntity {
  id: string;
  sourceId: string;
  layerName: string;
  displayTitle: string;
  geometryType: 'POINT' | 'LINESTRING' | 'POLYGON' | 'RASTER';
  isVisible: boolean;
  opacity: number;
  createdAt: string;
}
