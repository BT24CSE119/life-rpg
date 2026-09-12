import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as loginService, logout as logoutService, refreshSession } from '../services/auth';
import type { User, LoginDto } from '../types';

// ── Context Shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
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

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await logoutService();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
