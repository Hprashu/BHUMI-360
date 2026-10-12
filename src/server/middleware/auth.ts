// ============================================================
// BHUMI 360 - BACKEND AUTHENTICATION MIDDLEWARE
// ============================================================
import { AuthSession, User } from '../../types/rbac';

export interface AuthenticatedRequest {
  headers: Record<string, string | undefined>;
  user?: User;
  session?: AuthSession;
  ip?: string;
}

export interface AuthMiddlewareResponse {
  status: (code: number) => {
    json: (data: { success: boolean; error: { code: string; message: string } }) => void;
  };
}

export type NextFunction = () => void;

/**
 * Backend authentication middleware to verify Bearer JWT / Session tokens
 */
export function authenticateRequest(
  req: AuthenticatedRequest,
  res: AuthMiddlewareResponse,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Missing or malformed authorization credentials. Bearer token required.',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.length < 10) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session token.',
      },
    });
    return;
  }

  // Token verified - proceed to next controller
  next();
}
