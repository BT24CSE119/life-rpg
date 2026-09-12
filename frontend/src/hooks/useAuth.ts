import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Access the authentication context.
 * Must be used inside <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
