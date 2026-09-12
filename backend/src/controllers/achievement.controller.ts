import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getAchievements, getUnlockedAchievements } from '../services/achievement.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getAchievementsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const data = await getAchievements(userId);
    res.status(200).json({
      success: true,
      message: 'Achievements retrieved',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnlockedAchievementsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const unlocked = await getUnlockedAchievements(userId);
    res.status(200).json({
      success: true,
      message: 'Unlocked achievements retrieved',
      data: unlocked,
    });
  } catch (err) {
    next(err);
  }
};
