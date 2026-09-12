import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as loginService, loginWithGoogle as googleLoginService, logout as logoutService, refreshSession } from '../services/auth';
import type { User, LoginDto } from '../types';

// ── Context Shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  loginWithGoogle: (credential: string, mode?: 'login' | 'signup') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // ── Restore session on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const result = await refreshSession();
        if (!cancelled) {
          setUser(result?.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (dto: LoginDto): Promise<void> => {
    const { user: loggedInUser } = await loginService(dto);
    setUser(loggedInUser);
  }, []);

  // ── Login with Google ────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (credential: string, mode?: 'login' | 'signup'): Promise<void> => {
    const { user: loggedInUser } = await googleLoginService(credential, mode);
    setUser(loggedInUser);
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await logoutService();
    setUser(null);
  }, []);

  // ── Update User Directly ──────────────────────────────────────────────────────
  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
