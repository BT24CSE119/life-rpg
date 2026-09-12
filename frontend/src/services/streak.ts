import apiClient from './api';
import type { StreakInfo, ApiSuccess } from '../types';

export const getStreak = async (): Promise<StreakInfo> => {
  const { data } = await apiClient.get<ApiSuccess<StreakInfo>>('/streak');
  return data.data;
};
