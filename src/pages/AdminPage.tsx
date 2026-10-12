import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Building,
  Key,
  Search,
  Filter,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  UserCheck,
  ArrowUpDown,
  Lock,
  Eye,
  X,
  FileCheck,
  Check,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthUser, Department, PermissionKey, UserRole, UserStatus } from '../types/auth';
import { ALL_PERMISSIONS, DEFINED_ROLES, ROLE_PERMISSION_MATRIX } from '../data/permissionMatrix';
import { departmentRepository } from '../services/repositories';
import { userApi } from '../services/apiClient';

export const AdminPage: React.FC = () => {
  const { can, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'departments' | 'security'>('users');

  // Users State
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AuthUser | null>(null);

  // Departments State
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AuthUser | null>(null);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    employeeCode: '',
    phone: '',
    role: 'SURVEY_OFFICER' as UserRole,
    departmentId: 'dept-survey',
    status: 'ACTIVE' as UserStatus,
  });

  // New Department Form State
  const [newDeptForm, setNewDeptForm] = useState({
    code: '',
    name: '',
    description: '',
    state: 'National Infrastructure Zone',
    district: 'Corridor Division',
    status: 'ACTIVE' as const,
  });

  // Load data
  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDepartments = () => {
    setDepartments(departmentRepository.getAll());
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dept = departments.find((d) => d.id === newUserForm.departmentId);
      await userApi.create({
        name: newUserForm.name,
        email: newUserForm.email,
        employeeCode: newUserForm.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        phone: newUserForm.phone || '+91 90000 00000',
        role: newUserForm.role,
        roleId: `role-${newUserForm.role.toLowerCase()}`,
        roleDisplayName: newUserForm.role.replace(/_/g, ' '),
        departmentId: newUserForm.departmentId,
        departmentName: dept ? dept.name : 'State Revenue Directorate',
        status: newUserForm.status,
      });
      setIsAddUserOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        employeeCode: '',
        phone: '',
        role: 'SURVEY_OFFICER',
        departmentId: 'dept-survey',
        status: 'ACTIVE',
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    try {
      const dept = departments.find((d) => d.id === userToEdit.departmentId);
      await userApi.update(userToEdit.id, {
        name: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone,
        role: userToEdit.role,
        roleDisplayName: userToEdit.role.replace(/_/g, ' '),
        departmentId: userToEdit.departmentId,
        departmentName: dept ? dept.name : userToEdit.departmentName,
        status: userToEdit.status,
      });
      setIsEditUserOpen(false);
      setUserToEdit(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    try {
      const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userApi.setStatus(user.id, nextStatus as UserStatus);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      departmentRepository.create(newDeptForm);
      setIsAddDeptOpen(false);
      setNewDeptForm({
        code: '',
        name: '',
        description: '',
        state: 'National Infrastructure Zone',
        district: 'Corridor Division',
        status: 'ACTIVE',
      });
      loadDepartments();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;
    const matchesDept = selectedDepartmentFilter === 'ALL' || u.departmentId === selectedDepartmentFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  // Group permissions by module for the matrix
  const permissionsByModule = ALL_PERMISSIONS.reduce<Record<string, typeof ALL_PERMISSIONS>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Access Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Administration</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Provision officer credentials, govern statutory role-based access control (RBAC), and oversee department jurisdictions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {can('user.create') && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          )}
          {can('department.manage') && (
            <button
              onClick={() => setIsAddDeptOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Building className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'users' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 text-xs font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'roles' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Role & Permissions Matrix (10 Roles)</span>
          {activeTab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-4 text-xs font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'departments' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departments & Directorates ({departments.length})</span>
          {activeTab === 'departments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'security' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Session Policies</span>
          {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, employee code, or email..."
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statutory Roles</option>
                {DEFINED_ROLES.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Directorates</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Officer Profile</th>
                    <th className="py-3.5 px-4">Employee Code</th>
                    <th className="py-3.5 px-4">Statutory Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No system users matched the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{u.employeeCode}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-slate-800 text-amber-400 border border-slate-700 inline-block">
                              {u.roleDisplayName}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-[180px] truncate text-slate-300" title={u.departmentName}>
                            {u.departmentName}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : u.status === 'INACTIVE'
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedUserForDetail(u)}
                                title="View Permissions & Details"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {can('user.update') && (
                                <button
                                  onClick={() => {
                                    setUserToEdit(u);
                                    setIsEditUserOpen(true);
                                  }}
                                  title="Edit User"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {can('user.deactivate') && !isCurrent && (
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    u.status === 'ACTIVE'
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                  }`}
                                >
                                  {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Roles Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DEFINED_ROLES.map((r) => {
              const roleUsers = users.filter((u) => u.role === r.name);
              return (
                <div
                  key={r.name}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-mono">{r.name}</span>
                      <span className="text-emerald-400 font-semibold">{roleUsers.length} Users</span>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">{r.displayName}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-amber-400 flex items-center justify-between">
                    <span>{r.permissions.length} Permissions</span>
                    <span className="font-semibold text-slate-400">Statutory</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive 2D Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Statutory Role-Permission Cross-Reference Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Granular permission checks executed at both client UI and API gateway layers.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {ALL_PERMISSIONS.length} Permissions across 13 Modules
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border border-slate-800 min-w-[220px]">
                      Module & Permission Key
                    </th>
                    {DEFINED_ROLES.map((r) => (
                      <th
                        key={r.name}
                        className="py-2 px-1.5 border border-slate-800 text-center min-w-[70px]"
                        title={r.displayName}
                      >
                        <span className="block truncate max-w-[65px] mx-auto text-[9px]">
                          {r.name.replace(/_/g, ' ').slice(0, 8)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                    <React.Fragment key={moduleName}>
                      <tr className="bg-slate-950/90 text-amber-400 font-semibold text-[11px]">
                        <td colSpan={11} className="py-2 px-3 border border-slate-800 uppercase tracking-wider">
                          Module: {moduleName} ({perms.length})
                        </td>
                      </tr>
                      {perms.map((perm) => (
                        <tr key={perm.key} className="hover:bg-slate-850 transition-colors">
                          <td className="py-2 px-3 border border-slate-800">
                            <div className="font-semibold text-slate-200">{perm.displayName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{perm.key}</div>
                          </td>
                          {DEFINED_ROLES.map((r) => {
                            const isGranted = r.permissions.includes(perm.key);
                            return (
                              <td
                                key={r.name}
                                className={`py-1.5 px-2 border border-slate-800 text-center ${
                                  isGranted ? 'bg-emerald-500/5' : ''
                                }`}
                              >
                                {isGranted ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                                ) : (
                                  <span className="text-slate-700 text-[10px]">•</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptUsers = users.filter((u) => u.departmentId === dept.id);
              return (
                <div
                  key={dept.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-amber-400 font-semibold">{dept.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {dept.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">{dept.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{dept.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Jurisdiction</span>
                      <span className="text-slate-300 font-medium">{dept.state}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Active Officers</span>
                      <span className="text-slate-300 font-medium">{deptUsers.length} Provisioned</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY POLICIES */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Session & Token Policies
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">JWT Token Expiration</div>
                    <div className="text-slate-400 text-[11px]">HMAC-SHA256 signed bearer session validity</div>
                  </div>
                  <span className="font-mono text-amber-400">7 Days (Standard)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">IP Address Masking</div>
                    <div className="text-slate-400 text-[11px]">Anonymize client addresses in public ledger (GDPR/DPDP)</div>
                  </div>
                  <span className="text-emerald-400 font-semibold">Active (Class C Masked)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Concurrent Sessions per Officer</div>
                    <div className="text-slate-400 text-[11px]">Maximum simultaneous authentications</div>
                  </div>
                  <span className="font-mono text-slate-300">2 Devices</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-amber-400" />
                Password & Passphrase Governance
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Minimum length of 8 characters with alphanumeric requirements.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PBKDF2 / Argon2 cryptographic hash encryption.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strict rate limiting on login attempts (max 5 consecutive failures).</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-full">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Statutory Regulatory Attestation
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  BHUMI 360 is constructed in accordance with the mandatory statutory protocols of the
                  <strong className="text-white"> Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)</strong>,
                  enforcing strict separation of powers between:
                </p>
                <div className="space-y-2 pl-2 border-l-2 border-amber-500/50">
                  <div>
                    <strong className="text-amber-400">Proponent Agency (Project Officer):</strong> Proposes linear alignments and milestone schedules without approval rights.
                  </div>
                  <div>
                    <strong className="text-amber-400">Field Surveyor (Survey Officer):</strong> Carries out ground-truth JMS measurements with no power to modify award financial values.
                  </div>
                  <div>
                    <strong className="text-amber-400">Competent Authority (CALA / SLAO):</strong> Confirms Gazette notifications and award determinations.
                  </div>
                  <div>
                    <strong className="text-amber-400">Treasury (Finance Officer):</strong> Executes Direct Benefit Transfers (DBT) directly through PFMS with dual authorization.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedUserForDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg font-bold">
                {selectedUserForDetail.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUserForDetail.name}</h3>
                <div className="text-xs text-slate-400 font-mono">{selectedUserForDetail.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 mb-5">
              <div>
                <span className="text-slate-500 block">Employee Code</span>
                <span className="font-mono text-slate-200">{selectedUserForDetail.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Designated Role</span>
                <span className="text-amber-400 font-semibold">{selectedUserForDetail.roleDisplayName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="text-slate-200 truncate block">{selectedUserForDetail.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Account Status</span>
                <span className="text-emerald-400 font-semibold">{selectedUserForDetail.status}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Assigned Permissions ({selectedUserForDetail.permissions?.length || 0})</span>
                <span className="text-[10px] text-slate-500">Inherited from {selectedUserForDetail.role}</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {selectedUserForDetail.permissions?.map((permKey) => {
                  const permDef = ALL_PERMISSIONS.find((p) => p.key === permKey);
                  return (
                    <div
                      key={permKey}
                      className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-slate-200">{permDef?.displayName || permKey}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{permKey}</div>
                      </div>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Provision New Officer Account</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create an administrative user profile and bind designated statutory permissions.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Smt. Radhika Sharma, OAS"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="r.sharma@bhumi360.demo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={newUserForm.employeeCode}
                    onChange={(e) => setNewUserForm({ ...newUserForm, employeeCode: e.target.value })}
                    placeholder="CALA-049"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designated Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {DEFINED_ROLES.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={newUserForm.departmentId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditUserOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditUserOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Edit User Profile</h3>
            <p className="text-xs text-slate-400 mb-4">Update officer designation, department, or active status.</p>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={userToEdit.email}
                    onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={userToEdit.phone || ''}
                    onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designated Role</label>
                  <select
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {DEFINED_ROLES.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={userToEdit.departmentId}
                    onChange={(e) => setUserToEdit({ ...userToEdit, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEPARTMENT MODAL */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddDeptOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Register New Directorate</h3>
            <p className="text-xs text-slate-400 mb-4">Establish an administrative jurisdiction unit.</p>

            <form onSubmit={handleCreateDept} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    value={newDeptForm.code}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                    placeholder="DEP-RAIL-08"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={newDeptForm.state}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Directorate Name</label>
                <input
                  type="text"
                  required
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  placeholder="e.g. Dedicated Freight Corridor Corporation Directorate"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDeptForm.description}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
                  placeholder="Statutory scope and acquisition responsibilities..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Register Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
