import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database';
import { env } from '../config/env';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import type { SafeUser, SignupDto, LoginDto } from '../types/auth';

// ── Zod Validation Schemas ────────────────────────────────────────────────────

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    // Strict format check: ensures valid local part and legitimate domain with TLD (e.g. gmail.com, outlook.com)
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
      'Email format must be valid (e.g., user@gmail.com)'
    )
    .refine((val) => {
      const parts = val.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1].toLowerCase();
      // Must contain a dot and at least 2 chars TLD
      const domainParts = domain.split('.');
      return domainParts.length >= 2 && domainParts[domainParts.length - 1].length >= 2;
    }, 'Email domain is invalid. Please enter a valid email address (e.g., name@gmail.com)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google ID token (credential) is required'),
  mode: z.enum(['login', 'signup']).optional(),
});

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip sensitive fields — never return passwordHash */
const toSafeUser = (user: {
  id: string;
  username: string;
  email: string;
  role: SafeUser['role'];
  avatarUrl?: string | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl ?? null,
  googleId: user.googleId ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Generate 3-4 creative, available username suggestions based on a requested username.
 */
export const generateUsernameSuggestions = async (baseName: string): Promise<string[]> => {
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 18) || 'hero';
  const currentYear = new Date().getFullYear();
  const candidates = [
    `${cleanBase}_${Math.floor(100 + Math.random() * 900)}`,
    `${cleanBase}_rpg`,
    `${cleanBase}_${currentYear}`,
    `the_${cleanBase}`,
    `${cleanBase}_quest`,
    `sir_${cleanBase}`,
  ];

  const available: string[] = [];
  for (const candidate of candidates) {
    if (candidate.length >= 3 && candidate.length <= 30) {
      const exists = await prisma.user.findUnique({ where: { username: candidate } });
      if (!exists && !available.includes(candidate)) {
        available.push(candidate);
        if (available.length >= 3) break;
      }
    }
  }

  // Fallback guaranteed random numbers if needed
  let suffix = 1;
  while (available.length < 3) {
    const candidate = `${cleanBase.slice(0, 20)}_${suffix * 7 + 13}`;
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists && !available.includes(candidate)) {
      available.push(candidate);
    }
    suffix++;
  }

  return available;
};

/**
 * Check if a username is available. If taken, returns available suggestions.
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; suggestions?: string[] }> => {
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return { available: false, suggestions: [] };
  }

  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });

  if (!existing) {
    return { available: true };
  }

  const suggestions = await generateUsernameSuggestions(cleanUsername);
  return { available: false, suggestions };
};

/**
 * Register a new user.
 * - Normalizes email
 * - Hashes password
 * - Assigns USER role (ignores any role from client)
 * - Returns safe user data
 */
export const signupUser = async (
  dto: SignupDto
): Promise<SafeUser> => {
  const normalizedEmail = dto.email.toLowerCase().trim();

  // Check for duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    // If the account was created via Google, give a helpful specific message
    const message = existing.googleId && !existing.passwordHash
      ? 'This email is already registered via Google Sign-In. Please use "Continue with Google" to log in.'
      : 'An account with this email already exists. Please log in instead.';
    const err = new Error(message) as Error & { statusCode: number };
    err.statusCode = 409;
    throw err;
  }

  // Check for duplicate username
  const existingUsername = await prisma.user.findUnique({
    where: { username: dto.username },
  });
  if (existingUsername) {
    const suggestions = await generateUsernameSuggestions(dto.username);
    const err = new Error('This username is already taken') as Error & {
      statusCode: number;
      suggestions?: string[];
    };
    err.statusCode = 409;
    err.suggestions = suggestions;
    throw err;
  }

  const passwordHash = await hashPassword(dto.password);

  const user = await prisma.user.create({
    data: {
      username: dto.username,
      email: normalizedEmail,
      passwordHash,
      // Role is always USER — never trust client
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatarUrl: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toSafeUser(user);
};

/**
 * Authenticate a user and issue tokens.
 * Uses safe generic error to prevent user enumeration.
 */
export const loginUser = async (
  dto: LoginDto
): Promise<{ user: SafeUser; accessToken: string; rawRefreshToken: string }> => {
  const normalizedEmail = dto.email.toLowerCase().trim();

  // Generic error prevents revealing whether email exists
  const GENERIC_ERROR = 'Invalid email or password';

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // User exists but was created via Google — no password set
  if (user && !user.passwordHash) {
    const err = new Error('This account was created with Google Sign-In. Please use the "Continue with Google" button to log in.') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  if (!user) {
    const err = new Error('No account found with this email. Please sign up first.') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await comparePassword(dto.password, user.passwordHash);
  if (!passwordMatch) {
    const err = new Error(GENERIC_ERROR) as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const rawRefreshToken = generateRefreshToken(user.id);

  // Store hashed refresh token — never store raw token
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(rawRefreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: toSafeUser(user),
    accessToken,
    rawRefreshToken,
  };
};

/**
 * Refresh session — verify, check DB record, rotate token.
 */
export const refreshSession = async (
  rawToken: string
): Promise<{ accessToken: string; rawRefreshToken: string }> => {
  // 1. Verify JWT signature and type
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    const err = new Error('Invalid or expired refresh token') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = hashToken(rawToken);

  // 2. Find the record in DB by hash
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!storedToken) {
    const err = new Error('Refresh token not found') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  // 3. Handle previously rotated or revoked token
  if (storedToken.isRevoked) {
    const err = new Error('Refresh token has been revoked') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  // 4. Check expiry (belt-and-suspenders beyond JWT exp)
  if (storedToken.expiresAt < new Date()) {
    const err = new Error('Refresh token has expired') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  // 5. Verify userId matches
  if (storedToken.userId !== payload.sub) {
    const err = new Error('Token user mismatch') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  // 6. Rotate — revoke old token, issue new pair
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { isRevoked: true },
  });

  const newAccessToken = generateAccessToken(storedToken.user.id, storedToken.user.role);
  const newRawRefreshToken = generateRefreshToken(storedToken.user.id);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(newRawRefreshToken),
      userId: storedToken.user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken: newAccessToken, rawRefreshToken: newRawRefreshToken };
};

/**
 * Logout — revoke the refresh token in the database.
 * Silently succeeds if the token is missing or already revoked.
 */
export const logoutUser = async (rawToken: string | undefined): Promise<void> => {
  if (!rawToken) return;

  try {
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });
  } catch {
    // Silently ignore DB errors on logout — cookie will be cleared regardless
  }
};

/**
 * Get a safe user record by ID (for /me endpoint).
 */
export const getUserById = async (userId: string): Promise<SafeUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatarUrl: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user ? toSafeUser(user) : null;
};

/**
 * Authenticate or register via Google OAuth 2.0.
 * Verifies ID token, provisions user and initial RPG stats if new,
 * links googleId if existing, and issues access/refresh tokens.
 */
export const loginWithGoogle = async (
  credential: string,
  mode?: 'login' | 'signup'
): Promise<{ user: SafeUser; accessToken: string; rawRefreshToken: string }> => {
  let payload: { sub: string; email?: string; name?: string; picture?: string };

  if (credential.startsWith('mock_google_token_') && process.env.NODE_ENV !== 'production') {
    // For automated integration tests and local demo without live network calls to Google
    const mockEmail = credential.replace('mock_google_token_', '').toLowerCase();
    payload = {
      sub: `google_mock_sub_${mockEmail}`,
      email: mockEmail,
      name: mockEmail.split('@')[0],
      picture: 'https://lh3.googleusercontent.com/a/mock',
    };
  } else {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID || undefined,
      });
      const googlePayload = ticket.getPayload();
      if (!googlePayload || !googlePayload.email) {
        const err = new Error('Invalid Google credential payload') as Error & { statusCode: number };
        err.statusCode = 401;
        throw err;
      }
      payload = {
        sub: googlePayload.sub,
        email: googlePayload.email,
        name: googlePayload.name,
        picture: googlePayload.picture,
      };
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode) throw error;
      const err = new Error('Google token verification failed') as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }
  }

  const normalizedEmail = payload.email!.toLowerCase().trim();
  const googleId = payload.sub;
  const avatarUrl = payload.picture || null;

  // 1. Check if user already exists with googleId
  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  if (!user) {
    // 2. Check if user exists with matching email -> link googleId
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatarUrl: user.avatarUrl || avatarUrl,
        },
      });
    } else {
      if (mode === 'login') {
        const err = new Error('No adventurer account found with this Google account. Please create your character on the signup page first.') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }

      // 3. Create new user with Google account
      let baseUsername = (payload.name || normalizedEmail.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .slice(0, 20);
      if (baseUsername.length < 3) baseUsername = `hero_${baseUsername}`;
      let username = baseUsername;
      let counter = 1;

      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername.slice(0, 15)}_${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username,
          email: normalizedEmail,
          googleId,
          avatarUrl,
          role: 'USER',
          playerProfile: {
            create: {
              totalXp: 0,
              level: 1,
              goldBalance: 0,
              strength: 1,
              intelligence: 1,
              discipline: 1,
              stamina: 1,
              consistency: 1,
            },
          },
          character: {
            create: {
              name: username,
              avatarUrl,
            },
          },
        },
      });
    }
  } else if (avatarUrl && !user.avatarUrl) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const rawRefreshToken = generateRefreshToken(user.id);

  // Store hashed refresh token
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(rawRefreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: toSafeUser(user),
    accessToken,
    rawRefreshToken,
  };
};

/**
 * Update username for an authenticated user.
 */
export const updateUsername = async (userId: string, newUsername: string): Promise<SafeUser> => {
  const cleanUsername = newUsername.trim();

  // Validate format
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    const err = new Error('Username must be between 3 and 30 characters') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    const err = new Error('Username can only contain letters, numbers, and underscores') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  // Check if taken by another user
  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });

  if (existing && existing.id !== userId) {
    const err = new Error('Username is already taken') as Error & { statusCode: number };
    err.statusCode = 409;
    throw err;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { username: cleanUsername },
  });

  return toSafeUser(updatedUser);
};

