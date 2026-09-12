import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Shows a loading skeleton while session is being restored.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-rpg-text-muted font-medium text-xs font-mono tracking-wider uppercase">Restoring Session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the original destination for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
