import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import type { AuthenticatedRequest } from '../types/auth';

/**
 * Authentication middleware.
 * Reads the Bearer token from the Authorization header,
 * verifies the JWT signature and type, then attaches
 * safe user identity to req.user.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required. No token provided.' },
      });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Token is empty.' },
      });
      return;
    }

    const payload = verifyAccessToken(token);

    // Attach safe identity — never trust body/query for user ID or role
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (err) {
    const error = err as Error;

    // Expired token
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: { message: 'Session expired. Please log in again.' },
      });
      return;
    }

    // Invalid signature, malformed, wrong type
    res.status(401).json({
      success: false,
      error: { message: 'Invalid authentication token.' },
    });
  }
};

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user has one of the allowed roles.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' },
      });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. Insufficient permissions.' },
      });
      return;
    }
    next();
  };
};
