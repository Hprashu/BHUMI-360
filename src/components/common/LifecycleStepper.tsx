import React, { useState } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Info,
  User,
  Calendar,
} from 'lucide-react';
import { ACQUISITION_STAGES } from '../../data/mockData';
import { AcquisitionStage, ProjectStageProgress, StageStatus } from '../../types';

interface LifecycleStepperProps {
  currentStage?: AcquisitionStage;
  stagesProgress?: ProjectStageProgress[];
  onSelectStage?: (stage: AcquisitionStage) => void;
  interactive?: boolean;
  compact?: boolean;
}

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({
  currentStage = 'COMPENSATION',
  stagesProgress,
  onSelectStage,
  interactive = true,
  compact = false,
}) => {
  const [activeHoverStage, setActiveHoverStage] = useState<AcquisitionStage | null>(null);

  const getStageStatus = (stageId: AcquisitionStage, stepNumber: number): StageStatus => {
    if (stagesProgress) {
      const match = stagesProgress.find((s) => s.stage === stageId);
      if (match) return match.status;
    }

    const currentStageIndex = ACQUISITION_STAGES.findIndex((s) => s.id === currentStage);
    const thisIndex = stepNumber - 1;

    if (thisIndex < currentStageIndex) return 'completed';
    if (thisIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  const getStageProgressData = (stageId: AcquisitionStage) => {
    return stagesProgress?.find((s) => s.stage === stageId);
  };

  const selectedStageMeta = ACQUISITION_STAGES.find((s) => s.id === (activeHoverStage || currentStage));
  const selectedStageProgress = selectedStageMeta ? getStageProgressData(selectedStageMeta.id) : undefined;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5" id="lifecycle-stepper">
      {/* Header with Title and Current Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Statutory Workflow
            </span>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">
              Land Acquisition Lifecycle (RFCTLARR Act Aligned)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            9-Stage End-to-End Governance Pipeline: Identification to Possession & Final Closure
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Active Stage
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Upcoming
          </span>
        </div>
      </div>

      {/* Horizontal Visual Pipeline (Desktop / Tablet Scrollable) */}
      <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <div className="min-w-[780px] flex items-center justify-between relative">
          {/* Connector Line behind steps */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0" />

          {ACQUISITION_STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.id, stage.stepNumber);
            const isSelected = (activeHoverStage || currentStage) === stage.id;
            const progress = getStageProgressData(stage.id);

            let nodeBg = 'bg-white border-slate-300 text-slate-400';
            let icon = <span className="text-xs font-semibold">{stage.stepNumber}</span>;
            let tagBg = 'text-slate-500';

            if (status === 'completed') {
              nodeBg = 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/30';
              icon = <Check className="w-4 h-4 stroke-[2.5]" />;
              tagBg = 'text-emerald-700 font-semibold';
            } else if (status === 'current') {
              nodeBg = 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 shadow-sm shadow-amber-500/30';
              icon = <Clock className="w-4 h-4 stroke-[2.5] animate-spin-slow" />;
              tagBg = 'text-amber-700 font-bold';
            } else if (status === 'delayed') {
              nodeBg = 'bg-rose-500 border-rose-500 text-white ring-4 ring-rose-100';
              icon = <AlertCircle className="w-4 h-4 stroke-[2.5]" />;
              tagBg = 'text-rose-700 font-semibold';
            } else if (status === 'blocked') {
              nodeBg = 'bg-slate-800 border-slate-800 text-white';
              icon = <ShieldAlert className="w-4 h-4" />;
              tagBg = 'text-slate-800 font-semibold';
            }

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  if (interactive && onSelectStage) {
                    onSelectStage(stage.id);
                  }
                  setActiveHoverStage(stage.id);
                }}
                onMouseEnter={() => setActiveHoverStage(stage.id)}
                className={`relative z-10 flex flex-col items-center group text-center focus:outline-none transition-all px-1 ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
                id={`lifecycle-stage-node-${stage.id.toLowerCase()}`}
              >
                {/* Step Circle Node */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${nodeBg}`}
                >
                  {icon}
                </div>

                {/* Step Number & Label */}
                <div className="mt-2 flex flex-col items-center max-w-[85px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    0{stage.stepNumber}
                  </span>
                  <span
                    className={`text-xs leading-tight font-medium mt-0.5 transition-colors line-clamp-2 ${
                      isSelected ? 'text-slate-900 font-bold' : tagBg
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>

                {/* Mini Status Tag */}
                <span
                  className={`mt-1 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'current'
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {status === 'completed'
                    ? 'Done'
                    : status === 'current'
                    ? `${progress?.completionPercentage ?? 75}%`
                    : 'Pending'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Insight Bar */}
      {selectedStageMeta && (
        <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 max-w-xl">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Stage 0{selectedStageMeta.stepNumber}: {selectedStageMeta.label}
                </span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  Target SLA: {selectedStageMeta.averageDays} days
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {selectedStageMeta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Desk:{' '}
                <strong className="text-slate-800">
                  {selectedStageProgress?.assignedOfficer || selectedStageMeta.defaultResponsibleRole.replace(/_/g, ' ')}
                </strong>
              </span>
            </div>
            {selectedStageProgress?.completedDate && (
              <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Passed:{' '}
                  <strong className="text-emerald-700">{selectedStageProgress.completedDate}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
