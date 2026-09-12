import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getStreak } from '../services/streak.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getStreakHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const streak = await getStreak(userId);
    res.status(200).json({
      success: true,
      message: 'Productivity streak data retrieved',
      data: streak,
    });
  } catch (err) {
    next(err);
  }
};
