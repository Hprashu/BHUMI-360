// ============================================================
// BHUMI 360 - ENTERPRISE AUTHENTICATION PORTAL (PHASE 2)
// ============================================================
import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandWordmark } from '../components/common/BrandWordmark';
import { UserRole } from '../types/rbac';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

interface DemoCredential {
  email: string;
  role: UserRole;
  label: string;
  department: string;
  name: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { email: 'admin@bhumi360.demo', role: 'SUPER_ADMIN', label: 'Super Administrator', department: 'National Cadastre Directorate', name: 'Satyajit Raychoudhury, IAS' },
  { email: 'project@bhumi360.demo', role: 'PROJECT_OFFICER', label: 'Project Officer', department: 'NHAI Coastal Corridor PIU', name: 'Er. Debabrata Mohapatra' },
  { email: 'land@bhumi360.demo', role: 'LAND_ACQUISITION_OFFICER', label: 'Land Acquisition Officer', department: 'CALA Ganjam Desk', name: 'Dr. Bijay Ketan Patnaik, OAS' },
  { email: 'gis@bhumi360.demo', role: 'GIS_OFFICER', label: 'GIS & Remote Sensing', department: 'Cadastral GeoServer Cell', name: 'Priyadarshini Sahu, M.Tech' },
  { email: 'survey@bhumi360.demo', role: 'SURVEY_OFFICER', label: 'Survey Officer', department: 'DGPS Field Directorate', name: 'Krushna Chandra Pradhan' },
  { email: 'finance@bhumi360.demo', role: 'FINANCE_OFFICER', label: 'Finance & Compensation', department: 'Direct Benefit Transfer (DBT)', name: 'Manoj Kumar Nayak, OFS' },
  { email: 'rr@bhumi360.demo', role: 'RR_OFFICER', label: 'R&R Officer', department: 'Second Schedule Directorate', name: 'Ananya Tripathy, OAS-I' },
  { email: 'authority@bhumi360.demo', role: 'APPROVING_AUTHORITY', label: 'Approving Authority', department: 'Office of District Collector', name: 'Divyajyoti Parida, IAS' },
  { email: 'audit@bhumi360.demo', role: 'AUDITOR', label: 'Statutory Auditor', department: 'Principal AG (Audit) Cell', name: 'Subrat Kumar Das, IA&AS' },
  { email: 'citizen@bhumi360.demo', role: 'CITIZEN', label: 'Citizen / Landowner', department: 'Public Grievance Desk', name: 'Ramesh Chandra Behera' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({ email, password, rememberMe });
      if (res.success) {
        if (email.includes('citizen')) {
          onNavigate('/citizen');
        } else {
          onNavigate('/dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('A communication error occurred with the authentication gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (cred: DemoCredential) => {
    setEmail(cred.email);
    setPassword('demo@2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 font-medium">
        <span>PROTOTYPE EVALUATION ENVIRONMENT • Synthetic Cadastral Data under SIH26016 • Not Official Government Records</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Brand & Security Guarantee */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                  Statutory Gateway • Version 2.0
                </span>
              </div>

              <div className="mb-4">
                <BrandWordmark size="lg" />
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-3">
                National Land Acquisition & Cadastral Management Infrastructure
              </h2>
              
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                One Land. One Lifecycle. One Intelligent Platform. Unifying corridor identification, DGPS ground surveys, gazette approvals, Section 26 valuation solatium, PFMS DBT disbursements, and immutable Section 33 audit ledgers.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">10-Tier RBAC</strong>
                    <span className="text-slate-400 text-[11px]">Granular Module.Action permissions</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Section 33 Merkle</strong>
                    <span className="text-slate-400 text-[11px]">Cryptographic audit trail</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Multi-State Engine</strong>
                    <span className="text-slate-400 text-[11px]">Tehsil / Mandal / Taluka adaptable</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">PostGIS Spatial</strong>
                    <span className="text-slate-400 text-[11px]">Right-of-Way corridor alignment</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security Standard: ISO 27001 / CERT-In Ready</span>
              <span>DSC Token Compliant</span>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 text-slate-900 shadow-2xl flex flex-col justify-between border border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Officer & Citizen Login
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in with registered government email or employee ID
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Authentication Error</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Email / Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@bhumi360.demo or BHUMI-ADM-001"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Security Credential
                    </label>
                    <span className="text-[11px] text-slate-400">Default: demo@2026</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Remember session (8 Hours)</span>
                  </label>

                  <span className="text-slate-400 text-[11px]">Hardware Token: Optional</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating & Verifying Role...' : 'Sign In to BHUMI 360'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>One-Click Prototype Role Selectors (10 Seeded Accounts)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {DEMO_CREDENTIALS.map((cred) => {
                  const isSelected = email === cred.email;
                  return (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => handleSelectDemoUser(cred)}
                      className={`p-2 rounded-xl text-left border transition-all text-[11px] flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <strong className="block truncate text-slate-900 text-[11px]">{cred.label}</strong>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{cred.email.split('@')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
        <span>© 2026 BHUMI 360 — Integrated Land Acquisition & Cadastral Management</span>
        <span className="font-mono text-[11px]">Statutory Compliance: RFCTLARR Act 2013 • NH Act 1956 • Digital India Land Records</span>
      </div>
    </div>
  );
};
