import apiClient from './api';
import type { Quest, CreateQuestInput, UpdateQuestInput, QuestStatusType, QuestPriority, QuestCompletionResult } from '../types';

// ── Response types ────────────────────────────────────────────────────────────

interface QuestsResponse {
  success: true;
  message: string;
  data: { quests: Quest[] };
}

interface QuestResponse {
  success: true;
  message: string;
  data: { quest: Quest };
}

interface CompletionResponse {
  success: true;
  message: string;
  data: QuestCompletionResult;
}

interface DeleteResponse {
  success: true;
  message: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const getQuests = async (filters?: {
  status?: QuestStatusType;
  priority?: QuestPriority;
}): Promise<Quest[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);

  const query = params.toString();
  const url = query ? `/quests?${query}` : '/quests';
  const { data } = await apiClient.get<QuestsResponse>(url);
  return data.data.quests;
};

export const getQuestById = async (id: string): Promise<Quest> => {
  const { data } = await apiClient.get<QuestResponse>(`/quests/${id}`);
  return data.data.quest;
};

export const createQuest = async (input: CreateQuestInput): Promise<Quest> => {
  const { data } = await apiClient.post<QuestResponse>('/quests', input);
  return data.data.quest;
};

export const updateQuest = async (id: string, input: UpdateQuestInput): Promise<Quest> => {
  const { data } = await apiClient.patch<QuestResponse>(`/quests/${id}`, input);
  return data.data.quest;
};

export const deleteQuest = async (id: string): Promise<void> => {
  await apiClient.delete<DeleteResponse>(`/quests/${id}`);
};

export const completeQuest = async (id: string): Promise<QuestCompletionResult> => {
  const { data } = await apiClient.post<CompletionResponse>(`/quests/${id}/complete`);
  return data.data;
};
