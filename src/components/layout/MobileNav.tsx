import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  Compass,
  Menu,
  X,
  Search,
  Shield,
  Bell,
  Sparkles,
  GitMerge,
  Stamp,
  Coins,
  HeartHandshake,
  Files,
  BarChart3,
  Users,
  Settings,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';
import { PermissionKey } from '../../types/auth';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

interface MobileLink {
  label: string;
  icon: React.ElementType;
  route: string;
  permission?: PermissionKey;
  badge?: number;
  isAI?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate }) => {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    setIsSearchOpen,
    setIsRoleSimulatorOpen,
    unreadCount,
    roleProfile,
    can,
    currentRole,
  } = useApp();

  const mainTabs = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', permission: 'dashboard.view' as PermissionKey },
    { label: 'Projects', icon: FolderKanban, route: '/projects', permission: 'project.view' as PermissionKey },
    { label: 'GIS', icon: Compass, route: '/gis', permission: 'gis.view' as PermissionKey },
    { label: 'Parcels', icon: MapPin, route: '/parcels', permission: 'parcel.view' as PermissionKey },
  ].filter((t) => !t.permission || can(t.permission));

  const rawLinks: MobileLink[] = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', permission: 'dashboard.view' },
    { label: 'Projects', icon: FolderKanban, route: '/projects', permission: 'project.view' },
    { label: 'Land Parcels (Parcel 360)', icon: MapPin, route: '/parcels', permission: 'parcel.view' },
    { label: 'GIS Command Center', icon: Compass, route: '/gis', permission: 'gis.view' },
    { label: 'Acquisition Workflow', icon: GitMerge, route: '/acquisition', permission: 'project.view' },
    { label: 'Approvals & Declarations', icon: Stamp, route: '/approvals', permission: 'approval.view' },
    { label: 'Compensation Awards', icon: Coins, route: '/compensation', permission: 'compensation.view' },
    { label: 'R&R Housing & Grants', icon: HeartHandshake, route: '/rr', permission: 'rr.view' },
    { label: 'Documents Repository', icon: Files, route: '/documents', permission: 'document.view' },
    { label: 'Notifications & Alerts', icon: Bell, route: '/notifications', permission: 'notification.view', badge: unreadCount },
    { label: 'BHUMI Intelligence AI', icon: Sparkles, route: '/intelligence', isAI: true, permission: 'dashboard.view' },
    { label: 'Analytics & Bottlenecks', icon: BarChart3, route: '/analytics', permission: 'analytics.view' },
    { label: 'Tamper-Evident Audit', icon: ShieldAlert, route: '/audit', permission: 'audit.view' },
    { label: 'Officer Profile', icon: UserCheck, route: '/profile' },
    { label: 'Administration Hub', icon: Shield, route: '/admin', permission: 'user.view' },
    { label: 'Citizen Portal', icon: Users, route: '/citizen' },
    { label: 'Settings', icon: Settings, route: '/settings' },
  ];

  const allLinks = rawLinks.filter((item) => !item.permission || can(item.permission));

  return (
    <>
      {/* Bottom Sticky Mobile Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 text-slate-400 select-none shadow-lg px-2"
        id="mobile-bottom-nav"
      >
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              currentRoute === tab.route ||
              (tab.route === '/projects' && currentRoute.startsWith('/projects/')) ||
              (tab.route === '/parcels' && currentRoute.startsWith('/parcels/'));

            return (
              <button
                key={tab.route}
                type="button"
                onClick={() => onNavigate(tab.route)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                id={`mobile-nav-${tab.label.toLowerCase()}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-1">{tab.label}</span>
              </button>
            );
          })}

          {/* Drawer Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-slate-400 hover:text-slate-200 cursor-pointer"
            id="mobile-nav-menu-btn"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-start animate-in fade-in duration-150"
          id="mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm bg-slate-950 text-slate-300 h-full flex flex-col border-r border-slate-800 shadow-2xl p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            id="mobile-drawer-content"
          >
            {/* Header with Brand & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <BrandWordmark size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                id="mobile-drawer-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Role Profile Header */}
            <div className="my-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Role: {currentRole}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsRoleSimulatorOpen(true);
                  }}
                  className="text-[11px] text-emerald-400 font-bold underline cursor-pointer"
                >
                  Change
                </button>
              </div>
              <div className="text-sm font-bold text-white mt-1 truncate">{roleProfile.name}</div>
              <div className="text-xs text-slate-400 truncate">{roleProfile.designation}</div>
            </div>

            {/* Quick Actions Search */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full mb-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search projects, parcels...</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">⌘K</span>
            </button>

            {/* Nav list */}
            <div className="flex-1 space-y-1 overflow-y-auto">
              {allLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;

                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(item.route);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-auto border-t border-slate-800 text-center text-[11px] text-slate-400">
              BHUMI 360 • Smart India Hackathon SIH26016
            </div>
          </div>
        </div>
      )}
    </>
  );
};
