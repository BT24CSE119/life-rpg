import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import {
  signupSchema,
  loginSchema,
  googleAuthSchema,
  signupUser,
  loginUser,
  loginWithGoogle,
  refreshSession,
  logoutUser,
  getUserById,
  checkUsernameAvailability,
  updateUsername,
} from '../services/auth.service';
import type { AuthenticatedRequest } from '../types/auth';

// ── Cookie Config ─────────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = 'refresh_token';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',                         // Root path so cookie is reliably persisted and sent across reverse proxies/browsers
  maxAge: 90 * 24 * 60 * 60 * 1000,  // 90 days persistent session until manual logout
};

const clearCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
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
  } catch (err: any) {
    if (err.statusCode === 409 && err.suggestions) {
      res.status(409).json({
        success: false,
        error: {
          message: err.message,
          field: 'username',
          suggestions: err.suggestions,
        },
      });
      return;
    }
    next(err);
  }
};

/**
 * GET /api/auth/check-username?username=...
 */
export const checkUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const username = req.query.username as string | undefined;
    if (!username || username.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: { message: 'Username must be at least 3 characters' },
      });
      return;
    }

    const result = await checkUsernameAvailability(username);
    res.status(200).json({
      success: true,
      data: result,
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

/**
 * POST /api/auth/google
 * Authenticate or register with a Google ID token credential.
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = googleAuthSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid Google authentication request',
          details: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
      return;
    }

    const { user, accessToken, rawRefreshToken } = await loginWithGoogle(
      result.data.credential,
      result.data.mode
    );

    // Set HttpOnly refresh token cookie
    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
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
 * PATCH /api/auth/me (protected)
 * Update username for the current authenticated user
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Username is required and must be a string' },
      });
      return;
    }

    const updatedUser = await updateUsername(authReq.user.id, username);

    res.status(200).json({
      success: true,
      message: 'Adventurer name updated successfully',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

