// ============================================================
// BHUMI 360 - BACKEND RBAC AUTHORIZATION MIDDLEWARE
// ============================================================
import { PermissionKey, UserRole } from '../../types/rbac';
import { ROLE_PERMISSION_MAPPING } from '../../lib/permissions';
import { AuthenticatedRequest, AuthMiddlewareResponse, NextFunction } from './auth';

/**
 * Backend authorization middleware enforcing required role designation
 */
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: AuthMiddlewareResponse, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required prior to role evaluation' },
      });
      return;
    }

    if (!rolesArray.includes(req.user.roleId)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Role ${req.user.roleId} does not have statutory clearance for this endpoint.`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Backend authorization middleware enforcing granular MODULE.ACTION permission
 */
export function requirePermission(permission: PermissionKey) {
  return (req: AuthenticatedRequest, res: AuthMiddlewareResponse, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required prior to permission evaluation' },
      });
      return;
    }

    const userPermissions = ROLE_PERMISSION_MAPPING[req.user.roleId] || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: `Statutory clearance denied: Missing required permission [${permission}].`,
        },
      });
      return;
    }

    next();
  };
}
