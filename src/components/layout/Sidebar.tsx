import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  Compass,
  GitMerge,
  FileCheck2,
  Stamp,
  Coins,
  HeartHandshake,
  Files,
  Bell,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';
import { PermissionKey } from '../../types/rbac';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  route: string;
  permission?: PermissionKey;
  highlight?: boolean;
  badge?: string | number;
  isAI?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const { unreadCount, can, currentRole, roleProfile } = useApp();

  const allNavGroups: NavGroup[] = [
    {
      group: 'Core Management',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', permission: 'dashboard.view' },
        { label: 'Projects', icon: FolderKanban, route: '/projects', permission: 'project.view' },
        { label: 'Land Parcels', icon: MapPin, route: '/parcels', permission: 'parcel.view' },
        { label: 'GIS Command Center', icon: Compass, route: '/gis', highlight: true, permission: 'gis.view' },
      ],
    },
    {
      group: 'Acquisition Lifecycle',
      items: [
        { label: 'Acquisition Workflow', icon: GitMerge, route: '/acquisition', permission: 'project.view' },
        { label: 'Survey & Verification', icon: FileCheck2, route: '/survey', permission: 'survey.view' },
        { label: 'Approvals', icon: Stamp, route: '/approvals', permission: 'approval.view' },
        { label: 'Compensation', icon: Coins, route: '/compensation', permission: 'compensation.view' },
        { label: 'Rehabilitation & Resettlement', icon: HeartHandshake, route: '/rr', permission: 'rr.view' },
      ],
    },
    {
      group: 'Intelligence & Audit',
      items: [
        { label: 'Documents', icon: Files, route: '/documents', permission: 'document.view' },
        {
          label: 'Notifications',
          icon: Bell,
          route: '/notifications',
          permission: 'notification.view',
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { label: 'Analytics & Reports', icon: BarChart3, route: '/analytics', permission: 'analytics.view' },
        { label: 'Audit Center', icon: ShieldAlert, route: '/audit', permission: 'audit.view' },
        {
          label: 'BHUMI Intelligence',
          icon: Sparkles,
          route: '/intelligence',
          badge: 'AI Support',
          isAI: true,
          permission: 'dashboard.view',
        },
      ],
    },
    {
      group: 'Governance & Identity',
      items: [
        { label: 'Officer Profile', icon: UserCheck, route: '/profile' },
        { label: 'Administration Hub', icon: Shield, route: '/admin', permission: 'user.view' },
        { label: 'Citizen Portal', icon: Users, route: '/citizen' },
        { label: 'Settings', icon: Settings, route: '/settings' },
      ],
    },
  ];

  // Filter groups and items based on permission
  const filteredNavGroups = allNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      id="desktop-app-sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60">
        <BrandWordmark size={collapsed ? 'sm' : 'md'} collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
          id="sidebar-toggle-btn"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">
        {filteredNavGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.route ||
                (item.route === '/projects' && currentRoute.startsWith('/projects/')) ||
                (item.route === '/parcels' && currentRoute.startsWith('/parcels/'));

              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left relative group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                  }`}
                  id={`nav-item-${item.route.replace('/', '')}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-400'
                        : item.isAI
                        ? 'text-amber-400 group-hover:text-amber-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {!collapsed && item.badge && (
                    <span
                      className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        item.isAI
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role & Desk Indicator */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400">
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-300 truncate max-w-[120px] font-semibold">{roleProfile.designation}</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                {currentRole}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              One Land. One Lifecycle. One Intelligent Platform.
            </p>
          </div>
        ) : (
          <div className="text-center font-mono text-[10px] text-emerald-400 font-bold">360</div>
        )}
      </div>
    </aside>
  );
};
