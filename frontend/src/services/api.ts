import axios from 'axios';
import type { HealthResponse } from '../types';

// ── Axios instance ─────────────────────────────────────────────────────────────
// In development, Vite proxies /api to http://localhost:3001 (see vite.config.ts)
// In production, set VITE_API_URL in .env
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Auth token will be injected here in Phase 2
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Check if the backend API is reachable and the database is connected.
 */
export const healthCheck = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
};
