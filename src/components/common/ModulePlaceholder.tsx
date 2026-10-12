import React from 'react';
import { Layers, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  phaseNumber: number;
  description: string;
  features: string[];
  currentStatusNote?: string;
  onNavigateAction?: { label: string; route: string };
  onNavigate?: (route: string) => void;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  phaseNumber,
  description,
  features,
  currentStatusNote = 'Module foundation ready. Detailed workflow will be enabled in the next development phase.',
  onNavigateAction,
  onNavigate,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id={`placeholder-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-left">
        {/* Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            BHUMI 360 Architectural Roadmap • Phase {phaseNumber}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Enterprise Architecture Ready
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-2 leading-relaxed max-w-2xl">
          {description}
        </p>

        {/* Current status note */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-700 flex items-start gap-3">
          <div className="p-1 rounded-md bg-emerald-600 text-white shrink-0 mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <strong className="font-semibold text-slate-900">Current Phase 1 Status:</strong>
            <p className="text-slate-600 mt-0.5">{currentStatusNote}</p>
          </div>
        </div>

        {/* Feature capabilities grid */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Target Module Capabilities & Technical Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        {onNavigateAction && onNavigate && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Explore active cross-cutting workflows in the meantime:
            </span>
            <button
              type="button"
              onClick={() => onNavigate(onNavigateAction.route)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span>{onNavigateAction.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
