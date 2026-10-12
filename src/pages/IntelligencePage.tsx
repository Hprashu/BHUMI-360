import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

interface IntelligencePageProps {
  onNavigate: (route: string) => void;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({ onNavigate }) => {
  const [activePrompt, setActivePrompt] = useState(
    'Identify compensation anomalies & timeline bottlenecks across NH-326 corridor'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [resultsShown, setResultsShown] = useState(true);

  const samplePrompts = [
    'Identify compensation anomalies & timeline bottlenecks across NH-326 corridor',
    'Draft objection resolution for Parcel PCL-00423 under Section 15',
    'Summarize pending R&R rehabilitation packages in Demo District',
    'Verify cryptographic audit hash chain integrity for Q3 2026',
  ];

  const handleRunAnalysis = (prompt: string) => {
    setActivePrompt(prompt);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResultsShown(true);
    }, 600);
  };

  const plannedTools = [
    { name: 'getProjectStatus(projectId)', desc: 'Fetches corridor KPI metrics, stage distribution & progress.' },
    { name: 'getParcelDetails(parcelId)', desc: 'Retrieves cadastral, ownership, award, and RoR verification records.' },
    { name: 'getPendingApprovals(role, district)', desc: 'Extracts statutory sign-off queue for logged-in authority.' },
    { name: 'getDelayedCases(stage, thresholdDays)', desc: 'Identifies SLA breaches across all active acquisition pipelines.' },
    { name: 'getCompensationStatus(projectId)', desc: 'Evaluates circle rate multipliers, solatium & PFMS transaction logs.' },
    { name: 'getRRStatus(projectId)', desc: 'Audits family rehabilitation claims against National R&R Policy 2007.' },
    { name: 'getAuditHistory(entityType, entityId)', desc: 'Validates cryptographic Merkle chain for tamper detection.' },
    { name: 'searchDocuments(query)', desc: 'Semantic search across Field Books, Gazette S.O. orders & deeds.' },
    { name: 'generateReport(type, params)', desc: 'Synthesizes executive brief in PDF/Excel standard format.' },
  ];

  return (
    <div className="space-y-6 text-left" id="bhumi-intelligence-page">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>DECISION SUPPORT WORKBENCH</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Human-in-the-Loop Statutory Governance
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            BHUMI Intelligence Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Algorithmic anomaly detection, statutory objection drafting, and bottleneck analytics grounded in the RFCTLARR Act 2013.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Unapproved Autonomous Action</span>
          </span>
        </div>
      </div>

      {/* Query Bar with Preset Chips */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Bot className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
            <input
              type="text"
              value={activePrompt}
              onChange={(e) => setActivePrompt(e.target.value)}
              placeholder="Ask BHUMI Intelligence (e.g., Identify compensation anomalies, draft notice...)"
              className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRunAnalysis(activePrompt)}
            disabled={analyzing}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{analyzing ? 'Reasoning...' : 'Run Decision Analysis'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Suggested Queries:</span>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunAnalysis(sp)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left truncate max-w-xs"
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Output Container */}
      {resultsShown && (
        <div className="space-y-6">
          {/* Main Reasoning Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900">
                    Decision Analysis Synthesis
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Invoked Tools: getProjectStatus(), getDelayedCases(), getCompensationStatus()
                  </span>
                </div>
              </div>

              {/* Confidence & Statutory Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Confidence: 96.4%
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Rule: Sec 26-30 RFCTLARR</span>
                </span>
              </div>
            </div>

            {/* Findings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Finding 1 */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-900 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Bottleneck Alert: Stage 06 Compensation Lag</span>
                  </strong>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Critical Delay
                  </span>
                </div>
                <p className="text-amber-950 leading-relaxed">
                  186 parcels across 3 revenue villages in Demo District have exceeded the 45-day SLA for award disbursement following Section 37 Gazette notification.
                </p>
                <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-800 flex justify-between">
                  <span>Ground truth data source:</span>
                  <strong className="font-mono">CALA PFMS Batch Queue #04</strong>
                </div>
              </div>

              {/* Finding 2 */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-blue-900 font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-700" />
                    <span>Suggested Action: Expedite Escrow Release</span>
                  </strong>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    CALA Approval Req.
                  </span>
                </div>
                <p className="text-blue-950 leading-relaxed">
                  Automate generation of Form-G payment orders for 42 undisputed agricultural parcels totaling ₹6.4 Cr to restore pipeline schedule by 18 days.
                </p>
                <div className="pt-2 border-t border-blue-200/70 text-[11px] text-blue-800 flex justify-between">
                  <span>Statutory Reference:</span>
                  <strong>Section 77(2) PFMS Direct Credit</strong>
                </div>
              </div>
            </div>

            {/* Human Sign-Off Action Bar */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block">Human-in-the-Loop Verification Required</span>
                  <span className="text-slate-400 text-[11px]">
                    No algorithmic recommendation is executed without explicit DSC / e-Sign authorization by the Competent Authority.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/acquisition?stage=COMPENSATION')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Review in Compensation Desk →
                </button>
              </div>
            </div>
          </div>

          {/* Planned AI Engine Tools Architecture (Section 34) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Registered Tool Interface Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic, read-only tools exposed to the LLM agent via strict schemas to prevent hallucinations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {plannedTools.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <code className="text-emerald-800 font-bold font-mono text-[11px] block">
                    {tool.name}
                  </code>
                  <p className="text-slate-500 text-[11px] leading-snug">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
