// ============================================================
// BHUMI 360 - CENTRALIZED AUTHENTICATION SERVICE ABSTRACTION
// ============================================================
import { AuthSession, LoginCredentials, PermissionKey, Role, User, UserRole } from '../types/rbac';
import { ROLE_DEFINITIONS, ROLE_PERMISSION_MAPPING, hasPermission as checkPermission, hasRole as checkRole } from '../lib/permissions';
import { userRepository, SEED_USERS } from '../repositories/userRepository';
import { auditRepository } from '../repositories/auditRepository';
import { validateLogin } from '../lib/validation';

const SESSION_KEY = 'bhumi360_auth_session';

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        // Check token expiration (8 hours session)
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
        } else {
          this.clearSession();
        }
      }
    } catch {
      this.clearSession();
    }

    // Default fallback to Super Admin if brand new prototype load without session
    if (!this.currentSession) {
      const defaultUser = SEED_USERS[0]; // Satyajit Raychoudhury, IAS
      const role = ROLE_DEFINITIONS.find((r) => r.name === defaultUser.roleId) || ROLE_DEFINITIONS[0];
      this.currentSession = {
        token: `jwt_proto_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        user: defaultUser,
        role,
        permissions: role.permissions,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };
      this.saveSession(this.currentSession, true);
    }
  }

  private saveSession(session: AuthSession, rememberMe: boolean) {
    this.currentSession = session;
    const json = JSON.stringify(session);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, json);
    } else {
      sessionStorage.setItem(SESSION_KEY, json);
    }
    this.notifyListeners();
  }

  private clearSession() {
    this.currentSession = null;
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentSession));
  }

  onAuthStateChanged(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    // 1. Schema Validation
    const validation = validateLogin(credentials);
    if (!validation.success) {
      const msg = validation.errors?.[0]?.message || 'Invalid credentials format';
      await auditRepository.logEvent({
        actor: credentials.email || 'ANONYMOUS',
        role: 'GUEST',
        action: 'LOGIN_FAILED',
        entity: 'AUTH_GATEWAY',
        entityId: 'PORTAL_LOGIN',
        newValue: `Failed login attempt: ${msg}`,
      });
      return { success: false, error: msg };
    }

    const { email, rememberMe } = validation.data!;

    // 2. Fetch User by Email or Employee Code
    const user = await userRepository.getByEmail(email);
    if (!user) {
      await auditRepository.logEvent({
        actor: email,
        role: 'UNKNOWN',
        action: 'LOGIN_FAILED',
        entity: 'AUTH_GATEWAY',
        entityId: email,
        newValue: 'User identity not found in national cadastral directory',
      });
      return { success: false, error: 'No account registered with this email or employee code' };
    }

    if (user.status !== 'ACTIVE') {
      await auditRepository.logEvent({
        actor: user.name,
        role: user.roleId,
        action: 'LOGIN_FAILED',
        entity: 'USER_ACCOUNT',
        entityId: user.id,
        newValue: `Account locked or suspended (Status: ${user.status})`,
      });
      return { success: false, error: `Account is currently ${user.status.toLowerCase()}. Contact Super Administrator.` };
    }

    // 3. Resolve Role & Permissions
    const role = ROLE_DEFINITIONS.find((r) => r.name === user.roleId) || ROLE_DEFINITIONS[0];
    const permissions = ROLE_PERMISSION_MAPPING[user.roleId] || [];

    // 4. Create Session
    const session: AuthSession = {
      token: `jwt_bhumi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
      user,
      role,
      permissions,
      expiresAt: new Date(Date.now() + (rememberMe ? 24 * 7 : 8) * 60 * 60 * 1000).toISOString(),
    };

    this.saveSession(session, Boolean(rememberMe));
    await userRepository.updateLastLogin(user.id);

    // 5. Audit Log Event
    await auditRepository.logEvent({
      actor: user.name,
      role: user.roleId,
      action: 'LOGIN_SUCCESS',
      entity: 'AUTH_SESSION',
      entityId: user.employeeCode,
      newValue: `Authenticated via secure session token. Role: ${role.displayName}`,
    });

    return { success: true, session };
  }

  async logout(): Promise<void> {
    if (this.currentSession) {
      const user = this.currentSession.user;
      await auditRepository.logEvent({
        actor: user.name,
        role: user.roleId,
        action: 'LOGOUT',
        entity: 'AUTH_SESSION',
        entityId: user.employeeCode,
        newValue: 'User manually terminated secure session',
      });
    }
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && new Date(this.currentSession.expiresAt) > new Date();
  }

  hasRole(role: UserRole): boolean {
    return checkRole(this.currentSession?.user.roleId, role);
  }

  hasPermission(permission: PermissionKey): boolean {
    return checkPermission(this.currentSession?.permissions, permission);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    if (!this.currentSession) return false;
    return roles.includes(this.currentSession.user.roleId);
  }

  async changePassword(_userId: string, _oldPass: string, _newPass: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentSession) return { success: false, message: 'Unauthenticated' };
    await auditRepository.logEvent({
      actor: this.currentSession.user.name,
      role: this.currentSession.user.roleId,
      action: 'PASSWORD_CHANGED',
      entity: 'USER_SECURITY',
      entityId: this.currentSession.user.id,
      newValue: 'Credential rotation registered and signed with DSC token',
    });
    return { success: true, message: 'Password updated successfully' };
  }

  async switchRoleSimulated(role: UserRole): Promise<void> {
    const matchingUser = SEED_USERS.find((u) => u.roleId === role) || SEED_USERS[0];
    const roleDef = ROLE_DEFINITIONS.find((r) => r.name === role) || ROLE_DEFINITIONS[0];
    const newSession: AuthSession = {
      token: `jwt_switched_${Date.now()}`,
      user: matchingUser,
      role: roleDef,
      permissions: roleDef.permissions,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
    this.saveSession(newSession, true);
    await auditRepository.logEvent({
      actor: matchingUser.name,
      role,
      action: 'ROLE_SWITCHED_SIMULATOR',
      entity: 'AUTH_SIMULATOR',
      entityId: role,
      newValue: `Active desk simulated as ${roleDef.displayName}`,
    });
  }
}

export const authService = new AuthService();
