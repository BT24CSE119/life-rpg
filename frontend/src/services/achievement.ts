import apiClient from './api';
import type { AchievementsData, AchievementItem, ApiSuccess } from '../types';

export const getAchievements = async (): Promise<AchievementsData> => {
  const { data } = await apiClient.get<ApiSuccess<AchievementsData>>('/achievements');
  return data.data;
};

export const getUnlockedAchievements = async (): Promise<AchievementItem[]> => {
  const { data } = await apiClient.get<ApiSuccess<AchievementItem[]>>('/achievements/unlocked');
  return data.data;
};
