import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  ChevronRight,
  TrendingUp,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Building,
  User,
  X,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  ArrowUpDown,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { projectApi } from '../services/apiClient';
import { authService } from '../services/authService';
import { calculateProjectHealth, ProjectHealthSummary } from '../lib/projectHealth';
import { getStateTerminology, getAllStateNames } from '../lib/locationHierarchy';
import { Project, ProjectPriority, ProjectStatus, ProjectType } from '../types';

interface ProjectsListPageProps {
  onNavigate: (route: string) => void;
}

export const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // New Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ProjectType>('NATIONAL_HIGHWAY');
  const [formState, setFormState] = useState('Odisha');
  const [formDistrict, setFormDistrict] = useState('');
  const [formSubDistrict, setFormSubDistrict] = useState('');
  const [formAgency, setFormAgency] = useState('National Highways Authority of India (NHAI)');
  const [formOfficer, setFormOfficer] = useState('');
  const [formPriority, setFormPriority] = useState<ProjectPriority>('HIGH');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTargetDate, setFormTargetDate] = useState('2027-12-31');
  const [formLandArea, setFormLandArea] = useState('850');
  const [formParcels, setFormParcels] = useState('320');
  const [formCost, setFormCost] = useState('240.5');
  const [formCompBudget, setFormCompBudget] = useState('45.0');
  const [formDescription, setFormDescription] = useState('');

  // RBAC checks
  const canCreate = authService.hasPermission('project.create');
  const canDelete = authService.hasPermission('project.delete');
  const canExport = authService.hasPermission('project.export');

  const loadProjects = async () => {
    setLoading(true);
    const res = await projectApi.getAll();
    if (res.success && res.data) {
      setProjects(res.data.projects);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!formCode.trim() || !formName.trim() || !formDistrict.trim()) {
      setCreateError('Please complete all mandatory fields (Code, Name, State, District).');
      return;
    }

    setCreateSubmitting(true);
    const res = await projectApi.create({
      projectCode: formCode.trim().toUpperCase(),
      projectName: formName.trim(),
      projectType: formType,
      state: formState,
      district: formDistrict.trim(),
      subDistrict: formSubDistrict.trim() || 'Headquarters Tehsil',
      implementingAgency: formAgency.trim(),
      leadOfficer: formOfficer.trim() || 'Special Land Acquisition Officer (CALA)',
      priority: formPriority,
      startDate: formStartDate,
      expectedCompletionDate: formTargetDate,
      landRequiredArea: parseFloat(formLandArea) || 0,
      totalParcelsRequired: parseInt(formParcels, 10) || 0,
      estimatedCost: parseFloat(formCost) || 0,
      compensationBudget: parseFloat(formCompBudget) || 0,
      description: formDescription.trim() || `Infrastructure corridor scheme under ${formAgency}.`,
    });

    setCreateSubmitting(false);

    if (!res.success) {
      setCreateError(res.error?.message || 'Failed to create project corridor.');
      return;
    }

    setShowCreateModal(false);
    resetForm();
    await loadProjects();
  };

  const handleDeleteProject = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to archive/delete project corridor '${name}'? This action is audited.`)) {
      return;
    }

    const res = await projectApi.delete(id);
    if (res.success) {
      await loadProjects();
    } else {
      alert(res.error?.message || 'Failed to delete project.');
    }
  };

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormDistrict('');
    setFormSubDistrict('');
    setFormOfficer('');
    setFormDescription('');
  };

  // State-agnostic terminology for the currently selected state in form
  const formTerms = getStateTerminology(formState);

  // Filter projects
  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.projectName?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.projectCode?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.state?.toLowerCase().includes(q) ||
      p.leadOfficer?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
    const matchesSector = sectorFilter === 'ALL' || p.projectType === sectorFilter || p.type === sectorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSector;
  });

  // Calculate portfolio KPIs
  const totalLandRequired = projects.reduce((acc, p) => acc + (p.landRequiredArea || p.totalAreaAcres || 0), 0);
  const totalCompensationBudget = projects.reduce((acc, p) => acc + (p.compensationBudget || p.compensationBudgetCr || 0), 0);
  const totalCompensationDisbursed = projects.reduce((acc, p) => acc + (p.compensationPaid || p.compensationDisbursedCr || 0), 0);
  const atRiskCount = projects.filter((p) => {
    const h = calculateProjectHealth(p);
    return h.health === 'AT_RISK' || h.health === 'DELAYED' || h.health === 'BLOCKED';
  }).length;

  const statesList = getAllStateNames();

  return (
    <div className="space-y-6 text-left" id="projects-list-page">
      {/* Portfolio Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              NATIONAL PORTFOLIO
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {projects.length} Total Corridors • Phase 3 Project 360 Workspace
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Infrastructure Acquisition Corridors
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
            State-agnostic lifecycle monitoring, cadastral boundary alignment, and statutory RFCTLARR 2013 acquisition tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              type="button"
              id="register-corridor-btn"
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Corridor</span>
            </button>
          )}

          {canExport && (
            <button
              type="button"
              onClick={() => alert('Exporting consolidated national portfolio dossier (PDF/Excel)...')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Export Portfolio Dossier"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Corridors</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{projects.length}</div>
          <span className="text-[11px] text-slate-500 font-medium">Across multiple states</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Land Area</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {totalLandRequired.toLocaleString()} <span className="text-xs font-normal text-slate-500">acres</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Under statutory acquisition</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Compensation Budget</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            ₹{totalCompensationBudget.toFixed(1)} <span className="text-xs font-normal text-slate-500">Cr</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">₹{totalCompensationDisbursed.toFixed(1)} Cr disbursed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Corridor Health</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-700">
            {projects.length - atRiskCount} <span className="text-xs font-normal text-slate-400">/ {projects.length}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Healthy & On Schedule</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 col-span-2 sm:col-span-4 lg:col-span-1 shadow-xs">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">At Risk / Delayed</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-rose-800">{atRiskCount}</div>
          <span className="text-[11px] text-rose-700 font-medium">Requires SLA mitigation</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search corridor code, project name, district, officer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* View mode and controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dense Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning & DPR</option>
            <option value="LAND_IDENTIFICATION">Land Identification (Sec 11)</option>
            <option value="SURVEY">Joint Cadastral Survey</option>
            <option value="VERIFICATION">Record Verification</option>
            <option value="PROPOSAL">Draft Declaration (Sec 19)</option>
            <option value="APPROVAL">Statutory Approval</option>
            <option value="COMPENSATION">Award & Compensation</option>
            <option value="RR">R&R Execution</option>
            <option value="POSSESSION">Physical Possession</option>
            <option value="ACQUISITION_IN_PROGRESS">Acquisition In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Infrastructure Sectors</option>
            <option value="NATIONAL_HIGHWAY">National Highway / Expressway</option>
            <option value="RAILWAY">Freight & Passenger Railway</option>
            <option value="POWER_INFRASTRUCTURE">Power & Renewable Energy</option>
            <option value="METRO_TRANSIT">Metro & Urban Transit</option>
            <option value="AIRPORT">Airport & Aviation</option>
            <option value="PORT">Port & Maritime</option>
            <option value="INDUSTRIAL_CORRIDOR">Industrial & Logistics Corridor</option>
            <option value="DEFENSE_STRATEGIC">Strategic Defense Zone</option>
          </select>

          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || sectorFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setSectorFilter('ALL');
              }}
              className="text-[11px] text-emerald-700 font-bold hover:underline px-2"
            >
              Reset Filters
            </button>
          )}

          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            Showing {filtered.length} of {projects.length} corridors
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          <FolderKanban className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
          <p className="text-sm font-semibold">Synchronizing Project Portfolio...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No project corridors found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No infrastructure corridor matches your filter criteria. Try adjusting filters or register a new corridor scheme.
          </p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filtered.map((proj) => {
            const health = calculateProjectHealth(proj);
            const terms = getStateTerminology(proj.state);

            return (
              <div
                key={proj.id}
                onClick={() => onNavigate(`/projects/${proj.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                id={`project-card-${proj.id}`}
              >
                <div>
                  {/* Top line with code, priority, health badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white shadow-xs">
                        {proj.projectCode || proj.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {(proj.projectType || proj.type || 'INFRASTRUCTURE').replace(/_/g, ' ')}
                      </span>
                      {proj.priority === 'CRITICAL' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                          CRITICAL
                        </span>
                      )}
                      {proj.priority === 'HIGH' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          HIGH
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Health Indicator */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          health.health === 'ON_TRACK'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : health.health === 'AT_RISK'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                        title={health.riskFactors.join(', ') || 'Corridor on track'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            health.health === 'ON_TRACK'
                              ? 'bg-emerald-500'
                              : health.health === 'AT_RISK'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span>{health.health.replace(/_/g, ' ')}</span>
                      </span>

                      <StatusBadge status={proj.status} size="sm" />
                    </div>
                  </div>

                  {/* Title & Location */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {proj.projectName || proj.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {proj.subDistrict ? `${proj.subDistrict} (${terms.subDistrictLevel}), ` : ''}
                        {proj.district}, {proj.state}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {proj.implementingAgency || proj.nodalAgency || 'State Infrastructure Directorate'}
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-500">Land Acquisition Velocity</span>
                      <span className="text-slate-900">{proj.progressPercent || proj.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (proj.progressPercent || 0) > 70
                            ? 'bg-emerald-500'
                            : (proj.progressPercent || 0) > 40
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${proj.progressPercent || proj.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 Metric blocks */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Land Required</span>
                      <strong className="text-slate-800">{proj.landRequiredArea || proj.totalAreaAcres || 0} ac</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Parcels Acquired</span>
                      <strong className="text-emerald-700">
                        {proj.acquiredParcels || proj.acquiredParcelsCount || 0} / {proj.totalParcelsRequired || proj.parcelsCount || 0}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Comp. Disbursed</span>
                      <strong className="text-slate-800">
                        ₹{proj.compensationPaid || proj.compensationDisbursedCr || 0} Cr
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.leadOfficer || 'Project Executive Officer'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProject(proj.id, proj.projectName || proj.name, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Corridor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                      Project 360 Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Corridor Code</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">State & District</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4 text-right">Land (Acres)</th>
                  <th className="py-3 px-4 text-right">Parcels</th>
                  <th className="py-3 px-4 text-right">Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proj) => {
                  const health = calculateProjectHealth(proj);

                  return (
                    <tr
                      key={proj.id}
                      onClick={() => onNavigate(`/projects/${proj.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {proj.projectCode || proj.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block hover:text-emerald-700">
                          {proj.projectName || proj.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {proj.implementingAgency || proj.nodalAgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium block">{proj.district}</span>
                        <span className="text-[11px] text-slate-400">{proj.state}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {(proj.projectType || proj.type || 'INFRASTRUCTURE').replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={proj.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            health.health === 'ON_TRACK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : health.health === 'AT_RISK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {health.health}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {(proj.landRequiredArea || proj.totalAreaAcres || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {proj.acquiredParcels || proj.acquiredParcelsCount || 0} / {proj.totalParcelsRequired || proj.parcelsCount || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-800">{proj.progressPercent || 0}%</span>
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${proj.progressPercent || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`/projects/${proj.id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Open 360
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER NEW CORRIDOR MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  SCHEME REGISTRATION
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">Register New Project Corridor</h2>
                <p className="text-xs text-slate-500">
                  Defines project right-of-way, location hierarchy, and statutory acquisition targets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="p-5 space-y-4 text-xs text-slate-700">
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NH-44-EXP"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Project Corridor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Quadrilateral Bypass Corridor Phase IV"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Infrastructure Sector *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ProjectType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    <option value="NATIONAL_HIGHWAY">National Highway / Expressway</option>
                    <option value="STATE_HIGHWAY">State Highway / PWD Corridor</option>
                    <option value="RAILWAY">Freight / High Speed Railway</option>
                    <option value="METRO_TRANSIT">Metro & Urban Transit</option>
                    <option value="POWER_INFRASTRUCTURE">Power & Renewable Energy</option>
                    <option value="INDUSTRIAL_CORRIDOR">Industrial & Logistics Corridor</option>
                    <option value="AIRPORT">Airport & Aviation</option>
                    <option value="PORT">Port & Maritime</option>
                    <option value="IRRIGATION_CANAL">Irrigation Canal Network</option>
                    <option value="DEFENSE_STRATEGIC">Strategic Defense Installation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Priority Level *</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ProjectPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    <option value="CRITICAL">Critical Priority (PMO / Apex Review)</option>
                    <option value="HIGH">High Priority (State Focus Scheme)</option>
                    <option value="MEDIUM">Medium Priority (Standard Schedule)</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Row 3: State-Agnostic Location Hierarchy */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Administrative Jurisdiction & Hierarchy
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Terms adapt automatically to selected State
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{formTerms.stateLevel} *</label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none"
                    >
                      {statesList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{formTerms.districtLevel} *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sambalpur"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{formTerms.subDistrictLevel}</label>
                    <input
                      type="text"
                      placeholder={`e.g. Rairakhol ${formTerms.subDistrictLevel}`}
                      value={formSubDistrict}
                      onChange={(e) => setFormSubDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Implementing Agency & Lead Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Implementing Agency / Nodal Body *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NHAI Regional Office / State PWD"
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lead Land Acquisition Officer (CALA)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shri Anand Varma, OAS (SLAO)"
                    value={formOfficer}
                    onChange={(e) => setFormOfficer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Project Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Land & Financial Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Land Req. (Acres) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formLandArea}
                    onChange={(e) => setFormLandArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Estimated Parcels *</label>
                  <input
                    type="number"
                    required
                    value={formParcels}
                    onChange={(e) => setFormParcels(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Est. Cost (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Comp. Budget (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCompBudget}
                    onChange={(e) => setFormCompBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Corridor Description & Alignment Summary</label>
                <textarea
                  rows={2}
                  placeholder="Specify alignment chainages, major revenue villages traversed, and corridor rationale..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs flex items-center gap-2"
                >
                  {createSubmitting ? 'Registering Corridor...' : 'Register Project Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
