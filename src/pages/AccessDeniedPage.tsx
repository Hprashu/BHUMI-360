// ============================================================
// BHUMI 360 - ACCESS DENIED / STATUTORY RESTRICTION PAGE (PHASE 2)
// ============================================================
import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Key, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccessDeniedPageProps {
  onNavigate: (route: string) => void;
  requiredPermission?: string;
  requiredRole?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  onNavigate,
  requiredPermission,
  requiredRole,
}) => {
  const { currentRole, roleProfile, setIsRoleSimulatorOpen } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-left">
        {/* Top Warning Strip */}
        <div className="bg-rose-700 px-6 py-4 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Access Restricted — Statutory Authorization Required</h2>
            <p className="text-xs text-rose-100 mt-0.5">Section 33 / RBAC Security Clearance Boundary</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              Your active session under role <strong className="text-slate-900 font-bold">{roleProfile.designation} ({currentRole})</strong> does not possess the requisite statutory delegation to access this module or execute this action.
            </p>

            {/* Requirement Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Active Role:</span>
                <span className="font-mono font-bold text-slate-900">{currentRole}</span>
              </div>

              {requiredPermission && (
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
                  <span>Required Permission:</span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {requiredPermission}
                  </span>
                </div>
              )}

              {requiredRole && (
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
                  <span>Required Statutory Role:</span>
                  <span className="font-mono font-bold text-slate-900">{requiredRole}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
                <span>Statutory Authority:</span>
                <span className="text-slate-800">Competent Authority for Land Acquisition</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                To perform this statutory function, request role elevation from your District Nodal Administrator or use the Prototype Role Simulator in the top header.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRoleSimulatorOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>Switch Demo Role</span>
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Security Ledger: Event Logged to Section 33 Vault</span>
          <span>HTTP 403 Forbidden</span>
        </div>
      </div>
    </div>
  );
};
