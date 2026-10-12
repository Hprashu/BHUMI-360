import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  HeartHandshake,
  FileText,
  Stamp,
  GitMerge,
  ShieldCheck,
  Compass,
  ArrowRight,
  User,
  Building,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Download,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  FileCheck,
  Eye,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';
import { LifecycleStepper } from '../components/common/LifecycleStepper';
import { StatusBadge } from '../components/common/StatusBadge';
import { projectApi } from '../services/apiClient';
import { authService } from '../services/authService';
import { calculateProjectHealth, getAllowedNextStatuses, canTransitionStatus } from '../lib/projectHealth';
import { getStateTerminology } from '../lib/locationHierarchy';
import { DEMO_PARCELS, ACQUISITION_STAGES } from '../data/mockData';
import { Parcel, Project, ProjectDocument, ProjectLifecycleEvent, ProjectStatus } from '../types';

interface Project360PageProps {
  projectId?: string;
  onNavigate: (route: string) => void;
}

export const Project360Page: React.FC<Project360PageProps> = ({
  projectId = 'PRJ-2026-0042',
  onNavigate,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<ProjectLifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'parcels'
    | 'gis'
    | 'acquisition'
    | 'survey'
    | 'compensation'
    | 'rr'
    | 'documents'
    | 'approvals'
    | 'timeline'
    | 'audit'
  >('overview');

  const [parcelFilter, setParcelFilter] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('ALL');

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<ProjectStatus>('SURVEY');
  const [statusReason, setStatusReason] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Statutory Gazette Notification (Sec 11)');
  const [docDesc, setDocDesc] = useState('');
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const [showLinkParcelModal, setShowLinkParcelModal] = useState(false);
  const [selectedParcelToLink, setSelectedParcelToLink] = useState('');

  // RBAC permissions
  const canChangeStatus = authService.hasPermission('project.change_status');
  const canViewFinancials = authService.hasPermission('project.view_financials');
  const canViewDocs = authService.hasPermission('project.view_documents');
  const canManageDocs = authService.hasPermission('project.manage_documents');
  const canLinkParcels = authService.hasPermission('project.link_parcels');
  const canExport = authService.hasPermission('project.export');

  const loadProjectData = async () => {
    setLoading(true);
    const res = await projectApi.getById(projectId);
    if (res.success && res.data) {
      setProject(res.data);
      const allowed = getAllowedNextStatuses(res.data.status);
      if (allowed.length > 0) {
        setSelectedNextStatus(allowed[0]);
      }
    }

    const pRes = await projectApi.getParcels(projectId);
    if (pRes.success && pRes.data) {
      setParcels(pRes.data);
    }

    const dRes = await projectApi.getDocuments(projectId);
    if (dRes.success && dRes.data) {
      setDocuments(dRes.data);
    }

    const tRes = await projectApi.getTimeline(projectId);
    if (tRes.success && tRes.data) {
      setTimelineEvents(tRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
        <FolderKanban className="w-10 h-10 mx-auto text-slate-300 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-800">Accessing Project 360 Workspace...</h3>
        <p className="text-xs text-slate-500 mt-1">Retrieving cadastral alignments, statutory records, and treasury ledger.</p>
      </div>
    );
  }

  const terms = getStateTerminology(project.state);
  const health = calculateProjectHealth(project);
  const allowedTransitions = getAllowedNextStatuses(project.status);

  // Status advance submit
  const handleAdvanceStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);

    if (!statusReason.trim()) {
      setStatusError('Statutory reason is required for lifecycle transitions.');
      return;
    }

    setStatusSubmitting(true);
    const res = await projectApi.changeStatus(project.id, selectedNextStatus, statusReason.trim(), statusRemarks.trim());
    setStatusSubmitting(false);

    if (!res.success) {
      setStatusError(res.error?.message || 'Failed to advance lifecycle stage.');
      return;
    }

    setShowStatusModal(false);
    setStatusReason('');
    setStatusRemarks('');
    await loadProjectData();
  };

  // Document upload submit
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);

    if (!docName.trim()) {
      setDocError('Document name is required.');
      return;
    }

    setDocSubmitting(true);
    const res = await projectApi.addDocument(project.id, {
      name: docName.trim(),
      documentType: docType,
      description: docDesc.trim(),
      fileSize: '3.6 MB',
    });
    setDocSubmitting(false);

    if (!res.success) {
      setDocError(res.error?.message || 'Failed to deposit document.');
      return;
    }

    setShowDocModal(false);
    setDocName('');
    setDocDesc('');
    await loadProjectData();
  };

  // Link parcel submit
  const handleLinkParcel = async () => {
    if (!selectedParcelToLink) return;
    const res = await projectApi.linkParcel(project.id, selectedParcelToLink);
    if (res.success) {
      setShowLinkParcelModal(false);
      setSelectedParcelToLink('');
      await loadProjectData();
    } else {
      alert(res.error?.message || 'Failed to link parcel.');
    }
  };

  // Unlink parcel
  const handleUnlinkParcel = async (parcelId: string, parcelCode: string) => {
    if (!window.confirm(`Detach parcel ${parcelCode} from this corridor?`)) return;
    const res = await projectApi.unlinkParcel(project.id, parcelId);
    if (res.success) {
      await loadProjectData();
    } else {
      alert(res.error?.message || 'Failed to unlink parcel.');
    }
  };

  const tabs: {
    id: typeof activeTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    restricted?: boolean;
  }[] = [
    { id: 'overview', label: 'Overview & Health', icon: FolderKanban },
    { id: 'parcels', label: 'Cadastral Parcels', icon: MapPin, count: parcels.length },
    { id: 'gis', label: 'GIS & Alignment', icon: Compass },
    { id: 'acquisition', label: 'Acquisition Stages', icon: GitMerge },
    { id: 'survey', label: 'Joint Survey & DGPS', icon: Layers },
    { id: 'compensation', label: 'Compensation & Awards', icon: Coins, restricted: !canViewFinancials },
    { id: 'rr', label: 'R&R Families', icon: HeartHandshake, count: project.rrFamiliesCount },
    { id: 'documents', label: 'Documents Vault', icon: FileText, count: documents.length, restricted: !canViewDocs },
    { id: 'approvals', label: 'Statutory Approvals', icon: Stamp, count: 6 },
    { id: 'timeline', label: 'Lifecycle Timeline', icon: Clock, count: timelineEvents.length },
    { id: 'audit', label: 'Integrity Audit', icon: ShieldCheck },
  ];

  const filteredParcels = parcels.filter((p) => {
    const q = parcelFilter.toLowerCase();
    return (
      !parcelFilter ||
      p.parcelCode?.toLowerCase().includes(q) ||
      p.surveyNumber?.toLowerCase().includes(q) ||
      p.ownerName?.toLowerCase().includes(q) ||
      p.village?.toLowerCase().includes(q) ||
      p.landType?.toLowerCase().includes(q)
    );
  });

  const filteredDocs = documents.filter((d) => {
    if (docCategoryFilter === 'ALL') return true;
    return d.documentType.toLowerCase().includes(docCategoryFilter.toLowerCase());
  });

  // Available unlinked parcels for linking
  const availableParcels = DEMO_PARCELS.filter((p) => p.projectId !== project.id);

  return (
    <div className="space-y-6 text-left" id="project-360-workspace">
      {/* Top Banner & Project Corridor Identity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white shadow-xs">
                {project.projectCode || project.code}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {project.id}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                {(project.projectType || project.type || 'INFRASTRUCTURE').replace(/_/g, ' ')}
              </span>
              <StatusBadge status={project.status} size="sm" />

              {/* Health Badge */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  health.health === 'ON_TRACK'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : health.health === 'AT_RISK'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.health === 'ON_TRACK'
                      ? 'bg-emerald-500'
                      : health.health === 'AT_RISK'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />
                <span>Health: {health.health.replace(/_/g, ' ')}</span>
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.projectName || project.name}
            </h1>

            <p className="text-xs md:text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            {/* Jurisdiction and Contacts */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {project.subDistrict ? `${project.subDistrict} (${terms.subDistrictLevel}), ` : ''}
                  {project.district}, {project.state}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Completion: <strong>{project.expectedCompletionDate || project.targetCompletion}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Officer: <strong>{project.leadOfficer}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Agency: <strong>{project.implementingAgency || project.nodalAgency}</strong></span>
              </span>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {canChangeStatus && allowedTransitions.length > 0 && (
                <button
                  type="button"
                  id="advance-stage-btn"
                  onClick={() => setShowStatusModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <GitMerge className="w-4 h-4" />
                  <span>Advance Stage</span>
                </button>
              )}

              {canManageDocs && (
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Deposit Doc</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('/gis')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>GIS Map</span>
              </button>

              {canExport && (
                <button
                  type="button"
                  onClick={() => alert(`Exporting Project 360 Dossier for ${project.projectName || project.name}...`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  title="Export Corridor Dossier"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Integrity Anchor: Verified Block #{timelineEvents.length + 12}
            </span>
          </div>
        </div>

        {/* Metric Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Land Area</span>
            <strong className="text-base md:text-lg font-black text-slate-900">
              {(project.landRequiredArea || project.totalAreaAcres || 0).toLocaleString()} <span className="text-xs font-normal">acres</span>
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Parcels</span>
            <strong className="text-base md:text-lg font-black text-slate-900">
              {project.totalParcelsRequired || project.parcelsCount || 0}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Acquired</span>
            <strong className="text-base md:text-lg font-black text-emerald-700">
              {project.acquiredParcels || project.acquiredParcelsCount || 0}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending</span>
            <strong className="text-base md:text-lg font-black text-amber-700">
              {project.pendingParcels || project.pendingParcelsCount || 0}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Compensation</span>
            <strong className="text-base md:text-lg font-black text-slate-900">
              ₹{project.compensationPaid || project.compensationDisbursedCr || 0} <span className="text-xs font-normal text-slate-500">/ ₹{project.compensationBudget || project.compensationBudgetCr || 0} Cr</span>
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100">
            <span className="text-[10px] uppercase font-bold text-cyan-700 block">R&R Families</span>
            <strong className="text-base md:text-lg font-black text-cyan-700">
              {project.rrFamiliesRehabilitated || 0} <span className="text-xs font-normal text-slate-500">/ {project.rrFamiliesCount || 0}</span>
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Overall Progress</span>
            <strong className="text-base md:text-lg font-black text-emerald-300">
              {project.progressPercent || project.progressPercentage || 0}%
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center overflow-x-auto border-b border-slate-200 px-3 py-1.5 scrollbar-thin bg-slate-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;

            if (tab.restricted) return null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
                id={`project-tab-${tab.id}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents Area */}
        <div className="p-5 md:p-6">
          {/* TAB 1: OVERVIEW & HEALTH */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Lifecycle Stage Pipeline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    RFCTLARR 2013 Statutory Stage Progression
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Current Active Stage: {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <LifecycleStepper
                  currentStage={project.currentStage || 'COMPENSATION'}
                  stagesProgress={project.stages}
                  onSelectStage={(stg) => onNavigate(`/acquisition?stage=${stg}`)}
                />
              </div>

              {/* Health Assessment Diagnostic Grid */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Project Health & Schedule Diagnostic</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Deterministic Health Assessment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Variance</span>
                    <strong
                      className={`text-sm font-bold ${
                        health.scheduleVarianceDays > 30
                          ? 'text-red-700'
                          : health.scheduleVarianceDays > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {health.scheduleVarianceDays > 0 ? `+${health.scheduleVarianceDays} days behind` : 'On Schedule'}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Target: {project.targetCompletion}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Variance</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {health.costVarianceCr !== 0 ? `₹${health.costVarianceCr.toFixed(1)} Cr` : 'Within Budget'}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Budget: ₹{project.compensationBudget || project.compensationBudgetCr || 0} Cr
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Risk Factors</span>
                    <strong
                      className={`text-sm font-bold ${
                        health.riskFactors.length > 0 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {health.riskFactors.length} Identified
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {health.riskFactors.length > 0 ? health.riskFactors[0] : 'All milestones healthy'}
                    </span>
                  </div>
                </div>

                {health.riskFactors.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">Attention Required for Compliance SLA:</strong>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                        {health.riskFactors.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid with Cadastral Sample & Administrative Hierarchy */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Cadastral Land Parcels Sample in Corridor
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('parcels')}
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      View All {parcels.length} Parcels <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {parcels.slice(0, 4).map((pcl) => (
                      <div
                        key={pcl.id}
                        onClick={() => onNavigate(`/parcels/${pcl.id}`)}
                        className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {pcl.parcelCode} (Survey {pcl.surveyNumber})
                              </span>
                              <StatusBadge status={pcl.status} size="sm" />
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {pcl.ownerName} • {pcl.village} • {pcl.areaAcres} acres ({pcl.landType})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Award Value</span>
                            <span className="text-xs font-semibold text-slate-800">
                              ₹{(pcl.totalAwardAmount / 100000).toFixed(2)} Lakh
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            360 View →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corridor Hierarchy & Desk Contacts */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Administrative Jurisdictions ({terms.stateLevel} Rules)
                    </h4>
                    <div className="space-y-2 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{terms.stateLevel}:</span>
                        <strong className="text-slate-900">{project.state}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{terms.districtLevel}:</span>
                        <strong className="text-slate-900">{project.district}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{terms.subDistrictLevel}:</span>
                        <strong className="text-slate-900">{project.subDistrict || 'Sub-Division'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{terms.revenueRecordName}:</span>
                        <strong className="text-slate-900">Synchronized (e-Bhulekh)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{terms.landParcelTerm}:</span>
                        <strong className="text-slate-900">{project.totalParcelsRequired || project.parcelsCount} Parcels</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
                    <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Single-Pane 360 Guarantee</span>
                    </h4>
                    <p className="text-emerald-900 leading-relaxed">
                      Every parcel, DGPS survey book, Section 11/19 declaration, compensation voucher, and R&R entitlement is verified against state land records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAND PARCELS */}
          {activeTab === 'parcels' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search parcel code, survey no, landowner, village..."
                    value={parcelFilter}
                    onChange={(e) => setParcelFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {canLinkParcels && (
                    <button
                      type="button"
                      onClick={() => setShowLinkParcelModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach Cadastral Parcel</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    {filteredParcels.length} of {parcels.length} linked parcels
                  </span>
                </div>
              </div>

              {/* Parcels Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Parcel Code</th>
                      <th className="p-3">Survey No.</th>
                      <th className="p-3">Village</th>
                      <th className="p-3">Landowner</th>
                      <th className="p-3">Area</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Compensation</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParcels.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No parcels match the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredParcels.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">{p.parcelCode}</td>
                          <td className="p-3 font-semibold text-slate-800">{p.surveyNumber}</td>
                          <td className="p-3 text-slate-600">{p.village}</td>
                          <td className="p-3 font-medium text-slate-900">{p.ownerName}</td>
                          <td className="p-3 font-semibold text-slate-800">{p.areaAcres} acres</td>
                          <td className="p-3">
                            <StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">
                              ₹{(p.totalAwardAmount / 100000).toFixed(2)} L
                            </span>
                            <span className="text-[10px] text-slate-400">{p.compensationStatus}</span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onNavigate(`/parcels/${p.id}`)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                              >
                                <span>360</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              {canLinkParcels && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkParcel(p.id, p.parcelCode)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Detach Parcel"
                                >
                                  <Unlink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GIS ALIGNMENT */}
          {activeTab === 'gis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Geospatial Alignment & Parcel Corridor Overlay
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preview of project corridor right-of-way (RoW) and cadastral parcel geometries
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/gis')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Open Full GIS Command Center</span>
                </button>
              </div>

              {/* Embedded GIS Visual Canvas */}
              <div className="relative w-full h-80 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 800 320" className="w-full h-full">
                  <defs>
                    <pattern id="proj-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#proj-grid)" />

                  {/* Buffer Zone */}
                  <path
                    d="M 50 160 Q 250 80, 450 160 T 750 160"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="60"
                    strokeOpacity="0.12"
                  />

                  {/* Highway Alignment Centerline */}
                  <path
                    d="M 50 160 Q 250 80, 450 160 T 750 160"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />

                  {/* Cadastral Parcels along corridor */}
                  <polygon
                    points="140,110 200,100 210,140 150,150"
                    fill="#10b981"
                    fillOpacity="0.4"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-opacity-70 transition-all"
                    onClick={() => onNavigate('/parcels/PCL-00422')}
                  >
                    <title>Parcel PCL-00422 (Acquired)</title>
                  </polygon>

                  <polygon
                    points="215,100 280,90 290,135 225,140"
                    fill="#f59e0b"
                    fillOpacity="0.5"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-opacity-70 transition-all"
                    onClick={() => onNavigate('/parcels/PCL-00421')}
                  >
                    <title>Parcel PCL-00421 (Under Compensation)</title>
                  </polygon>

                  <polygon
                    points="295,90 360,85 375,130 305,135"
                    fill="#f43f5e"
                    fillOpacity="0.4"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-opacity-70 transition-all"
                    onClick={() => onNavigate('/parcels/PCL-00423')}
                  >
                    <title>Parcel PCL-00423 (Disputed)</title>
                  </polygon>

                  <polygon
                    points="380,85 450,85 460,130 390,130"
                    fill="#3b82f6"
                    fillOpacity="0.4"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-opacity-70 transition-all"
                    onClick={() => onNavigate('/parcels/PCL-00424')}
                  >
                    <title>Parcel PCL-00424 (Under Verification)</title>
                  </polygon>
                </svg>

                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-white text-[11px] p-2.5 rounded-lg flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Acquired
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> In Compensation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Disputed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACQUISITION WORKFLOW (9 Stages) */}
          {activeTab === 'acquisition' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RFCTLARR 2013 Statutory Acquisition Milestones
                  </h3>
                  <p className="text-xs text-slate-500">
                    SLA tracked legal milestones from Land Identification to Final Audit
                  </p>
                </div>

                {canChangeStatus && allowedTransitions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Advance Stage</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ACQUISITION_STAGES.map((stg) => {
                  const isCurrent = project.currentStage === stg.id || project.status === stg.id;
                  const isPast = stg.stepNumber < (ACQUISITION_STAGES.find((s) => s.id === (project.currentStage || 'COMPENSATION'))?.stepNumber || 6);

                  return (
                    <div
                      key={stg.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                          : isPast
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-50/60 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          STAGE 0{stg.stepNumber}
                        </span>
                        {isPast ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">Upcoming</span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{stg.label}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stg.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Role: <strong className="text-slate-700">{stg.defaultResponsibleRole}</strong></span>
                        <span>SLA: <strong>{stg.averageDays} days</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: JOINT SURVEY & DGPS */}
          {activeTab === 'survey' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Joint Cadastral Survey & DGPS Boundary Pegging
                  </h3>
                  <p className="text-xs text-slate-500">
                    Field measurement books (FMB), Total Station pegging, and drone photogrammetry
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Unit 04 (DGPS Rig 2) Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Boundary Pegging</span>
                  <strong className="text-lg font-black text-slate-900">842 / 920</strong>
                  <span className="text-xs text-emerald-700 block mt-0.5 font-medium">91.5% Pillars Erected</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Drone Orthomosaic</span>
                  <strong className="text-lg font-black text-emerald-700">100% Verified</strong>
                  <span className="text-xs text-slate-500 block mt-0.5 font-medium">Resolution: 2.8 cm/pixel</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">FMB Field Books</span>
                  <strong className="text-lg font-black text-slate-900">14 Villages</strong>
                  <span className="text-xs text-slate-500 block mt-0.5 font-medium">Digitally Sealed</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 mb-2">Survey Team Credentials & Authorization</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Survey Agency:</span>
                    <strong className="text-slate-900">Directorate of Cadastral Survey & Mapping</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Supervising Officer:</span>
                    <strong className="text-slate-900">Er. Ramesh C. Pradhan, Head Surveyor</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Coordinate Reference System:</span>
                    <strong className="text-slate-900">EPSG:4326 (WGS 84) / UTM Zone 44N</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">DGPS Benchmark Tie-in:</span>
                    <strong className="text-slate-900">Survey of India GTS Bench Mark 1042-A</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMPENSATION & AWARDS */}
          {activeTab === 'compensation' && canViewFinancials && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RFCTLARR 2013 Statutory Compensation & Award Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    PFMS / e-Kuber direct benefit treasury transfer records and solatium calculation
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PFMS DBT Active
                </span>
              </div>

              {/* Financial Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sanctioned Budget</span>
                  <strong className="text-lg font-black text-slate-900">
                    ₹{project.compensationBudget || project.compensationBudgetCr || 0} Cr
                  </strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Approved under Section 26</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Disbursed via DBT</span>
                  <strong className="text-lg font-black text-emerald-800">
                    ₹{project.compensationPaid || project.compensationDisbursedCr || 0} Cr
                  </strong>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">Direct to beneficiary accounts</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Disbursement</span>
                  <strong className="text-lg font-black text-amber-800">
                    ₹{((project.compensationBudget || project.compensationBudgetCr || 0) - (project.compensationPaid || project.compensationDisbursedCr || 0)).toFixed(1)} Cr
                  </strong>
                  <span className="text-[11px] text-amber-700 block mt-0.5">Awaiting title clearance</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">100% Solatium Applied</span>
                  <strong className="text-lg font-black text-slate-900">
                    100% (Sec 30)
                  </strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">+ 12% statutory interest</span>
                </div>
              </div>

              {/* Formula explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Statutory Award Formula under First Schedule RFCTLARR 2013</h4>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                  Total Award = (Market Value × Multiplying Factor 1.25) + 100% Solatium + 12% Additional Market Value (from Sec 11 notification date) + Assets Valuation (Structures + Timber/Horticulture)
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: R&R (Rehabilitation & Resettlement) */}
          {activeTab === 'rr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rehabilitation & Resettlement (R&R) Family Tracking
                  </h3>
                  <p className="text-xs text-slate-500">
                    Second Schedule entitlements: Alternate housing, subsistence allowance, and resettlement grants
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                  {project.rrFamiliesRehabilitated || 0} / {project.rrFamiliesCount || 0} Rehabilitated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200">
                  <span className="text-[10px] uppercase font-bold text-cyan-700 block">Homestead Plots Allotted</span>
                  <strong className="text-lg font-black text-cyan-900">186 Plots</strong>
                  <span className="text-[11px] text-cyan-700 block mt-0.5">Equipped with water & power grid</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subsistence Grant (₹5,000/mo)</span>
                  <strong className="text-lg font-black text-slate-900">100% Active</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">12-month tenure delivery</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vocational Training Enrolled</span>
                  <strong className="text-lg font-black text-slate-900">114 Youths</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">State Skill Mission center</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS VAULT */}
          {activeTab === 'documents' && canViewDocs && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    <option value="ALL">All Document Types</option>
                    <option value="Gazette">Statutory Gazette Notifications</option>
                    <option value="Feasibility">DPR & Feasibility Reports</option>
                    <option value="SIA">Social Impact Assessment (SIA)</option>
                    <option value="Clearance">Environmental & NOC Clearances</option>
                  </select>
                </div>

                {canManageDocs && (
                  <button
                    type="button"
                    onClick={() => setShowDocModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deposit Document in Vault</span>
                  </button>
                )}
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    No documents found in this category.
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                            {doc.documentType}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 mt-0.5 hover:text-emerald-700 cursor-pointer">
                            {doc.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">{doc.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span>Uploaded: {doc.uploadedAt}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Sealed
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Downloading verified copy of '${doc.name}'...`)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: STATUTORY APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Statutory Clearances & Section Declarations Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    RFCTLARR 2013 and multi-departmental clearances
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { section: 'Section 11(1)', name: 'Preliminary Notification Publication', authority: 'Competent Authority (CALA)', status: 'PUBLISHED', date: '16 Feb 2025' },
                  { section: 'Section 15', name: 'Hearing of Public Objections', authority: 'Sub-Divisional Magistrate', status: 'HEARING_COMPLETED', date: '02 Apr 2025' },
                  { section: 'Section 19(1)', name: 'Declaration of Acquisition (Statutory Vesting)', authority: 'State Revenue Department', status: 'APPROVED', date: '10 Jun 2025' },
                  { section: 'Section 23', name: 'Enquiry and Award of Land Acquisition', authority: 'CALA / Treasury', status: 'IN_PROGRESS', date: 'Ongoing' },
                  { section: 'MoEFCC NOC', name: 'Forest & Wildlife Corridor Clearance', authority: 'Ministry of Environment, Forest and Climate Change', status: 'CLEARED', date: '14 Dec 2024' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                          {item.section}
                        </span>
                        <strong className="text-slate-900 font-bold">{item.name}</strong>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Issuing Authority: {item.authority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: LIFECYCLE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Immutable Project Lifecycle Timeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological audit log of corridor status transitions, author stamps, and reasons
                  </p>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Transition: {evt.previousStatus} → <strong className="text-emerald-700">{evt.newStatus}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(evt.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-1">
                        Reason: {evt.reason}
                      </p>

                      {evt.remarks && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Remarks: &ldquo;{evt.remarks}&rdquo;
                        </p>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Authorized By: <strong>{evt.changedBy}</strong></span>
                        <span className="font-mono">Event ID: {evt.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: INTEGRITY AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    CRYPTOGRAPHIC CHAIN INTEGRITY
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Tamper-Evident Merkle Root Verified
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Every state transition, boundary polygon modification, and financial compensation voucher is cryptographically signed and hash-anchored.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Merkle Root</span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    0x8f2d...fa8182
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">GENESIS_ANCHOR_VERIFIED</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Immutable Hash Log for Corridor {project.projectCode || project.code}</h4>
                <div className="space-y-2 font-mono text-[11px] text-slate-600">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Block #148 (Section 11 Gazette Publication)</span>
                    <span className="text-slate-400">SHA256: 3a7f8b9c...4d1e2f</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Block #149 (DGPS 438 Pegging Verification)</span>
                    <span className="text-slate-400">SHA256: 9b2c3d4e...5f6a7b</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Block #150 (Section 19 Vesting Declaration)</span>
                    <span className="text-slate-400">SHA256: 1c2d3e4f...8a9b0c</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADVANCE LIFECYCLE STAGE */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  STATUTORY MILESTONE
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Advance Lifecycle Stage</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdvanceStatus} className="p-5 space-y-4 text-xs text-slate-700">
              {statusError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium">
                  {statusError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Current Status</label>
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold">
                  {project.status}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Next Permitted Status *</label>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none"
                >
                  {allowedTransitions.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Only deterministic state machine transitions permitted under RFCTLARR 2013.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Statutory Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joint Cadastral Survey completed; field book sealed."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Administrative Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional gazette references, committee approvals, or SLA observations..."
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {statusSubmitting ? 'Transitioning...' : 'Confirm Stage Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT DOCUMENT IN VAULT */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  STATUTORY DEPOSITORY
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Deposit Document in Vault</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="p-5 space-y-4 text-xs text-slate-700">
              {docError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium">
                  {docError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Document File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH326_Gazette_Sec19_Approved.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Document Category *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                >
                  <option value="Statutory Gazette Notification (Sec 11)">Statutory Gazette Notification (Sec 11)</option>
                  <option value="Declaration of Acquisition (Sec 19)">Declaration of Acquisition (Sec 19)</option>
                  <option value="Corridor Feasibility Study & DPR">Corridor Feasibility Study & DPR</option>
                  <option value="Social Impact Assessment (SIA) Study">Social Impact Assessment (SIA) Study</option>
                  <option value="Environmental & Forest NOC Clearance">Environmental & Forest NOC Clearance</option>
                  <option value="Joint Cadastral Survey Field Book">Joint Cadastral Survey Field Book</option>
                  <option value="PFMS Compensation Award Schedule">PFMS Compensation Award Schedule</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description / Gazette Reference</label>
                <textarea
                  rows={2}
                  placeholder="Provide gazette issue number, issuing authority, and chainage applicability..."
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {docSubmitting ? 'Uploading & Sealing...' : 'Deposit in Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK CADASTRAL PARCEL */}
      {showLinkParcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  CADASTRAL ATTACHMENT
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Attach Parcel to Corridor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkParcelModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <p className="text-slate-500">
                Select an available cadastral survey parcel to link to corridor <strong>{project.projectName || project.name}</strong>:
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Select Parcel</label>
                <select
                  value={selectedParcelToLink}
                  onChange={(e) => setSelectedParcelToLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none"
                >
                  <option value="">-- Choose Parcel --</option>
                  {availableParcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.parcelCode} (Survey #{p.surveyNumber} • {p.village} • {p.areaAcres} ac)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkParcelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkParcel}
                  disabled={!selectedParcelToLink}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  Attach Parcel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
