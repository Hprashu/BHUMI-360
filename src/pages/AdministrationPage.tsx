// ============================================================
// BHUMI 360 - ENTERPRISE ADMINISTRATION HUB (PHASE 2)
// User Management, Role-Permission Matrix, Departments & Security
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Building2,
  Lock,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  KeyRound,
  FileCheck2,
  ChevronRight,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userApi, roleApi, departmentApi, permissionApi } from '../services/apiClient';
import { User, Role, Department, Permission, UserRole, UserStatus } from '../types/rbac';
import { ALL_PERMISSIONS, ROLE_PERMISSION_MAPPING } from '../lib/permissions';

type AdminTab = 'users' | 'roles' | 'departments' | 'permissions' | 'security';

export const AdministrationPage: React.FC = () => {
  const { can, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New User Form State
  const [newEmployeeCode, setNewEmployeeCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoleId, setNewRoleId] = useState<UserRole>('LAND_ACQUISITION_OFFICER');
  const [newDepartmentId, setNewDepartmentId] = useState('');

  // New Department Form State
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptState, setNewDeptState] = useState('Odisha');
  const [newDeptDistrict, setNewDeptDistrict] = useState('Ganjam');

  // Matrix Filter State
  const [matrixModuleFilter, setMatrixModuleFilter] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, dRes, pRes] = await Promise.all([
        userApi.getAll(),
        roleApi.getAll(),
        departmentApi.getAll(),
        permissionApi.getAll(),
      ]);

      if (uRes.success && uRes.data) setUsers(uRes.data);
      if (rRes.success && rRes.data) setRoles(rRes.data);
      if (dRes.success && dRes.data) {
        setDepartments(dRes.data);
        if (dRes.data.length > 0 && !newDepartmentId) {
          setNewDepartmentId(dRes.data[0].id);
        }
      }
      if (pRes.success && pRes.data) setPermissions(pRes.data);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.roleId === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = await userApi.create({
      employeeCode: newEmployeeCode,
      name: newName,
      email: newEmail,
      phone: newPhone,
      roleId: newRoleId,
      departmentId: newDepartmentId,
    });

    if (res.success) {
      setFormSuccess('User provisioned successfully and notified via official dispatch.');
      setIsCreateUserOpen(false);
      setNewEmployeeCode('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      fetchData();
      setTimeout(() => setFormSuccess(null), 4000);
    } else {
      setFormError(res.error?.message || 'Failed to create user');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = await departmentApi.create({
      code: newDeptCode,
      name: newDeptName,
      description: newDeptDesc,
      state: newDeptState,
      district: newDeptDistrict,
    });

    if (res.success) {
      setFormSuccess('Department unit established successfully.');
      setIsCreateDeptOpen(false);
      setNewDeptCode('');
      setNewDeptName('');
      setNewDeptDesc('');
      fetchData();
      setTimeout(() => setFormSuccess(null), 4000);
    } else {
      setFormError(res.error?.message || 'Failed to create department');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const res = await userApi.setStatus(user.id, nextStatus);
    if (res.success) {
      setFormSuccess(`User ${user.name} status updated to ${nextStatus}.`);
      fetchData();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
      setTimeout(() => setFormSuccess(null), 3000);
    }
  };

  // Modules list for matrix
  const modulesList: string[] = Array.from(new Set(permissions.map((p) => String(p.module))));

  return (
    <div className="space-y-6 text-left" id="administration-hub">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              CENTRAL DIRECTORY
            </span>
            <span className="text-xs text-slate-500 font-medium">
              National Cadastral Governance & Multi-Tenant RBAC
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            System Administration & RBAC Command
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Manage officer personnel, multi-state departments, institutional roles, and statutory permission delegations.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {can('user.create') && (
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Officer</span>
            </button>
          )}

          {can('department.manage') && (
            <button
              type="button"
              onClick={() => setIsCreateDeptOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'roles'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Catalog & Matrix (10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'departments'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Statutory Permissions ({ALL_PERMISSIONS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Audit Policies</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, employee code, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="ALL">All Roles ({roles.length})</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Officer / Employee</th>
                    <th className="py-3 px-4">Role Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {user.name.split(' ')[0][0]}
                          </div>
                          <div>
                            <strong className="block text-slate-900 font-bold">{user.name}</strong>
                            <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                              {user.employeeCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          {user.roleId}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate" title={user.departmentName}>
                        {user.departmentName || 'National Directorate'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="block text-slate-800">{user.email}</span>
                        <span className="text-[10px] font-mono text-slate-400">{user.phone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {user.lastLoginAt || 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="View Dossier & Permissions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {can('user.deactivate') && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.status === 'ACTIVE'
                                  ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                  : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                              }`}
                              title={user.status === 'ACTIVE' ? 'Suspend Access' : 'Reactivate Officer'}
                            >
                              {user.status === 'ACTIVE' ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const assignedUserCount = users.filter((u) => u.roleId === role.name).length;
              return (
                <div
                  key={role.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {role.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{assignedUserCount} Personnel</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2">{role.displayName}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{role.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Delegated: <strong className="text-slate-900">{role.permissions.length} Permissions</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Statutory
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Role-Permission Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Central Role-Permission Matrix (All 10 Roles × 38 Permissions)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual matrix showing permissions assigned across all statutory acquisition desks.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Filter Module:</span>
                <select
                  value={matrixModuleFilter}
                  onChange={(e) => setMatrixModuleFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="ALL">All Modules</option>
                  {modulesList.map((m) => (
                    <option key={m} value={m}>
                      {m.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 text-[10px]">
                    <th className="py-2.5 px-3 min-w-[200px]">Permission Key</th>
                    <th className="py-2.5 px-2 text-center" title="Super Admin">ADM</th>
                    <th className="py-2.5 px-2 text-center" title="Project Officer">PO</th>
                    <th className="py-2.5 px-2 text-center" title="Land Acquisition Officer">LAO</th>
                    <th className="py-2.5 px-2 text-center" title="GIS Officer">GIS</th>
                    <th className="py-2.5 px-2 text-center" title="Survey Officer">SRV</th>
                    <th className="py-2.5 px-2 text-center" title="Finance Officer">FIN</th>
                    <th className="py-2.5 px-2 text-center" title="R&R Officer">RR</th>
                    <th className="py-2.5 px-2 text-center" title="Approving Authority">AUTH</th>
                    <th className="py-2.5 px-2 text-center" title="Auditor">AUD</th>
                    <th className="py-2.5 px-2 text-center" title="Citizen">CIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {permissions
                    .filter((p) => matrixModuleFilter === 'ALL' || p.module === matrixModuleFilter)
                    .map((perm) => (
                      <tr key={perm.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900 block font-sans text-xs">
                            {perm.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400">{perm.key}</span>
                        </td>

                        {(
                          [
                            'SUPER_ADMIN',
                            'PROJECT_OFFICER',
                            'LAND_ACQUISITION_OFFICER',
                            'GIS_OFFICER',
                            'SURVEY_OFFICER',
                            'FINANCE_OFFICER',
                            'RR_OFFICER',
                            'APPROVING_AUTHORITY',
                            'AUDITOR',
                            'CITIZEN',
                          ] as UserRole[]
                        ).map((r) => {
                          const hasIt = (ROLE_PERMISSION_MAPPING[r] || []).includes(perm.key);
                          return (
                            <td key={r} className="py-2 px-2 text-center">
                              {hasIt ? (
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                              ) : (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
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
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {dept.district}, {dept.state}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{dept.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dept.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Status:{' '}
                    <strong className="text-emerald-700 font-semibold">{dept.status}</strong>
                  </span>
                  <span className="text-slate-700 font-medium">
                    Jurisdiction: <strong className="text-slate-900">{dept.state}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERMISSION DIRECTORY */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Statutory Permission Master Registry ({ALL_PERMISSIONS.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every backend API and frontend component checks these granular MODULE.ACTION keys.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_PERMISSIONS.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <strong className="block text-slate-900 font-bold">{p.displayName}</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{p.description}</span>
                  <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-1.5">
                    {p.key}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 shrink-0">
                  {p.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY POLICIES */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Security, Session Tokens & Cryptographic Verification</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory configuration under Section 33 RFCTLARR Act 2013 and National Cyber Security Guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="block text-sm text-slate-900 font-bold">Session & Token Policies</strong>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>JWT Expiration Window:</span>
                  <span className="font-mono font-bold">8 Hours (Sliding)</span>
                </div>
                <div className="flex justify-between">
                  <span>Cookie Security Flags:</span>
                  <span className="font-mono font-bold text-emerald-700">HttpOnly; SameSite=Strict; Secure</span>
                </div>
                <div className="flex justify-between">
                  <span>Concurrent Session Limit:</span>
                  <span className="font-mono font-bold">1 Active Session per Officer</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="block text-sm text-slate-900 font-bold">Section 33 Merkle Ledger Integrity</strong>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Cryptographic Hashing Algorithm:</span>
                  <span className="font-mono font-bold">SHA-256 (256-bit Digest)</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger Immutability Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED GENESIS CHAIN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Signature Standard:</span>
                  <span className="font-mono font-bold">Class-3 DSC Token FIPS 140-2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Provision New Acquisition Officer</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Employee Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OAS-LAO-099"
                  value={newEmployeeCode}
                  onChange={(e) => setNewEmployeeCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Officer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Ch. Das, OAS"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@bhumi360.demo"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 94370 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Designation</label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Desk</label>
                  <select
                    value={newDepartmentId}
                    onChange={(e) => setNewDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE DEPARTMENT */}
      {isCreateDeptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>Add Department Unit</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateDeptOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CALA-KRD-02"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newDeptState}
                    onChange={(e) => setNewDeptState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Unit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Land Acquisition Office - Khordha"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jurisdiction District</label>
                <input
                  type="text"
                  required
                  value={newDeptDistrict}
                  onChange={(e) => setNewDeptDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Statutory Remit</label>
                <textarea
                  rows={2}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Statutory mandate and jurisdiction..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateDeptOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white font-bold transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAIL DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    OFFICER DOSSIER
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedUser.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Employee Code:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedUser.employeeCode}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Official Email:</span>
                  <span className="font-semibold text-slate-900">{selectedUser.email}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Role Designation:</span>
                  <span className="font-bold text-emerald-800">{selectedUser.roleId}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedUser.departmentName || 'National Directorate'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Account Status:</span>
                  <span className="font-bold text-slate-900">{selectedUser.status}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Login:</span>
                  <span className="font-mono text-slate-600">{selectedUser.lastLoginAt || 'Recent'}</span>
                </div>
              </div>

              {/* Granted Permissions List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Assigned Permissions ({(ROLE_PERMISSION_MAPPING[selectedUser.roleId] || []).length})
                </span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {(ROLE_PERMISSION_MAPPING[selectedUser.roleId] || []).map((permKey) => (
                    <div
                      key={permKey}
                      className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{permKey}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
