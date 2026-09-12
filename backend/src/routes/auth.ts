import { Router } from 'express';
import { signup, login, logout, refresh, getMe, updateProfile, googleAuth, checkUsername } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/auth/check-username?username=...
 * Check username availability and return alternative suggestions if taken.
 */
router.get('/check-username', checkUsername);

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
 * POST /api/auth/google
 * Authenticate or register via Google OAuth 2.0 credential.
 */
router.post('/google', googleAuth);

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

/**
 * PATCH /api/auth/me
 * Update the current authenticated user's profile/username. Protected.
 */
router.patch('/me', authenticate, updateProfile);


export default router;
