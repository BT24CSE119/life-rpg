import apiClient from './api';
import type { GoldHistoryResult, GoldWalletResult, LeaderboardEntry, RpgProfile, RpgStats, XpHistoryResult } from '../types';

export const getRpgProfile = async (): Promise<RpgProfile> => {
  const { data } = await apiClient.get<{ data: { profile: RpgProfile } }>('/rpg/profile');
  return data.data.profile;
};

export const getLeaderboard = async (sortBy: 'level' | 'streak' = 'level', limit = 20): Promise<LeaderboardEntry[]> => {
  const { data } = await apiClient.get<{ data: { leaderboard: LeaderboardEntry[] } }>('/rpg/leaderboard', {
    params: { sortBy, limit },
  });
  return data.data.leaderboard;
};

export const getXpHistory = async (page = 1, limit = 20): Promise<XpHistoryResult> => {
  const { data } = await apiClient.get<{ data: XpHistoryResult }>('/rpg/xp-history', { params: { page, limit } });
  return data.data;
};

export const getWallet = async (): Promise<GoldWalletResult> => {
  const { data } = await apiClient.get<{ data: GoldWalletResult }>('/rpg/wallet');
  return data.data;
};

export const getGoldHistory = async (page = 1, limit = 20): Promise<GoldHistoryResult> => {
  const { data } = await apiClient.get<{ data: GoldHistoryResult }>('/rpg/gold-history', { params: { page, limit } });
  return data.data;
};

export const getRpgStats = async (): Promise<RpgStats> => {
  const { data } = await apiClient.get<{ data: { stats: RpgStats } }>('/rpg/stats');
  return data.data.stats;
};

