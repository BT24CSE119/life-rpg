import { z } from 'zod';
import prisma from '../config/database';
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
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip sensitive fields — never return passwordHash */
const toSafeUser = (user: {
  id: string;
  username: string;
  email: string;
  role: SafeUser['role'];
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ── Service Functions ─────────────────────────────────────────────────────────

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
    const err = new Error('An account with this email already exists') as Error & { statusCode: number };
    err.statusCode = 409;
    throw err;
  }

  // Check for duplicate username
  const existingUsername = await prisma.user.findUnique({
    where: { username: dto.username },
  });
  if (existingUsername) {
    const err = new Error('This username is already taken') as Error & { statusCode: number };
    err.statusCode = 409;
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

  if (!user) {
    const err = new Error(GENERIC_ERROR) as Error & { statusCode: number };
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

  // 3. Check revoked
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
      createdAt: true,
      updatedAt: true,
    },
  });
  return user ? toSafeUser(user) : null;
};
