// ============================================================
// BHUMI 360 - PROJECT HEALTH & LIFECYCLE TRANSITION ENGINE
// Strictly rule-based, transparent evaluation (no fake AI predictions)
// ============================================================

import { Project, ProjectHealth, ProjectStatus, ProjectType } from '../types';

export interface ProjectHealthAssessment {
  health: ProjectHealth;
  badgeLabel: string;
  badgeClass: string;
  dotColorClass: string;
  headline: string;
  reasons: string[];
  recommendations: string[];
  scheduleVarianceDays: number;
  costVarianceCr: number;
  riskFactors: string[];
  calculatedMetrics: {
    daysRemaining: number;
    isOverdue: boolean;
    progressPercent: number;
    landAcquiredPercent: number;
    compensationDisbursedPercent: number;
    pendingParcelsCount: number;
    disputedParcelsCount: number;
  };
}

/**
 * Computes deterministic, rule-based health status based on concrete project metrics
 */
export function calculateProjectHealth(project: Project): ProjectHealthAssessment {
  const reasons: string[] = [];
  const recommendations: string[] = [];

  const targetDate = new Date(project.expectedCompletionDate || project.targetCompletion || Date.now());
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  const totalParcels = project.totalParcelsRequired || project.parcelsCount || 1;
  const acquiredParcels = project.acquiredParcels || project.acquiredParcelsCount || 0;
  const pendingParcels = project.pendingParcels || project.pendingParcelsCount || 0;
  const disputedParcels = project.disputedParcelsCount || 0;

  const landAcquiredPercent = Math.min(100, Math.round((acquiredParcels / Math.max(1, totalParcels)) * 100));

  const compBudget = project.compensationBudget || project.compensationBudgetCr || 1;
  const compPaid = project.compensationPaid || project.compensationDisbursedCr || 0;
  const compensationDisbursedPercent = Math.min(100, Math.round((compPaid / Math.max(0.1, compBudget)) * 100));

  const progressPercent = project.progressPercentage || project.progressPercent || 0;

  const scheduleVarianceDays = isOverdue ? Math.abs(daysRemaining) : 0;
  const costVarianceCr = Math.max(0, compPaid - compBudget);

  const makeResult = (
    health: ProjectHealth,
    badgeLabel: string,
    badgeClass: string,
    dotColorClass: string,
    headline: string,
    finalReasons: string[],
    finalRecommendations: string[]
  ): ProjectHealthAssessment => ({
    health,
    badgeLabel,
    badgeClass,
    dotColorClass,
    headline,
    reasons: finalReasons,
    recommendations: finalRecommendations,
    scheduleVarianceDays,
    costVarianceCr,
    riskFactors: finalReasons,
    calculatedMetrics: {
      daysRemaining,
      isOverdue,
      progressPercent,
      landAcquiredPercent,
      compensationDisbursedPercent,
      pendingParcelsCount: pendingParcels,
      disputedParcelsCount: disputedParcels,
    },
  });

  // RULE EVALUATION

  // 1. BLOCKED CONDITIONS
  if (project.status === 'ON_HOLD') {
    reasons.push('Project execution is formally held by administrative suspension or gazette pause.');
    recommendations.push('Review executive directive notes and resolve pending administrative holds.');
    return makeResult(
      'BLOCKED',
      'Blocked / On Hold',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-rose-600',
      'Work Suspended Under Administrative Hold',
      reasons,
      recommendations
    );
  }

  if (disputedParcels > 5 || (disputedParcels > 0 && disputedParcels / totalParcels > 0.2)) {
    reasons.push(`High litigation rate: ${disputedParcels} cadastral parcels have active Section 64 reference or court stays.`);
    recommendations.push('Convene Land Acquisition, Rehabilitation & Resettlement Authority (LARRA) tribunal hearing.');
    return makeResult(
      'BLOCKED',
      'Blocked (Litigation)',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-rose-600',
      'Critical Cadastral Litigation Impasse',
      reasons,
      recommendations
    );
  }

  // 2. DELAYED CONDITIONS
  if (isOverdue && project.status !== 'COMPLETED') {
    reasons.push(`Target completion date expired ${Math.abs(daysRemaining)} days ago on ${project.expectedCompletionDate || project.targetCompletion}.`);
    recommendations.push('Issue formal timeline extension request under statutory delegation rules.');
  }

  if (daysRemaining > 0 && daysRemaining < 90 && progressPercent < 50 && project.status !== 'COMPLETED') {
    reasons.push(`Significant schedule compression: ${daysRemaining} days remaining with only ${progressPercent}% overall physical progress achieved.`);
    recommendations.push('Mobilize additional DGPS survey and CALA award determination teams.');
  }

  if (reasons.length > 0) {
    return makeResult(
      'DELAYED',
      'Delayed Schedule',
      'bg-amber-50 text-amber-800 border-amber-200',
      'bg-amber-600',
      'Timeline Milestone Breached or Severe Lag Detected',
      reasons,
      recommendations
    );
  }

  // 3. AT RISK CONDITIONS
  if (daysRemaining > 0 && daysRemaining < 180 && progressPercent < 60) {
    reasons.push(`Progress velocity behind target: under 6 months remaining to target date with ${pendingParcels} parcels pending acquisition.`);
    recommendations.push('Expedite Section 19 final declaration gazette publication.');
  }

  if (disputedParcels > 0 && disputedParcels <= 5) {
    reasons.push(`${disputedParcels} parcel(s) flagged with title boundary disputes or sub-division objections.`);
    recommendations.push('Initiate joint ground verification with revenue tahsil survey staff.');
  }

  if (reasons.length > 0) {
    return makeResult(
      'AT_RISK',
      'At Risk',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-amber-500',
      'Potential Corridor Bottlenecks Requiring Attention',
      reasons,
      recommendations
    );
  }

  // 4. ON TRACK CONDITIONS
  reasons.push('All cadastral milestones, statutory notices, and disbursements are aligned with scheduled SLA limits.');
  recommendations.push('Maintain regular fortnightly CALA coordination reviews.');

  return makeResult(
    'ON_TRACK',
    'On Track',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-emerald-600',
    'Statutory Milestones & Acquisition Pacing On Schedule',
    reasons,
    recommendations
  );
}

/**
 * Validates allowed status transitions according to RFCTLARR statutory rules
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ['PLANNING', 'CANCELLED'],
  PLANNING: ['LAND_IDENTIFICATION', 'DRAFT', 'ON_HOLD', 'CANCELLED'],
  LAND_IDENTIFICATION: ['SURVEY', 'PLANNING', 'ON_HOLD', 'CANCELLED'],
  SURVEY: ['ACQUISITION_IN_PROGRESS', 'LAND_IDENTIFICATION', 'ON_HOLD'],
  ACQUISITION_IN_PROGRESS: ['COMPENSATION_IN_PROGRESS', 'SURVEY', 'ON_HOLD'],
  COMPENSATION_IN_PROGRESS: ['RR_IN_PROGRESS', 'POSSESSION', 'ON_HOLD'],
  RR_IN_PROGRESS: ['POSSESSION', 'COMPENSATION_IN_PROGRESS', 'ON_HOLD'],
  POSSESSION: ['COMPLETED', 'ON_HOLD'],
  COMPLETED: ['ON_HOLD'], // Re-opening requires administrative override
  ON_HOLD: ['PLANNING', 'LAND_IDENTIFICATION', 'SURVEY', 'ACQUISITION_IN_PROGRESS', 'COMPENSATION_IN_PROGRESS', 'POSSESSION', 'CANCELLED'],
  CANCELLED: [],
  // Legacy aliases
  ACTIVE: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_SCHEDULE: ['DELAYED', 'COMPLETED', 'ON_HOLD'],
  DELAYED: ['ON_SCHEDULE', 'COMPLETED', 'ON_HOLD'],
  UNDER_REVIEW: ['ACTIVE', 'ON_HOLD'],
};

export type ProjectHealthSummary = ProjectHealthAssessment;

export function getAllowedNextStatuses(status: ProjectStatus): ProjectStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[status] || [];
}

export function canTransitionStatus(currentStatus: ProjectStatus, targetStatus: ProjectStatus): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: `Project is already in '${currentStatus}' status.` };
  }

  const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Direct transition from '${formatProjectStatus(currentStatus)}' to '${formatProjectStatus(targetStatus)}' violates standard statutory lifecycle ordering. Transition must proceed sequentially through intermediary verification stages.`,
    };
  }

  return { allowed: true };
}

export function formatProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'PLANNING': return 'Planning';
    case 'LAND_IDENTIFICATION': return 'Land Identification';
    case 'SURVEY': return 'Survey & Demarcation';
    case 'ACQUISITION_IN_PROGRESS': return 'Acquisition in Progress';
    case 'COMPENSATION_IN_PROGRESS': return 'Compensation Awards';
    case 'RR_IN_PROGRESS': return 'R&R in Progress';
    case 'POSSESSION': return 'Possession Handover';
    case 'COMPLETED': return 'Completed';
    case 'ON_HOLD': return 'On Hold';
    case 'CANCELLED': return 'Cancelled';
    case 'ACTIVE': return 'Active';
    case 'ON_SCHEDULE': return 'On Schedule';
    case 'DELAYED': return 'Delayed';
    case 'UNDER_REVIEW': return 'Under Review';
    default: return status;
  }
}

export function formatProjectType(type: ProjectType): string {
  switch (type) {
    case 'NATIONAL_HIGHWAY': return 'National Highway';
    case 'STATE_HIGHWAY': return 'State Highway';
    case 'RAILWAY': return 'Railway Corridor';
    case 'METRO_TRANSIT': return 'Metro / Transit';
    case 'IRRIGATION': return 'Irrigation & Canals';
    case 'AIRPORT': return 'Airport Infrastructure';
    case 'INDUSTRIAL_DEVELOPMENT': return 'Industrial Development Zone';
    case 'POWER_INFRASTRUCTURE': return 'Power Infrastructure';
    case 'WATER_INFRASTRUCTURE': return 'Water & Dam Infrastructure';
    case 'URBAN_DEVELOPMENT': return 'Urban Development';
    case 'PUBLIC_UTILITY': return 'Public Utility';
    case 'HIGHWAY': return 'National Highway';
    case 'RENEWABLE_ENERGY': return 'Renewable Energy / Solar Park';
    case 'INDUSTRIAL_CORRIDOR': return 'Industrial Corridor';
    case 'URBAN_METRO': return 'Urban Metro Rail';
    case 'OTHER': return 'Special Infrastructure';
    default: return type;
  }
}

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string; description: string }[] = [
  { value: 'NATIONAL_HIGHWAY', label: 'National Highway', description: 'National multi-lane highway or expressway corridor' },
  { value: 'STATE_HIGHWAY', label: 'State Highway', description: 'Inter-district arterial roadway corridor' },
  { value: 'RAILWAY', label: 'Railway Corridor', description: 'Dedicated freight corridor or high-speed rail line' },
  { value: 'METRO_TRANSIT', label: 'Metro / Transit', description: 'Urban rapid transit network & station yards' },
  { value: 'IRRIGATION', label: 'Irrigation & Canals', description: 'Reservoirs, distributaries, and water canal systems' },
  { value: 'AIRPORT', label: 'Airport Infrastructure', description: 'Greenfield or expansion airport runway & terminal zones' },
  { value: 'INDUSTRIAL_DEVELOPMENT', label: 'Industrial Development', description: 'Special Economic Zones & industrial parks' },
  { value: 'POWER_INFRASTRUCTURE', label: 'Power Infrastructure', description: 'Solar/wind farms, substations & transmission lines' },
  { value: 'WATER_INFRASTRUCTURE', label: 'Water Infrastructure', description: 'Water treatment, pumping mains & pipelines' },
  { value: 'URBAN_DEVELOPMENT', label: 'Urban Development', description: 'Smart city master plan layouts & ring roads' },
  { value: 'PUBLIC_UTILITY', label: 'Public Utility', description: 'Government hospitals, educational complexes, and civic centers' },
  { value: 'OTHER', label: 'Other Infrastructure', description: 'Special category infrastructure development' },
];
