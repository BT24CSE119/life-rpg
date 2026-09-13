import axios, { AxiosRequestConfig } from 'axios';
import type { HealthResponse } from '../types';

// ── Axios instance ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000, // 30s — accommodates Render free tier cold-start (~15s)
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for HttpOnly refresh cookie
});

// ── In-memory & persisted access token store ───────────────────────────────────
const STORAGE_KEY = 'life_rpg_access_token';
let _accessToken: string | null = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null);

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

export const getAccessToken = (): string | null => _accessToken;

// ── Request interceptor — inject Authorization header ─────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — 401 → attempt silent refresh ───────────────────────
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

const processQueue = (token: string | null, error: Error | null): void => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error!);
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and only once per request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue subsequent 401s while refresh is in flight
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ data: { accessToken: string } }>(
          '/auth/refresh'
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(newToken, null);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(null, new Error('Session expired'));
        // Let the app handle the redirect (AuthContext will detect null user)
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, extract a readable message
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

// ── Service functions ─────────────────────────────────────────────────────────

export const healthCheck = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
};
