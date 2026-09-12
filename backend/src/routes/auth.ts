import { Router } from 'express';
import { signup, login, logout, refresh, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user account.
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Authenticate and receive access token + refresh cookie.
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Revoke the refresh token and clear the cookie.
 */
router.post('/logout', logout);

/**
 * POST /api/auth/refresh
 * Use the HttpOnly refresh cookie to get a new access token.
 */
router.post('/refresh', refresh);

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile. Protected.
 */
router.get('/me', authenticate, getMe);

export default router;
