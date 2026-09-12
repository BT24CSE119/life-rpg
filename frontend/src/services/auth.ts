import apiClient, { setAccessToken } from './api';
import type { User, SignupDto, LoginDto, AuthResponse } from '../types';

// ── Auth Service ───────────────────────────────────────────────────────────────

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
