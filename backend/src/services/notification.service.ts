import prisma from '../config/database';
import { NotificationType, Prisma } from '@prisma/client';

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
  tx?: Prisma.TransactionClient
) => {
  const client = tx || prisma;
  return client.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
};

export const getNotifications = async (userId: string, page = 1, limit = 20) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items,
    unreadCount,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getUnreadNotificationCount = async (userId: string) => {
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount };
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) {
    const error = new Error('Notification not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  if (existing.isRead) {
    return existing;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
};
