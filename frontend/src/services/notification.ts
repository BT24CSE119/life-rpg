import apiClient from './api';
import type { NotificationsData, NotificationItem, ApiSuccess } from '../types';

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsData> => {
  const { data } = await apiClient.get<ApiSuccess<NotificationsData>>('/notifications', {
    params: { page, limit },
  });
  return data.data;
};

export const getUnreadNotificationCount = async (): Promise<{ unreadCount: number }> => {
  const { data } = await apiClient.get<ApiSuccess<{ unreadCount: number }>>('/notifications/unread-count');
  return data.data;
};

export const markNotificationAsRead = async (id: string): Promise<NotificationItem> => {
  const { data } = await apiClient.patch<ApiSuccess<NotificationItem>>(`/notifications/${id}/read`);
  return data.data;
};

export const markAllNotificationsAsRead = async (): Promise<{ updatedCount: number }> => {
  const { data } = await apiClient.post<ApiSuccess<{ updatedCount: number }>>('/notifications/read-all');
  return data.data;
};
