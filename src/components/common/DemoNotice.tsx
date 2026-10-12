import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck, X } from 'lucide-react';

export const DemoNotice: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-2 select-none relative z-30 transition-all"
      id="demo-environment-notice"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3 h-3" />
            Prototype Demo
          </span>
          <span className="text-slate-200 font-medium">
            Smart India Hackathon (SIH26016) — National Land Acquisition & Management Platform
          </span>
          <span className="hidden md:inline text-slate-400">
            • Synthetic test dataset for evaluation. Not official cadastral records.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 underline"
            id="demo-notice-expand-toggle"
          >
            {expanded ? 'Hide Architecture Notes' : 'Product Positioning'}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-0.5 rounded"
            title="Dismiss banner"
            id="demo-notice-dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <strong className="text-slate-200 block mb-1">Architectural Integration</strong>
            BHUMI 360 does not replace existing state land-record portals (RoR, Dharani, Bhulekh, BanglarBhumi, etc.). It provides an integrated statutory lifecycle workflow connecting existing cadastral systems via REST/GeoServer adapters.
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <strong className="text-slate-200 block mb-1">State-Agnostic Nomenclature</strong>
            Administrative hierarchies (District → Mandal / Tehsil / Taluka → Village) are dynamically configured to honor jurisdictional semantics across all Indian states and Union Territories.
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <strong className="text-slate-200 block mb-1">Auditing & Security</strong>
            All lifecycle milestones, compensation awards, and possession certificates enforce cryptographic SHA-256 event recording with simulated role-based access control.
          </div>
        </div>
      )}
    </div>
  );
};
