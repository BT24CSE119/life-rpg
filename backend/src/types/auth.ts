import { Request } from 'express';
import { UserRole } from '@prisma/client';

// ── JWT Payload ────────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;       // userId
  role: UserRole;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;       // userId
  type: 'refresh';
  jti?: string;      // Unique token ID (prevents hash collisions)
  iat?: number;
  exp?: number;
}

// ── Authenticated Request ─────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// ── DTO Shapes ────────────────────────────────────────────────────────────────

export interface SignupDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ── Safe User (never includes password hash) ──────────────────────────────────

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
