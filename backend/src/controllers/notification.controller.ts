import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getNotificationsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await getNotifications(userId, page, limit);
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCountHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const result = await getUnreadNotificationCount(userId);
    res.status(200).json({
      success: true,
      message: 'Unread count retrieved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsReadHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await markNotificationAsRead(userId, id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsReadHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const result = await markAllNotificationsAsRead(userId);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
