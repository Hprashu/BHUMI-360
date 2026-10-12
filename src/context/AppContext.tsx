import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_NOTIFICATIONS, DEMO_ROLES } from '../data/mockData';
import { LocationHierarchyConfig, NotificationItem, RoleProfile, UserRole } from '../types';
import { AuthSession, LoginCredentials, PermissionKey, User } from '../types/rbac';
import { authService } from '../services/authService';
import { auditRepository } from '../repositories/auditRepository';

interface AppContextType {
  // Authentication & RBAC (Phase 2)
  currentUser: User | null;
  currentSession: AuthSession | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  roleProfile: RoleProfile;
  setRole: (role: UserRole) => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  can: (permission: PermissionKey) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  recordAudit: (action: string, entity: string, details: string) => void;

  // Existing Phase 1 Context
  locationConfig: LocationHierarchyConfig;
  updateLocationConfig: (config: Partial<LocationHierarchyConfig>) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isRoleSimulatorOpen: boolean;
  setIsRoleSimulatorOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeProjectFilter: string;
  setActiveProjectFilter: (projectId: string) => void;
}

const defaultLocationConfig: LocationHierarchyConfig = {
  stateLabel: 'State',
  districtLabel: 'District',
  subDistrictLabel: 'Sub-District / Tehsil',
  villageLabel: 'Revenue Village',
  surveyLabel: 'Survey / Khasra No.',
  currentState: 'National Infrastructure Zone',
  currentDistrict: 'Coastal & Valley District',
  currentSubDistrictType: 'Tehsil',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(authService.getCurrentSession());
  const [locationConfig, setLocationConfig] = useState<LocationHierarchyConfig>(defaultLocationConfig);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRoleSimulatorOpen, setIsRoleSimulatorOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>('PRJ-2026-0042');

  // Sync with authService state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((session) => {
      setAuthSession(session);
    });
    return unsubscribe;
  }, []);

  const currentUser = authSession?.user || null;
  const currentRole: UserRole = authSession?.user?.roleId || (authSession?.role?.name as UserRole) || 'SUPER_ADMIN';
  const roleProfile = DEMO_ROLES[currentRole] || DEMO_ROLES.SUPER_ADMIN;

  const setRole = (role: UserRole) => {
    authService.switchRoleSimulated(role);
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    return { success: res.success, error: res.error };
  };

  const logout = async () => {
    await authService.logout();
  };

  const can = (permission: PermissionKey): boolean => {
    if (!authSession) return false;
    return authSession.permissions.includes(permission);
  };

  const hasRoleCheck = (role: UserRole): boolean => {
    return currentRole === role;
  };

  const hasAnyPermission = (permissions: PermissionKey[]): boolean => {
    if (!authSession) return false;
    return permissions.some((p) => authSession.permissions.includes(p));
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(currentRole);
  };

  const recordAudit = (action: string, entity: string, details: string) => {
    auditRepository.logEvent({
      actor: currentUser?.name || roleProfile.name,
      role: currentRole,
      action,
      entity,
      entityId: 'SYSTEM',
      newValue: details,
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const updateLocationConfig = (config: Partial<LocationHierarchyConfig>) => {
    setLocationConfig((prev) => ({ ...prev, ...config }));
  };

  // Keyboard shortcut for universal search (Cmd+K or Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsRoleSimulatorOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentSession: authSession,
        isAuthenticated: !!authSession,
        currentRole,
        roleProfile,
        setRole,
        login,
        logout,
        can,
        hasRole: hasRoleCheck,
        hasAnyPermission,
        hasAnyRole,
        recordAudit,
        locationConfig,
        updateLocationConfig,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isSearchOpen,
        setIsSearchOpen,
        isRoleSimulatorOpen,
        setIsRoleSimulatorOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        activeProjectFilter,
        setActiveProjectFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
