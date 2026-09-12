import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth';

// ── Access Token ──────────────────────────────────────────────────────────────

export const generateAccessToken = (userId: string, role: UserRole): string => {
  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    role,
    type: 'access',
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

export const generateRefreshToken = (userId: string): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    type: 'refresh',
    jti: crypto.randomBytes(16).toString('hex'), // Unique token ID
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

// ── Token Hashing (for secure DB storage) ────────────────────────────────────

/**
 * SHA-256 hash of the raw refresh token for secure database storage.
 * We store the hash, never the raw token.
 */
export const hashToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

// ── Cookie Helpers ────────────────────────────────────────────────────────────

/** Returns expiry Date for the refresh token cookie (matches JWT_REFRESH_EXPIRES_IN) */
export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN; // e.g. "7d"
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);
  const ms: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * (ms[unit] ?? ms['d']));
};
