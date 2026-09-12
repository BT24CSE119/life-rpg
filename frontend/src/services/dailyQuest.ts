import apiClient from './api';
import type { DailyQuest, DailyQuestCompletionResult, ApiSuccess } from '../types';

export const getDailyQuests = async (date?: string): Promise<DailyQuest[]> => {
  const { data } = await apiClient.get<ApiSuccess<DailyQuest[]>>('/daily-quests', {
    params: date ? { date } : undefined,
  });
  return data.data;
};

export const generateDailyQuests = async (date?: string): Promise<DailyQuest[]> => {
  const { data } = await apiClient.post<ApiSuccess<DailyQuest[]>>('/daily-quests/generate', { date });
  return data.data;
};

export const completeDailyQuest = async (id: string): Promise<DailyQuestCompletionResult> => {
  const { data } = await apiClient.post<ApiSuccess<DailyQuestCompletionResult>>(`/daily-quests/${id}/complete`);
  return data.data;
};
