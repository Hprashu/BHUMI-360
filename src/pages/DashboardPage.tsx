import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  MapPin,
  CheckCircle2,
  Clock,
  Coins,
  HeartHandshake,
  AlertTriangle,
  Stamp,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Compass,
  FileText,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { LifecycleStepper } from '../components/common/LifecycleStepper';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApp } from '../context/AppContext';
import { DataService, DashboardKPIs } from '../services/dataService';
import { Project } from '../types';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { roleProfile, setIsSearchOpen } = useApp();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

  useEffect(() => {
    DataService.getDashboardKPIs().then(setKpis);
    DataService.getProjects().then(setProjects);
  }, []);

  const triggerQuickAction = (msg: string, targetRoute?: string) => {
    setQuickActionNotice(msg);
    setTimeout(() => setQuickActionNotice(null), 3500);
    if (targetRoute) {
      onNavigate(targetRoute);
    }
  };

  const currentDateFormatted = 'Monday, 14 September 2026';

  return (
    <div className="space-y-6" id="dashboard-page">
      {/* Quick Action Toast */}
      {quickActionNotice && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{quickActionNotice}</span>
        </div>
      )}

      {/* Greeting & Executive Portfolio Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{currentDateFormatted}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase text-[10px]">
              Live Portfolio Synced
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {roleProfile.name.split(' ')[0]}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Here is the current operational status of your national infrastructure land acquisition portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/gis')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-xs"
            id="dash-open-gis-btn"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Open GIS Command Center</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* High-Value KPI Cards (Section 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="dashboard-kpi-grid">
        {/* KPI 1: Active Projects */}
        <div
          onClick={() => onNavigate('/projects')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            {kpis?.activeProjects ?? 24}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active Corridors</div>
        </div>

        {/* KPI 2: Total Parcels */}
        <div
          onClick={() => onNavigate('/parcels')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Parcels</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
            {kpis?.totalParcels.toLocaleString() ?? '12,486'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under Acquisition</div>
        </div>

        {/* KPI 3: Acquired */}
        <div
          onClick={() => onNavigate('/parcels?filter=acquired')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Acquired</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-700">
            {kpis?.acquiredParcels.toLocaleString() ?? '8,942'}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">71.6% of Total</div>
        </div>

        {/* KPI 4: Pending */}
        <div
          onClick={() => onNavigate('/parcels?filter=pending')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-700">
            {kpis?.pendingAcquisition.toLocaleString() ?? '2,731'}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">In Pipeline</div>
        </div>

        {/* KPI 5: Compensation Disbursed */}
        <div
          onClick={() => onNavigate('/compensation')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compensation</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            ₹{kpis?.compensationDisbursedCr ?? '184.6'}<span className="text-xs font-bold text-slate-500 ml-0.5">Cr</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">75.3% of ₹245 Cr</div>
        </div>

        {/* KPI 6: R&R Completed */}
        <div
          onClick={() => onNavigate('/rr')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">R&R Families</span>
            <HeartHandshake className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
            {kpis?.rrCompletedFamilies.toLocaleString() ?? '6,284'}
          </div>
          <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">Benefits Settled</div>
        </div>

        {/* KPI 7: Delayed Cases */}
        <div
          onClick={() => onNavigate('/parcels?filter=disputed')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delayed</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-rose-700">
            {kpis?.delayedCases ?? 317}
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">SLA Exceeded</div>
        </div>

        {/* KPI 8: Approvals Pending */}
        <div
          onClick={() => onNavigate('/approvals')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approvals</span>
            <Stamp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-purple-700">
            {kpis?.pendingApprovals ?? 86}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Action Required</div>
        </div>
      </div>

      {/* Acquisition Lifecycle Reusable Pipeline (Section 14A & 17) */}
      <LifecycleStepper
        currentStage="COMPENSATION"
        onSelectStage={(stg) => onNavigate(`/acquisition?stage=${stg}`)}
      />

      {/* Main Two-Column Analysis & Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects + Status Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Infrastructure Corridors (Section 14E) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">
                  Priority Infrastructure Corridors
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live land acquisition tracking across national highways, rail links & energy corridors
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/projects')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate(`/projects/${proj.id}`)}
                  className="p-4 md:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {proj.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {proj.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {proj.district}, {proj.state}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={proj.status} size="sm" />
                      <span className="text-xs font-bold text-slate-900">{proj.progressPercent}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        proj.progressPercent >= 70
                          ? 'bg-emerald-500'
                          : proj.progressPercent >= 40
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>

                  {/* Micro stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Land Required</span>
                      <span className="font-semibold text-slate-800">{proj.totalAreaAcres.toLocaleString()} acres</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Parcels Acquired</span>
                      <span className="font-semibold text-emerald-700">
                        {proj.acquiredParcelsCount} / {proj.parcelsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Compensation</span>
                      <span className="font-semibold text-slate-800">
                        ₹{proj.compensationDisbursedCr} Cr / ₹{proj.compensationBudgetCr} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Stage</span>
                      <span className="font-semibold text-amber-700 capitalize">
                        {proj.currentStage.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compensation & R&R Structured Distributions (Section 14B, 14C, 14D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Compensation Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Compensation Awards</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/compensation')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View Details →
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Disbursed to Escrow/PFMS</span>
                    <span className="font-bold text-emerald-700">₹184.6 Cr (75.3%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75.3%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Budget</span>
                    <strong className="text-slate-900">₹245.0 Cr</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Awards Passed</span>
                    <strong className="text-amber-700">₹218.2 Cr</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending</span>
                    <strong className="text-slate-600">₹60.4 Cr</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* R&R Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-100 text-cyan-800">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Rehabilitation & Resettlement</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/rr')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View Details →
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Delivered Packages</span>
                    <span className="font-bold text-cyan-700">6,284 / 7,850 (80.1%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '80.1%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Eligible</span>
                    <strong className="text-slate-900">7,850 Fam.</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Plots Allotted</span>
                    <strong className="text-emerald-700">5,910</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending</span>
                    <strong className="text-amber-700">1,566</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions + Operational Alerts + BHUMI Intelligence */}
        <div className="space-y-6">
          {/* Quick Actions (Section 15) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Operational Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => triggerQuickAction('Opening Project Registration Wizard...', '/projects')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <FolderKanban className="w-4 h-4 text-blue-600 mb-1" />
                <span>Create Project</span>
              </button>

              <button
                type="button"
                onClick={() => triggerQuickAction('Opening Cadastral Parcel Registration form...', '/parcels')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <MapPin className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Register Parcel</span>
              </button>

              <button
                type="button"
                onClick={() => triggerQuickAction('Opening DGPS Joint Field Survey desk...', '/survey')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <Compass className="w-4 h-4 text-teal-600 mb-1" />
                <span>Start Survey</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/approvals')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <Stamp className="w-4 h-4 text-purple-600 mb-1" />
                <span>Review Approvals</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/documents')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <FileText className="w-4 h-4 text-indigo-600 mb-1" />
                <span>Upload Document</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/analytics')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 transition-all text-center"
              >
                <TrendingUp className="w-4 h-4 text-amber-600 mb-1" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Real-time Alerts & Bottlenecks (Section 14F) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Operational Alerts & Insights</span>
              </h3>
              <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                3 Actionable
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate('/parcels?filter=pending')}
                className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                  <span>Verification Delay Warning</span>
                  <span className="text-[10px] text-amber-700">SLA Exceeded</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  17 parcels have remained under title verification for more than 30 days in Sompeta Village.
                </p>
              </div>

              <div
                onClick={() => onNavigate('/compensation')}
                className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between text-rose-900 font-bold mb-1">
                  <span>Pending Treasury Release</span>
                  <span className="text-[10px] text-rose-700">Action Req</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  ₹8.4 Cr compensation passed in Award Batch #04 is pending treasury disbursement.
                </p>
              </div>

              <div
                onClick={() => onNavigate('/approvals')}
                className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between text-blue-900 font-bold mb-1">
                  <span>Statutory Review Queue</span>
                  <span className="text-[10px] text-blue-700">Section 19</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  12 approval requests require immediate competent authority digital signature.
                </p>
              </div>
            </div>
          </div>

          {/* BHUMI Intelligence Teaser Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                BHUMI Intelligence
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              AI-Assisted Decision Support & Predictive Bottleneck Analytics
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Authorized tool execution with human-in-the-loop validation for compensation forecasting, SLA compliance and title risk scoring.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/intelligence')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              <span>Launch BHUMI Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
