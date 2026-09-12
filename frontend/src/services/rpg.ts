import apiClient from './api';
import type { RpgProfile, RpgStats, XpHistoryResult } from '../types';

export const getRpgProfile = async (): Promise<RpgProfile> => {
  const { data } = await apiClient.get<{ data: { profile: RpgProfile } }>('/rpg/profile');
  return data.data.profile;
};

export const getXpHistory = async (page = 1, limit = 20): Promise<XpHistoryResult> => {
  const { data } = await apiClient.get<{ data: XpHistoryResult }>('/rpg/xp-history', { params: { page, limit } });
  return data.data;
};

export const getRpgStats = async (): Promise<RpgStats> => {
  const { data } = await apiClient.get<{ data: { stats: RpgStats } }>('/rpg/stats');
  return data.data.stats;
};
