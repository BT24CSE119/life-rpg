import apiClient, { setAccessToken } from './api';
import type { User, SignupDto, LoginDto, AuthResponse } from '../types';

// ── Auth Service ───────────────────────────────────────────────────────────────

/**
 * Check if a username is available, and get suggestions if taken.
 */
export const checkUsername = async (
  username: string
): Promise<{ available: boolean; suggestions?: string[] }> => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { available: boolean; suggestions?: string[] };
  }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
  return data.data;
};

/**
 * Register a new user account.
 * Does NOT issue tokens — user must login after signup.
 */
export const signup = async (dto: SignupDto): Promise<{ user: User }> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', dto);
  return { user: data.data.user };
};

/**
 * Authenticate with email and password.
 * Stores the access token in memory and sets the refresh cookie (via HttpOnly).
 */
export const login = async (dto: LoginDto): Promise<{ user: User; accessToken: string }> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', dto);
  const { user, accessToken } = data.data;
  if (!accessToken) throw new Error('No access token returned');
  setAccessToken(accessToken);
  return { user, accessToken };
};

/**
 * Authenticate or register with Google OAuth 2.0 credential.
 */
export const loginWithGoogle = async (credential: string, mode?: 'login' | 'signup'): Promise<{ user: User; accessToken: string }> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/google', { credential, mode });
  const { user, accessToken } = data.data;
  if (!accessToken) throw new Error('No access token returned');
  setAccessToken(accessToken);
  return { user, accessToken };
};

/**
 * Log out — clears in-memory token and revokes server-side refresh token.
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Always clear local token even if server call fails
    setAccessToken(null);
  }
};

/**
 * Get the currently authenticated user (requires valid access token).
 */
export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<{ success: true; data: { user: User } }>('/auth/me');
  return data.data.user;
};

/**
 * Attempt to restore session from the HttpOnly refresh cookie.
 * Called on app startup to silently re-authenticate returning users.
 */
export const refreshSession = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    // 1. If we already have a valid persisted access token, verify it with getMe()
    const currentToken = (typeof window !== 'undefined' ? localStorage.getItem('life_rpg_access_token') : null);
    if (currentToken) {
      try {
        setAccessToken(currentToken);
        const user = await getMe();
        return { user, accessToken: currentToken };
      } catch {
        // Token was expired or invalid, proceed to refresh cookie
      }
    }

    // 2. Otherwise exchange HttpOnly refresh cookie for a new session
    const { data } = await apiClient.post<{ success: true; data: { accessToken: string } }>(
      '/auth/refresh'
    );
    const accessToken = data.data.accessToken;
    setAccessToken(accessToken);
    const user = await getMe();
    return { user, accessToken };
  } catch {
    setAccessToken(null);
    return null;
  }
};

/**
 * Update authenticated user's profile / username.
 */
export const updateUsername = async (username: string): Promise<User> => {
  const { data } = await apiClient.patch<{ success: true; data: { user: User } }>('/auth/me', {
    username,
  });
  return data.data.user;
};

