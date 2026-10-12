import React, { useState } from 'react';
import {
  GitMerge,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  User,
  Calendar,
  Layers,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';
import { LifecycleStepper } from '../components/common/LifecycleStepper';
import { StatusBadge } from '../components/common/StatusBadge';
import { ACQUISITION_STAGES, DEMO_PARCELS } from '../data/mockData';
import { AcquisitionStage } from '../types';

interface AcquisitionWorkflowPageProps {
  onNavigate: (route: string) => void;
}

export const AcquisitionWorkflowPage: React.FC<AcquisitionWorkflowPageProps> = ({ onNavigate }) => {
  const [selectedStage, setSelectedStage] = useState<AcquisitionStage>('COMPENSATION');

  const stageData = ACQUISITION_STAGES.find((s) => s.id === selectedStage);
  const parcelsInStage = DEMO_PARCELS.filter((p) => p.currentStage === selectedStage);

  return (
    <div className="space-y-6 text-left" id="acquisition-workflow-page">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              STATUTORY WORKFLOW ENGINE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              RFCTLARR Act 2013 Governance Compliance
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Acquisition Lifecycle Management
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            End-to-end stage verification, statutory milestone sign-offs, and automated SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Average Lifecycle Duration: <strong>210 Days</strong>
          </span>
        </div>
      </div>

      {/* Reusable Interactive 9-Stage Stepper */}
      <LifecycleStepper
        currentStage={selectedStage}
        onSelectStage={(stg) => setSelectedStage(stg)}
      />

      {/* Stage Detail Workspace */}
      {stageData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Stage Info & Parcels Currently at this Stage */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    STAGE 0{stageData.stepNumber} WORKBENCH
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {stageData.label}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">
                    Target SLA: <strong className="text-slate-900">{stageData.averageDays} days</strong>
                  </span>
                  <span className="text-slate-500">
                    Desk: <strong className="text-slate-900">{stageData.defaultResponsibleRole.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {stageData.description}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Parcels Currently Pending at this Stage ({parcelsInStage.length})
                  </h4>
                </div>

                {parcelsInStage.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    All active parcels have progressed beyond Stage 0{stageData.stepNumber}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {parcelsInStage.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onNavigate(`/parcels/${p.id}`)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 group text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {p.parcelCode} (Survey {p.surveyNumber})
                            </span>
                            <StatusBadge status={p.status} size="sm" />
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {p.ownerName} • {p.village} • {p.areaAcres} acres
                          </span>
                        </div>

                        <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                          Inspect 360 <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Statutory Checklist & Regulatory Context */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Stage Statutory Checklist
              </h4>
              <div className="space-y-2 text-slate-600">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-emerald-600" />
                  <span>Georeferenced alignment verification & GIS vector overlay</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-emerald-600" />
                  <span>State RoR/Khata cross-reference & encumbrance certificate</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-emerald-600" />
                  <span>Section 15 objection resolution & public notice window</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-600" />
                  <span>Competent Authority digital token signing (e-Sign / DSC)</span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs">
              <span className="font-bold text-white block mb-1">Audit Trail Anchoring</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Stage progression generates an immutable event in the BHUMI 360 audit ledger. Stage transitions require dual-role confirmation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
