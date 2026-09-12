import apiClient from './api';
import type { DashboardData, DashboardResponse } from '../types';

export const getDashboardData = async (): Promise<DashboardData> => {
  const { data } = await apiClient.get<DashboardResponse>('/dashboard');
  return data.data;
};
