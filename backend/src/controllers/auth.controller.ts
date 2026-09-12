import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import {
  signupSchema,
  loginSchema,
  signupUser,
  loginUser,
  refreshSession,
  logoutUser,
  getUserById,
} from '../services/auth.service';
import type { AuthenticatedRequest } from '../types/auth';

// ── Cookie Config ─────────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = 'refresh_token';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/api/auth',         // Scoped — only sent to auth endpoints
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const clearCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/api/auth',
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
      return;
    }

    const user = await signupUser(result.data);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
      return;
    }

    const { user, accessToken, rawRefreshToken } = await loginUser(result.data);

    // Set refresh token in HttpOnly cookie — never in response body
    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

    await logoutUser(rawToken);

    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

    if (!rawToken) {
      res.status(401).json({
        success: false,
        error: { message: 'No refresh token provided' },
      });
      return;
    }

    const { accessToken, rawRefreshToken: newRawToken } = await refreshSession(rawToken);

    // Rotate: set new refresh token cookie
    res.cookie(REFRESH_COOKIE_NAME, newRawToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (err) {
    // Clear cookie on invalid refresh token
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions);
    next(err);
  }
};

/**
 * GET /api/auth/me  (protected)
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await getUserById(authReq.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
