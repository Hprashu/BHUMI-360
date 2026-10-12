import React from 'react';
import {
  Shield,
  X,
  CheckCircle,
  AlertTriangle,
  FileCheck2,
  Lock,
  Layers,
  Compass,
  Coins,
  HeartHandshake,
  Stamp,
  Scale,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_ROLES } from '../../data/mockData';
import { UserRole } from '../../types';

interface RoleSimulatorModalProps {
  onRoleSelected?: (role: UserRole) => void;
}

export const RoleSimulatorModal: React.FC<RoleSimulatorModalProps> = ({ onRoleSelected }) => {
  const { currentRole, setRole, isRoleSimulatorOpen, setIsRoleSimulatorOpen } = useApp();

  if (!isRoleSimulatorOpen) return null;

  const rolesList: {
    key: UserRole;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      key: 'SUPER_ADMIN',
      label: 'Super Admin',
      description: 'Apex system administrator, configuration manager, and statewide oversight.',
      icon: Shield,
      accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      key: 'PROJECT_OFFICER',
      label: 'Project Officer',
      description: 'Project proponent authority, milestone monitoring, corridor planning & schedule tracking.',
      icon: Layers,
      accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'LAND_ACQUISITION_OFFICER',
      label: 'Land Acquisition Officer (CALA)',
      description: 'Competent Authority, notification drafting, Section 19 declaration & possession delivery.',
      icon: Stamp,
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      key: 'GIS_OFFICER',
      label: 'GIS Officer',
      description: 'Geospatial vector mapping, PostGIS cadastral layers, drone orthophoto alignment & buffer zones.',
      icon: Compass,
      accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      key: 'SURVEY_OFFICER',
      label: 'Survey Officer',
      description: 'DGPS field pegging, ground truthing, Joint Measurement Survey (JMS) & field book verification.',
      icon: FileCheck2,
      accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      key: 'FINANCE_OFFICER',
      label: 'Finance / Compensation Officer',
      description: 'Award assessment, solatium calculation, bank validation & PFMS treasury disbursement.',
      icon: Coins,
      accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      key: 'RR_OFFICER',
      label: 'Rehabilitation & Resettlement Officer',
      description: 'Displaced families census, alternate housing allotment, livelihood assistance & entitlement delivery.',
      icon: HeartHandshake,
      accentColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      key: 'APPROVING_AUTHORITY',
      label: 'Approving Authority (Collector)',
      description: 'Statutory gazette signing, award confirmation, public inquiry approval & dispute settlement.',
      icon: Scale,
      accentColor: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      key: 'AUDITOR',
      label: 'Auditor (CAG / State Audit)',
      description: 'Independent procedural review, tamper-evident cryptographic hash verification & compliance oversight.',
      icon: Lock,
      accentColor: 'text-slate-700 bg-slate-100 border-slate-300',
    },
    {
      key: 'CITIZEN',
      label: 'Citizen / Landowner',
      description: 'Claim status tracking, digital award intimation, grievance filing & bank e-KYC validation.',
      icon: UserCheck,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    if (onRoleSelected) onRoleSelected(role);
    setIsRoleSimulatorOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      id="role-simulator-overlay"
      onClick={() => setIsRoleSimulatorOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="role-simulator-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                User Role & Permission Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Simulate role-based perspectives across the complete land acquisition lifecycle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRoleSimulatorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Demo Simulation Mode:</strong> Production permissions are enforced cryptographically via server-side JWT & RBAC gateways. Selecting a role here dynamically adjusts the UI context, active workflows, and permission scopes for evaluation.
          </span>
        </div>

        {/* Roles Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {rolesList.map((item) => {
            const isSelected = currentRole === item.key;
            const Icon = item.icon;
            const profile = DEMO_ROLES[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelectRole(item.key)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                id={`role-btn-${item.key.toLowerCase()}`}
              >
                <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${item.accentColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{item.label}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{item.description}</p>
                  <div className="mt-2 text-[11px] text-slate-600 font-medium">
                    Demo Officer: <span className="text-slate-800">{profile.name}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Current Active Simulated Persona:{' '}
            <strong className="text-slate-900">{DEMO_ROLES[currentRole].name}</strong> (
            {DEMO_ROLES[currentRole].designation})
          </span>
          <button
            type="button"
            onClick={() => setIsRoleSimulatorOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
