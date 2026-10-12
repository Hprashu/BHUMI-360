import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  Shield,
  HelpCircle,
  Menu,
  ChevronDown,
  Check,
  ExternalLink,
  LogOut,
  Sliders,
  Settings,
  AlertTriangle,
  Compass,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onToggleSidebar }) => {
  const {
    currentRole,
    currentUser,
    roleProfile,
    setIsSearchOpen,
    setIsRoleSimulatorOpen,
    notifications,
    unreadCount,
    markNotificationAsRead,
    setMobileMenuOpen,
    logout,
    can,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Compute breadcrumb text
  const getBreadcrumb = () => {
    if (currentRoute === '/dashboard') return 'Dashboard & Executive Portfolio';
    if (currentRoute.startsWith('/projects/')) return 'Projects / Project 360';
    if (currentRoute === '/projects') return 'Infrastructure Projects';
    if (currentRoute.startsWith('/parcels/')) return 'Land Parcels / Parcel 360';
    if (currentRoute === '/parcels') return 'Cadastral Parcel Registry';
    if (currentRoute === '/gis') return 'GIS Command Center (Geospatial Workbench)';
    if (currentRoute === '/acquisition') return 'Acquisition Lifecycle Workflow';
    if (currentRoute === '/survey') return 'Joint Cadastral Survey & Verification';
    if (currentRoute === '/approvals') return 'Statutory Approvals & Section Declarations';
    if (currentRoute === '/compensation') return 'Compensation Awards & PFMS Disbursals';
    if (currentRoute === '/rr') return 'Rehabilitation & Resettlement (R&R)';
    if (currentRoute === '/documents') return 'Digital Cadastral Document Repository';
    if (currentRoute === '/notifications') return 'Notification & SLA Alert Center';
    if (currentRoute === '/analytics') return 'Analytics, Bottleneck & Audit Reports';
    if (currentRoute === '/audit') return 'Tamper-Evident Cryptographic Audit Trail';
    if (currentRoute === '/intelligence') return 'BHUMI Intelligence (AI Decision Support)';
    if (currentRoute === '/citizen') return 'Landowner & Citizen Public Portal';
    if (currentRoute === '/admin') return 'System Administration & Security Policies';
    if (currentRoute === '/settings') return 'Platform & State-Agnostic Settings';
    if (currentRoute === '/profile') return 'Officer Profile & Security Credentials';
    if (currentRoute === '/access-denied') return 'Access Restricted (Statutory Boundary)';
    return 'BHUMI 360 Platform';
  };

  const displayName = currentUser?.name || roleProfile.name;
  const displayDepartment = currentUser?.departmentName || roleProfile.department;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs select-none">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-3">
        {/* Left: Mobile Menu Trigger + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
            id="mobile-menu-btn"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden">
            <BrandWordmark size="sm" subtitle={false} />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
            <span className="text-slate-400">BHUMI 360</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold truncate">{getBreadcrumb()}</span>
          </div>
        </div>

        {/* Center: Global Search Bar Trigger */}
        <div className="flex-1 max-w-lg mx-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs md:text-sm transition-colors group cursor-pointer"
            id="header-search-trigger"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0" />
              <span className="truncate">Search projects, parcels, survey numbers (128/4A)...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Role Simulator + Notifications + Profile */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Role Simulator Pill */}
          <button
            type="button"
            onClick={() => setIsRoleSimulatorOpen(true)}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-medium transition-colors cursor-pointer"
            id="role-simulator-header-btn"
            title="Switch Simulated Role"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold truncate max-w-[140px]">{displayName.split(',')[0]}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/60 font-bold text-emerald-900 uppercase font-mono">
              {currentRole}
            </span>
          </button>

          {/* Notification Bell with Flyout */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
              id="header-notification-btn"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotifDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150 text-left"
                id="header-notification-dropdown"
              >
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Notifications & Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifDropdownOpen(false);
                      onNavigate('/notifications');
                    }}
                    className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkRoute) onNavigate(n.linkRoute);
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <strong className="text-slate-900 font-semibold">{n.title}</strong>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifDropdownOpen(false);
                      onNavigate('/notifications');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-emerald-700 cursor-pointer"
                  >
                    Go to Full Notification Center →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 md:p-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              id="header-user-profile-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {displayName.charAt(0)}
              </div>
              <div className="hidden xl:flex flex-col text-left min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                  {displayName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150 text-left"
                id="header-profile-dropdown"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{displayName}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono text-[11px] font-semibold text-emerald-800">
                    {currentRole}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                    Dept: {displayDepartment}
                  </div>
                </div>

                <div className="p-2 space-y-0.5 text-xs text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold">My Officer Profile</span>
                  </button>

                  {can('user.view') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('/admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-indigo-700" />
                      <span>Administration Hub</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsRoleSimulatorOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span>Switch Simulated Role (Demo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>System Settings & State Nomenclature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('/audit');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span>Audit & Compliance Log</span>
                  </button>
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsProfileOpen(false);
                      await logout();
                      onNavigate('/login');
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 cursor-pointer font-bold"
                  >
                    <span>Sign Out Session</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
