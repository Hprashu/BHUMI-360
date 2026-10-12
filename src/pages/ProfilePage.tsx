import React, { useState } from 'react';
import {
  User,
  Shield,
  Building,
  Key,
  Lock,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Check,
  AlertCircle,
  FileText,
  Activity,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_PERMISSIONS } from '../data/permissionMatrix';
import { authService } from '../services/authService';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, currentSession, roleProfile, currentRole } = useApp();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    try {
      await authService.changePassword(currentUser?.id || 'usr-default', oldPassword, newPassword);
      setPasswordStatus({ success: 'Security passkey updated successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setPasswordStatus({ error: err.message || 'Failed to update passkey.' });
    }
  };

  const userPermissions = currentSession?.permissions || [];
  const permissionsByModule = ALL_PERMISSIONS.filter((p) => userPermissions.includes(p.key)).reduce<
    Record<string, typeof ALL_PERMISSIONS>
  >((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const roleDisplayName = currentSession?.role?.displayName || roleProfile.designation || currentRole;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Identity Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-slate-950 font-extrabold text-3xl flex items-center justify-center shadow-xl shadow-amber-600/20 shrink-0">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser?.name || 'Officer Profile'}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentUser?.status || 'ACTIVE'}
                </span>
              </div>
              <div className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{roleDisplayName}</span>
                <span className="text-slate-500 font-mono">• {currentUser?.employeeCode || 'ADM-0001'}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser?.email}
                </span>
                {currentUser?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {currentUser?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{isChangingPassword ? 'Cancel Passkey Change' : 'Update Passkey'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Passkey Change Panel */}
      {isChangingPassword && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Update Officer Passkey</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Passkeys require minimum 8 characters with alphanumeric and symbol combinations.
          </p>

          {passwordStatus?.error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{passwordStatus.error}</span>
            </div>
          )}

          {passwordStatus?.success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{passwordStatus.success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Passphrase</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Passphrase</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Passphrase</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs rounded-xl font-bold shadow-md shadow-amber-500/20"
              >
                Save New Passphrase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Department & Authority */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Departmental Jurisdiction</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Directorate</span>
                <span className="text-slate-200 font-medium">{currentUser?.departmentName || roleProfile.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Statutory Designation</span>
                <span className="text-slate-200 font-medium">{roleProfile.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Geographic Jurisdiction</span>
                <span className="text-slate-200 font-medium">{roleProfile.jurisdiction}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Last Session Authentication</span>
                <span className="text-slate-400 font-mono">
                  {currentUser?.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString() : 'Active HSM Session'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Statutory Capabilities</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Gazette Declarations Signing</span>
                <span className={roleProfile.canApprove ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {roleProfile.canApprove ? 'Authorized' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300">PFMS Treasury Disbursals</span>
                <span className={roleProfile.canDisburse ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {roleProfile.canDisburse ? 'Authorized' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Cadastral Parcel Mutations</span>
                <span className={roleProfile.canEditParcels ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {roleProfile.canEditParcels ? 'Authorized' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300">DGPS Field Measurement Surveys</span>
                <span className={roleProfile.canConductSurvey ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {roleProfile.canConductSurvey ? 'Authorized' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Granted Permissions by Module */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Granted Permissions Catalog</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Permissions active on this account across system modules.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {userPermissions.length} Active Grants
              </span>
            </div>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                <div key={moduleName} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Module: {moduleName}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{perms.length} Permissions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => (
                      <div
                        key={p.key}
                        className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-slate-200">{p.displayName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.key}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
